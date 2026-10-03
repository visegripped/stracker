/** Query flag that opts into Tiingo missed-day catch-up. Off unless explicitly set. */
export const CATCHUP_QUERY_PARAM = 'catchup';

export function isCatchupRequested(
  searchParams: URLSearchParams | { get: (name: string) => string | null },
): boolean {
  const raw = searchParams.get(CATCHUP_QUERY_PARAM);
  if (raw == null) return false;
  const value = raw.trim().toLowerCase();
  return value === '1' || value === 'true' || value === 'yes';
}
