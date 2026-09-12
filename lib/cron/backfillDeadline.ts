/** Leave this much time to persist the current symbol and return JSON before Vercel kills the function. */
export const BACKFILL_DEADLINE_SAFETY_MS = 8_000;

export function shouldStopBackfill(
  now: number,
  deadlineAt: number | undefined,
  safetyMs = BACKFILL_DEADLINE_SAFETY_MS,
): boolean {
  return deadlineAt != null && now + safetyMs >= deadlineAt;
}

export function prependUnprocessedToPending(
  batch: Array<{ symbol: string }>,
  nextIndex: number,
  pending: string[],
): string[] {
  return [...batch.slice(nextIndex).map((r) => r.symbol), ...pending];
}
