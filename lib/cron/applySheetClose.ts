import type { EodRow } from '../indicators';

/** Overlay the sheet close for `tradeDate`, whether or not a bar already exists. */
export function applySheetClose(
  history: EodRow[],
  tradeDate: string,
  eod: string,
): EodRow[] {
  const withoutToday = history.filter((row) => row.date !== tradeDate);
  withoutToday.push({ date: tradeDate, eod });
  return withoutToday;
}
