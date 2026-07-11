import 'server-only';

export interface YahooRow {
  date: string;
  eod: number;
}

/** Two years of history as a Unix timestamp */
export function twoYearsAgo(): number {
  return Math.floor((Date.now() - 2 * 365 * 24 * 60 * 60 * 1000) / 1000);
}

/** Parse Yahoo Finance CSV (header row: Date,Open,High,Low,Close,Adj Close,Volume). */
function parseYahooCsv(csv: string): YahooRow[] {
  const lines = csv.trim().split('\n');
  const rows: YahooRow[] = [];
  // skip header row (index 0)
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

/** Fetch Yahoo Finance chart API (JSON) as a fallback when CSV is unavailable. */
async function fetchYahooChartApi(
  symbol: string,
  period1: number,
  period2: number
): Promise<YahooRow[]> {
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}` +
    `?period1=${period1}&period2=${period2}&interval=1d&events=history`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) return [];

  const json = (await res.json()) as {
    chart?: {
      result?: Array<{
        timestamp?: number[];
        indicators?: { adjclose?: Array<{ adjclose?: number[] }> };
      }>;
    };
  };

  const result = json?.chart?.result?.[0];
  if (!result) return [];

  const timestamps = result.timestamp ?? [];
  const closes = result.indicators?.adjclose?.[0]?.adjclose ?? [];
  const rows: YahooRow[] = [];

  for (let i = 0; i < timestamps.length; i++) {
    const ts = timestamps[i];
    const close = closes[i];
    if (ts == null || close == null || !isFinite(close) || close <= 0) continue;
    const date = new Date(ts * 1000).toISOString().slice(0, 10);
    rows.push({ date, eod: close });
  }

  return rows;
}

/**
 * Fetch historical EOD data for a symbol from Yahoo Finance.
 * Tries CSV first, falls back to chart API.
 * Returns rows sorted ascending by date.
 */
export async function fetchYahooHistory(
  symbol: string,
  period1 = twoYearsAgo(),
  period2 = Math.floor(Date.now() / 1000)
): Promise<YahooRow[]> {
  const csvUrl =
    `https://query1.finance.yahoo.com/v7/finance/download/${symbol}` +
    `?period1=${period1}&period2=${period2}&interval=1d&events=history&includeAdjustedClose=true`;

  try {
    const res = await fetch(csvUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(15_000),
    });

    if (res.ok) {
      const text = await res.text();
      const rows = parseYahooCsv(text);
      if (rows.length > 0) {
        return rows.sort((a, b) => a.date.localeCompare(b.date));
      }
    }
  } catch {
    // CSV unavailable — fall through to chart API
  }

  // Brief pause so a failed CSV request doesn't immediately trigger chart API rate limits
  await new Promise((r) => setTimeout(r, 2000));

  const rows = await fetchYahooChartApi(symbol, period1, period2);
  return rows.sort((a, b) => a.date.localeCompare(b.date));
}
