import 'server-only';
import { formatUnknownError, TiingoRateLimitError } from './errors';

export interface HistoryRow {
  date: string;
  eod: number;
}

const DEFAULT_SYMBOL_ALIASES: Record<string, string> = {
  SGH: 'PENG', // SMART Global Holdings → Penguin Solutions
};

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

/** Two years ago as YYYY-MM-DD (Tiingo startDate). */
export function twoYearsAgoDate(): string {
  return new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

export function getTiingoToken(): string {
  const token = process.env.TIINGO_API_TOKEN?.trim();
  if (!token) {
    throw new Error('TIINGO_API_TOKEN is not set');
  }
  return token;
}

/** Resolve the Tiingo ticker to request for a sheet symbol. */
export function resolveTiingoSymbol(symbol: string): {
  sheetSymbol: string;
  tiingoSymbol: string;
} {
  const sheetSymbol = symbol.trim().toUpperCase();
  const aliases = {
    ...DEFAULT_SYMBOL_ALIASES,
    ...parseAliasEnv(process.env.YAHOO_SYMBOL_ALIASES),
    ...parseAliasEnv(process.env.TIINGO_SYMBOL_ALIASES),
  };
  return { sheetSymbol, tiingoSymbol: aliases[sheetSymbol] ?? sheetSymbol };
}

type TiingoPrice = {
  date?: string;
  adjClose?: number | null;
  close?: number | null;
};

/** Parse Tiingo daily price JSON into dated EOD closes (adjClose, falling back to close). */
export function parseTiingoPrices(json: unknown): HistoryRow[] {
  if (!Array.isArray(json)) {
    throw new Error(
      `Tiingo response was not a price array (${snippet(JSON.stringify(json))})`,
    );
  }

  const rows: HistoryRow[] = [];
  for (const item of json as TiingoPrice[]) {
    const rawDate = item.date?.slice(0, 10);
    const price = item.adjClose ?? item.close;
    if (!rawDate || price == null || !isFinite(price) || price <= 0) continue;
    rows.push({ date: rawDate, eod: price });
  }

  if (rows.length === 0) {
    throw new Error(
      `Tiingo returned no usable closes (${Array.isArray(json) ? json.length : 0} bars)`,
    );
  }

  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Fetch historical EOD data for a symbol from Tiingo.
 * Returns rows sorted ascending by date.
 */
export async function fetchTiingoHistory(
  symbol: string,
  startDate = twoYearsAgoDate(),
  endDate = new Date().toISOString().slice(0, 10),
): Promise<HistoryRow[]> {
  const { tiingoSymbol } = resolveTiingoSymbol(symbol);
  const token = getTiingoToken();
  const url =
    `https://api.tiingo.com/tiingo/daily/${encodeURIComponent(tiingoSymbol)}/prices` +
    `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    throw new Error(
      `Tiingo fetch failed for ${symbol}: ${formatUnknownError(err)}`,
    );
  }

  const text = await res.text();

  if (res.status === 429 || res.status === 503) {
    throw new TiingoRateLimitError(
      `Tiingo HTTP ${res.status}: ${snippet(text) || res.statusText}`,
      res.status,
    );
  }

  if (!res.ok) {
    const aliasNote =
      tiingoSymbol !== symbol.toUpperCase() ? ` as ${tiingoSymbol}` : '';
    throw new Error(
      `Tiingo returned no history for ${symbol}${aliasNote} (HTTP ${res.status}: ${snippet(text) || res.statusText})`,
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    throw new Error(
      `Tiingo HTTP ${res.status}: response was not JSON (${snippet(text)})`,
    );
  }

  try {
    return parseTiingoPrices(json);
  } catch (err) {
    const aliasNote =
      tiingoSymbol !== symbol.toUpperCase() ? ` as ${tiingoSymbol}` : '';
    throw new Error(
      `Tiingo returned no history for ${symbol}${aliasNote} (${formatUnknownError(err)})`,
    );
  }
}
