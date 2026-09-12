import 'server-only';
import {
  formatUnknownError,
  isYahooRateLimitError,
  YahooRateLimitError,
} from './errors';

export interface YahooRow {
  date: string;
  eod: number;
}

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const CHART_HOSTS = [
  'query2.finance.yahoo.com',
  'query1.finance.yahoo.com',
] as const;

function isServerless(): boolean {
  return Boolean(process.env.VERCEL);
}

/** Known ticker changes so backfill can still load history under the sheet symbol. */
const DEFAULT_SYMBOL_ALIASES: Record<string, string> = {
  SGH: 'PENG', // SMART Global Holdings → Penguin Solutions
};

type YahooSession = {
  cookie: string;
  crumb: string | null;
};

let cachedSession: YahooSession | Promise<YahooSession> | null = null;

/** Two years of history as a Unix timestamp */
export function twoYearsAgo(): number {
  return Math.floor((Date.now() - 2 * 365 * 24 * 60 * 60 * 1000) / 1000);
}

/** Clear cached Yahoo cookies/crumb. Used by tests. */
export function resetYahooSession(): void {
  cachedSession = null;
}

function snippet(text: string, max = 180): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, max);
}

function parseAliasEnv(raw: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw) return out;
  for (const pair of raw.split(',')) {
    const [from, to] = pair.split(':').map((s) => s.trim().toUpperCase());
    if (from && to) out[from] = to;
  }
  return out;
}

/** Resolve the Yahoo ticker to request for a sheet symbol. */
export function resolveYahooSymbol(symbol: string): {
  sheetSymbol: string;
  yahooSymbol: string;
} {
  const sheetSymbol = symbol.trim().toUpperCase();
  const aliases = {
    ...DEFAULT_SYMBOL_ALIASES,
    ...parseAliasEnv(process.env.YAHOO_SYMBOL_ALIASES),
  };
  return { sheetSymbol, yahooSymbol: aliases[sheetSymbol] ?? sheetSymbol };
}

function cookieMapFromHeader(header: string): Map<string, string> {
  const cookies = new Map<string, string>();
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (name && value) cookies.set(name, value);
  }
  return cookies;
}

