import { describe, expect, it } from 'vitest';
import {
  prependUnprocessedToPending,
  shouldStopBackfill,
} from '../../lib/cron/backfillDeadline';

describe('shouldStopBackfill', () => {
  it('continues when no deadline is set', () => {
    expect(shouldStopBackfill(1_000, undefined)).toBe(false);
  });

  it('stops when only the safety window remains', () => {
    expect(shouldStopBackfill(50_000, 55_000, 8_000)).toBe(true);
    expect(shouldStopBackfill(40_000, 55_000, 8_000)).toBe(false);
  });
});

describe('prependUnprocessedToPending', () => {
  it('puts leftover batch symbols ahead of later pending tickers', () => {
    expect(
      prependUnprocessedToPending(
        [{ symbol: 'AAA' }, { symbol: 'BBB' }, { symbol: 'CCC' }],
        1,
        ['DDD'],
      ),
    ).toEqual(['BBB', 'CCC', 'DDD']);
  });
});
