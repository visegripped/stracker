export type AlertTypeFilter = 'all' | 'buy' | 'sell';

export const ALERT_TYPE_FILTERS: { id: AlertTypeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'buy', label: 'Buy only' },
  { id: 'sell', label: 'Sell only' },
];

export function matchesAlertTypeFilter(type: string | null | undefined, filter: AlertTypeFilter): boolean {
  if (filter === 'all') return true;
  return String(type ?? '').toLowerCase().includes(filter);
}

/** AG Grid community text-filter model for the type column. Set filter is enterprise-only. */
export function alertTypeColumnFilterModel(filter: AlertTypeFilter) {
  if (filter === 'all') return null;
  return {
    filterType: 'text' as const,
    type: 'contains' as const,
    filter,
  };
}
