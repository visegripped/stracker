/** Calendar date in a named timezone as YYYY-MM-DD. */
export function formatDateInTimeZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Pacific trading date — daily cron runs at 01:00 UTC, which is still the prior evening PT. */
export function pacificTradingDate(now = new Date()): string {
  return formatDateInTimeZone(now, 'America/Los_Angeles');
}
