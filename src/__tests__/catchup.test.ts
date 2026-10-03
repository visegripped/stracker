import { describe, expect, it } from 'vitest';
import {
  nextIsoDay,
  selectStaleSymbols,
  toIsoDate,
} from '../../lib/cron/catchup';
import { isCatchupRequested } from '../../lib/cron/catchupRequest';

describe('nextIsoDay', () => {
  it('advances within the same month', () => {
    expect(nextIsoDay('2026-09-11')).toBe('2026-09-12');
  });

  it('rolls over the month and year', () => {
    expect(nextIsoDay('2026-09-30')).toBe('2026-10-01');
    expect(nextIsoDay('2026-12-31')).toBe('2027-01-01');
  });
});

describe('toIsoDate', () => {
  it('keeps YYYY-MM-DD strings', () => {
    expect(toIsoDate('2026-09-12')).toBe('2026-09-12');
  });

  it('formats Date values as UTC calendar days', () => {
    expect(toIsoDate(new Date('2026-09-12T00:00:00.000Z'))).toBe('2026-09-12');
  });
});

describe('selectStaleSymbols', () => {
  it('takes the oldest stale tickers first and leaves the rest pending', () => {
    const { batch, pending } = selectStaleSymbols(
      [
        { symbol: 'CCC', lastDate: '2026-09-10' },
        { symbol: 'BBB', lastDate: '2026-09-12' },
        { symbol: 'AAA', lastDate: '2026-09-01' },
      ],
      '2026-09-12',
      1,
    );
    expect(batch).toEqual([{ symbol: 'AAA', lastDate: '2026-09-01' }]);
    expect(pending).toEqual(['CCC']);
  });

  it('returns empty when every symbol is current', () => {
    const { batch, pending } = selectStaleSymbols(
      [{ symbol: 'AAA', lastDate: '2026-09-12' }],
      '2026-09-12',
      10,
    );
    expect(batch).toEqual([]);
    expect(pending).toEqual([]);
  });
});

describe('isCatchupRequested', () => {
  it('is off unless catchup is an explicit truthy query value', () => {
    expect(isCatchupRequested(new URLSearchParams())).toBe(false);
    expect(isCatchupRequested(new URLSearchParams('catchup='))).toBe(false);
    expect(isCatchupRequested(new URLSearchParams('catchup=0'))).toBe(false);
    expect(isCatchupRequested(new URLSearchParams('catchup=false'))).toBe(false);
  });

  it('accepts 1, true, and yes', () => {
    expect(isCatchupRequested(new URLSearchParams('catchup=1'))).toBe(true);
    expect(isCatchupRequested(new URLSearchParams('catchup=true'))).toBe(true);
    expect(isCatchupRequested(new URLSearchParams('catchup=YES'))).toBe(true);
  });
});
