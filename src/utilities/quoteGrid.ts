export const TEXT_COLUMN_FILTER = 'agTextColumnFilter';

export type PriceSnapshot = {
  yearStartEOD: string | null;
  lastEOD: string | null;
  previousDayEOD: string | null;
};

export type LatestAlert = {
  type: string;
  date: string;
};

export type QuoteGridRow = {
  symbol: string;
  name?: string | null;
  sector?: string | null;
  industry?: string | null;
  lastEOD?: string | number | null;
  yearStartEOD?: string | number | null;
  previousDayEOD?: string | number | null;
  dayOverDay?: string | number | null;
  type?: string | null;
  date?: string | null;
};

/** Fields that use the same AG Grid text filter as the alert type column. */
export const QUOTE_TEXT_FILTER_FIELDS = ['name', 'sector', 'industry'] as const;

export function formatRecentSignal(
  type?: string | null,
  date?: string | null,
): string {
  const signal = String(type ?? '').trim();
  if (!signal) return '';
  const when = String(date ?? '').trim();
  return when ? `${signal} on ${when}` : signal;
}

export function withPriceSnapshot<T extends { symbol: string }>(
  rows: T[],
  prices: Record<string, PriceSnapshot>,
): Array<T & PriceSnapshot> {
  return rows.map((row) => ({
    ...row,
    yearStartEOD: prices[row.symbol]?.yearStartEOD ?? null,
    lastEOD: prices[row.symbol]?.lastEOD ?? null,
    previousDayEOD: prices[row.symbol]?.previousDayEOD ?? null,
  }));
}

/** First row per symbol wins. Pass rows newest-first. */
export function pickLatestAlerts(
  rows: Array<{ symbol: string; type: string; date: string }>,
): Record<string, LatestAlert> {
  const latest: Record<string, LatestAlert> = {};
  for (const row of rows) {
    if (latest[row.symbol]) continue;
    latest[row.symbol] = { type: row.type, date: row.date };
  }
  return latest;
}

export function withLatestAlert<T extends { symbol: string }>(
  rows: T[],
  alerts: Record<string, LatestAlert>,
): Array<T & { type: string | null; date: string | null }> {
  return rows.map((row) => ({
    ...row,
    type: alerts[row.symbol]?.type ?? null,
    date: alerts[row.symbol]?.date ?? null,
  }));
}

export function buildSymbolListRows(
  symbols: Array<{
    symbol: string;
    name: string;
    sector: string | null;
    industry: string | null;
  }>,
  prices: Record<string, PriceSnapshot>,
  alerts: Record<string, LatestAlert>,
): QuoteGridRow[] {
  return withLatestAlert(withPriceSnapshot(symbols, prices), alerts);
}