function cookieHeaderFromMap(cookies: Map<string, string>): string {
  return [...cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
}

function setCookiesFromResponse(res: Response): string[] {
  if (typeof res.headers.getSetCookie === 'function') {
    return res.headers.getSetCookie();
  }
  const single = res.headers.get('set-cookie');
  return single ? [single] : [];
}

function mergeSetCookies(cookies: Map<string, string>, res: Response): void {
  for (const raw of setCookiesFromResponse(res)) {
    const first = raw.split(';')[0];
    const idx = first.indexOf('=');
    if (idx <= 0) continue;
    const name = first.slice(0, idx).trim();
    const value = first.slice(idx + 1).trim();
    const lower = raw.toLowerCase();
    if (!name || !value || value === 'delete' || /max-age=0\b/.test(lower))
      continue;
    cookies.set(name, value);
  }
}

function yahooHeaders(cookie: string): Record<string, string> {
  const headers: Record<string, string> = {
    'User-Agent': BROWSER_UA,
    Accept: 'application/json,text/csv;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  };
  if (cookie) headers.Cookie = cookie;
  return headers;
}

function isUsableCrumb(text: string): boolean {
  const crumb = text.trim();
  return (
    Boolean(crumb) &&
    crumb.length < 80 &&
    !crumb.startsWith('<') &&
    !crumb.startsWith('{')
  );
}

async function fetchYahooSession(): Promise<YahooSession> {
  const envCookie = process.env.YAHOO_COOKIE?.trim();
  const cookies = envCookie
    ? cookieMapFromHeader(envCookie)
    : new Map<string, string>();
  const sessionTimeoutMs = isServerless() ? 8_000 : 10_000;

  // A logged-in Cookie header already has the session; skip the extra handshake.
  if (!envCookie) {
    try {
      const res = await fetch('https://fc.yahoo.com/', {
        headers: yahooHeaders(cookieHeaderFromMap(cookies)),
        redirect: 'manual',
        cache: 'no-store',
        signal: AbortSignal.timeout(sessionTimeoutMs),
      });
      mergeSetCookies(cookies, res);
    } catch {
      // Chart often works without the consent cookie.
    }
  }

  let crumb: string | null = null;
  try {
    const crumbRes = await fetch(
      'https://query2.finance.yahoo.com/v1/test/getcrumb',
      {
        headers: yahooHeaders(cookieHeaderFromMap(cookies)),
        cache: 'no-store',
        signal: AbortSignal.timeout(sessionTimeoutMs),
      },
    );
    mergeSetCookies(cookies, crumbRes);
    if (crumbRes.status === 429 || crumbRes.status === 503) {
      throw new YahooRateLimitError(
        `Yahoo crumb HTTP ${crumbRes.status}: ${snippet(await crumbRes.text()) || crumbRes.statusText}`,
        crumbRes.status,
      );
    }
    const text = await crumbRes.text();
    if (crumbRes.ok && isUsableCrumb(text)) crumb = text.trim();
  } catch (err) {
    if (isYahooRateLimitError(err)) throw err;
    // Chart often works without a crumb.
  }

  return { cookie: cookieHeaderFromMap(cookies), crumb };
}

async function getYahooSession(): Promise<YahooSession> {
  if (cachedSession) return cachedSession;
  cachedSession = fetchYahooSession().catch((err) => {
    cachedSession = null;
    throw err;
  });
  return cachedSession;
}

async function yahooGet(url: string, session: YahooSession): Promise<Response> {
  const parsed = new URL(url);
  if (session.crumb && !parsed.searchParams.has('crumb')) {
    parsed.searchParams.set('crumb', session.crumb);
  }

  const timeoutMs = isServerless() ? 8_000 : 15_000;
  const maxAttempts = isServerless() ? 1 : 3;
  const retryBaseMs = 2000;

  let last: Response | undefined;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    last = await fetch(parsed, {
      headers: yahooHeaders(session.cookie),
      cache: 'no-store',
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (last.status !== 429 && last.status !== 503) return last;
    if (attempt === maxAttempts - 1) {
      throw new YahooRateLimitError(
        `Yahoo HTTP ${last.status}: ${snippet(await last.text()) || last.statusText}`,
        last.status,
      );
    }
    const retryAfter = Number(last.headers.get('retry-after'));
    const waitMs =
      Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(retryAfter * 1000, 8_000)
        : retryBaseMs * (attempt + 1);
    await new Promise((r) => setTimeout(r, waitMs));
  }
  throw new YahooRateLimitError(
    `Yahoo HTTP ${last?.status ?? 429}: ${last?.statusText ?? 'Too Many Requests'}`,
    last?.status ?? 429,
  );
}

/** Parse Yahoo Finance CSV (header row: Date,Open,High,Low,Close,Adj Close,Volume). */
export function parseYahooCsv(csv: string): YahooRow[] {
  const lines = csv.trim().split('\n');
  const rows: YahooRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const date = cols[0]?.trim();
    const close = parseFloat(cols[4] ?? '');
    if (date && isFinite(close) && close > 0) {
      rows.push({ date, eod: close });
    }
  }
  return rows;
}

type YahooChartJson = {
  chart?: {
    error?: { code?: string; description?: string };
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{ close?: Array<number | null> }>;
        adjclose?: Array<{ adjclose?: Array<number | null> }>;
      };
    }>;
  };
};

/** Parse Yahoo chart API JSON into dated EOD closes (adj close, falling back to close). */
export function parseYahooChart(json: YahooChartJson): YahooRow[] {
  const chartError = json?.chart?.error;
  if (chartError) {
    const detail =
      chartError.description || chartError.code || JSON.stringify(chartError);
    throw new Error(`chart error: ${detail}`);
  }

  const result = json?.chart?.result?.[0];
  if (!result) {
    throw new Error('chart HTTP 200: empty result');
  }

  const timestamps = result.timestamp ?? [];
  const adj = result.indicators?.adjclose?.[0]?.adjclose ?? [];
  const close = result.indicators?.quote?.[0]?.close ?? [];
  const rows: YahooRow[] = [];

  for (let i = 0; i < timestamps.length; i++) {
    const ts = timestamps[i];
    const price = adj[i] ?? close[i];
    if (ts == null || price == null || !isFinite(price) || price <= 0) continue;
    const date = new Date(ts * 1000).toISOString().slice(0, 10);
    rows.push({ date, eod: price });
  }

  if (rows.length === 0) {
    throw new Error(
      `chart HTTP 200: no usable closes (${timestamps.length} timestamps)`,
    );
  }

  return rows;
}

