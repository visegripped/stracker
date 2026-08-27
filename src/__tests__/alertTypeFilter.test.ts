import { describe, it, expect } from 'vitest';
import {
  ALERT_TYPE_FILTERS,
  alertTypeColumnFilterModel,
  matchesAlertTypeFilter,
} from '../utilities/alertTypeFilter';

describe('matchesAlertTypeFilter', () => {
  it('lets every type through when the filter is all', () => {
    expect(matchesAlertTypeFilter('P0-buy', 'all')).toBe(true);
    expect(matchesAlertTypeFilter('P1-sell', 'all')).toBe(true);
  });

  it('matches buy and sell substrings', () => {
    expect(matchesAlertTypeFilter('P0-buy', 'buy')).toBe(true);
    expect(matchesAlertTypeFilter('P2-sell', 'buy')).toBe(false);
    expect(matchesAlertTypeFilter('P1-sell', 'sell')).toBe(true);
    expect(matchesAlertTypeFilter('P0-buy', 'sell')).toBe(false);
  });
});

describe('alertTypeColumnFilterModel', () => {
  it('clears the type column for All', () => {
    expect(alertTypeColumnFilterModel('all')).toBeNull();
  });

  it('uses a contains text filter for buy/sell', () => {
    expect(alertTypeColumnFilterModel('buy')).toEqual({
      filterType: 'text',
      type: 'contains',
      filter: 'buy',
    });
    expect(alertTypeColumnFilterModel('sell')?.filter).toBe('sell');
  });

  it('exposes the three toolbar buttons', () => {
    expect(ALERT_TYPE_FILTERS.map((f) => f.label)).toEqual(['All', 'Buy only', 'Sell only']);
  });
});
