import { describe, it, expect, vi } from 'vitest';
import { calcMA } from '../../lib/indicators';

// Mock secretSauce so indicator tests don't require the gitignored file
vi.mock('../../lib/secretSauce', () => ({
  alertsForDay: (_day: unknown) => ({ p0: 0, p1: 0, p2: 0 }),
  signalAlignment: (_history: unknown) => undefined,
}));

import { getDataFromHistory } from '../../lib/indicators';

describe('calcMA', () => {
  it('computes SMA of last n items', () => {
    expect(calcMA([1, 2, 3, 4, 5], 3)).toBe(4); // (3+4+5)/3
    expect(calcMA([10, 20, 30], 2)).toBe(25); // (20+30)/2
  });

  it('rounds to 2 decimal places', () => {
    expect(calcMA([1, 2, 3], 3)).toBe(2); // 6/3
    expect(calcMA([1, 1, 2], 3)).toBeCloseTo(1.33, 2);
  });
});

describe('getDataFromHistory', () => {
  const makeHistory = (n: number) =>
    Array.from({ length: n }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      eod: 100 + i,
    }));

  it('returns one row per valid EOD input', () => {
    const history = makeHistory(30);
    const result = getDataFromHistory(history);
    expect(result).toHaveLength(30);
  });

  it('skips non-numeric EOD rows', () => {
    const history = [
      { date: '2024-01-01', eod: 'NaN' },
      { date: '2024-01-02', eod: 100 },
    ];
    const result = getDataFromHistory(history);
    expect(result).toHaveLength(1);
  });

  it('computes MA20 starting at index > 20', () => {
    const history = makeHistory(30);
    const result = getDataFromHistory(history);
    // At index 20 (i=20) MA20 is still 0 (condition is i > 20)
    expect(result[20].ma20).toBe(0);
    // At index 21 (i=21), first MA20 should be average of prices at indices 2-21
    const prices = history.slice(2, 22).map((r) => Number(r.eod));
    const expected = Math.round((prices.reduce((a, b) => a + b, 0) / 20) * 100) / 100;
    expect(result[21].ma20).toBe(expected);
  });

  it('computes delta when MA20 is available', () => {
    const history = makeHistory(30);
    const result = getDataFromHistory(history);
    const r = result[22]; // i=22, MA20 available
    expect(r.delta).toBeCloseTo(r.eod - r.ma20, 2);
  });

  it('M1/M2/M3 are zero until sufficient deltas exist (i > 25)', () => {
    const history = makeHistory(30);
    const result = getDataFromHistory(history);
    expect(result[25].m1).toBe(0);
    expect(result[26].m1).not.toBe(0); // first non-zero at i=26
  });

  it('MA50 is zero until i > 50', () => {
    const history = makeHistory(60);
    const result = getDataFromHistory(history);
    expect(result[50].ma50).toBe(0);
    expect(result[51].ma50).not.toBe(0);
  });

  it('preserves date on each row', () => {
    const history = makeHistory(10);
    const result = getDataFromHistory(history);
    expect(result[0].date).toBe('2024-01-01');
    expect(result[9].date).toBe('2024-01-10');
  });
});