async function fetchYahooChartApi(
  yahooSymbol: string,
  period1: number,
  period2: number,
  session: YahooSession,
): Promise<YahooRow[]> {
  const notes: string[] = [];
  const hosts = isServerless() ? CHART_HOSTS.slice(0, 1) : CHART_HOSTS;

  for (const host of hosts) {
    const url =
      `https://${host}/v8/finance/chart/${encodeURIComponent(yahooSymbol)}` +
      `?period1=${period1}&period2=${period2}&interval=1d&events=history`;

    try {
      const res = await yahooGet(url, session);
      const text = await res.text();
      if (!res.ok) {
        if (res.status === 429 || res.status === 503) {
          throw new YahooRateLimitError(
            `${host} HTTP ${res.status}: ${snippet(text) || res.statusText}`,
            res.status,
          );
        }
        notes.push(
          `${host} HTTP ${res.status}: ${snippet(text) || res.statusText}`,
        );
        continue;
      }
      let json: YahooChartJson;
      try {
        json = JSON.parse(text) as YahooChartJson;
      } catch {
        notes.push(
          `${host} HTTP ${res.status}: response was not JSON (${snippet(text)})`,
        );
        continue;
      }
      return parseYahooChart(json);
    } catch (err) {
      if (isYahooRateLimitError(err)) throw err;
      notes.push(`${host} ${formatUnknownError(err)}`);
    }
  }

  throw new Error(notes.join('; ') || 'chart fetch failed');
}

async function fetchYahooCsvDownload(
  yahooSymbol: string,
  period1: number,
  period2: number,
  session: YahooSession,
): Promise<YahooRow[]> {
  const csvUrl =
    `https://query1.finance.yahoo.com/v7/finance/download/${encodeURIComponent(yahooSymbol)}` +
    `?period1=${period1}&period2=${period2}&interval=1d&events=history&includeAdjustedClose=true`;

  const res = await yahooGet(csvUrl, session);
  const text = await res.text();
  if (!res.ok) {
    if (res.status === 429 || res.status === 503) {
      throw new YahooRateLimitError(
        `csv HTTP ${res.status}: ${snippet(text) || res.statusText}`,
        res.status,
      );
    }
    throw new Error(
      `csv HTTP ${res.status}: ${snippet(text) || res.statusText}`,
    );
  }
  const rows = parseYahooCsv(text);
  if (rows.length === 0) {
    throw new Error(
      `csv HTTP ${res.status}: parsed 0 rows from ${text.length} bytes`,
    );
  }
  return rows;
}

/**
 * Fetch historical EOD data for a symbol from Yahoo Finance.
 * Uses the chart API (CSV download requires a logged-in session and is often 401).
 * Returns rows sorted ascending by date.
 */
export async function fetchYahooHistory(
  symbol: string,
  period1 = twoYearsAgo(),
  period2 = Math.floor(Date.now() / 1000),
): Promise<YahooRow[]> {
  const { yahooSymbol } = resolveYahooSymbol(symbol);
  const session = await getYahooSession();
  const notes: string[] = [];

  try {
    const rows = await fetchYahooChartApi(
      yahooSymbol,
      period1,
      period2,
      session,
    );
    return rows.sort((a, b) => a.date.localeCompare(b.date));
  } catch (err) {
    if (isYahooRateLimitError(err)) throw err;
    notes.push(formatUnknownError(err));
  }

  // CSV download is retired for anonymous clients. Skip it on Vercel so a
  // 401/timeout cannot burn the remaining serverless budget.
  if (process.env.YAHOO_COOKIE?.trim() && !isServerless()) {
    try {
      const rows = await fetchYahooCsvDownload(
        yahooSymbol,
        period1,
        period2,
        session,
      );
      return rows.sort((a, b) => a.date.localeCompare(b.date));
    } catch (err) {
      if (isYahooRateLimitError(err)) throw err;
      notes.push(formatUnknownError(err));
    }
  }

  const aliasNote =
    yahooSymbol !== symbol.toUpperCase() ? ` as ${yahooSymbol}` : '';
  throw new Error(
    `Yahoo returned no history for ${symbol}${aliasNote} (${notes.join('; ')})`,
  );
}
