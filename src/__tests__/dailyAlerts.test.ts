import { describe, expect, it } from 'vitest';
import { applySheetClose } from '../../lib/cron/applySheetClose';
import { formatDateInTimeZone, pacificTradingDate } from '../utilities/tradingDate';

describe('applySheetClose', () => {
  it('appends today when the series does not include that date', () => {
    expect(
      applySheetClose(
        [{ date: '2026-10-01', eod: '10' }],
        '2026-10-02',
        '11.5',
      ),
    ).toEqual([
      { date: '2026-10-01', eod: '10' },
      { date: '2026-10-02', eod: '11.5' },
    ]);
  });

  it('replaces a catch-up bar with the sheet close', () => {
    expect(
      applySheetClose(
        [
          { date: '2026-10-01', eod: '10' },
          { date: '2026-10-02', eod: '11' },
        ],
        '2026-10-02',
        '11.5',
      ),
    ).toEqual([
      { date: '2026-10-01', eod: '10' },
      { date: '2026-10-02', eod: '11.5' },
    ]);
  });
});

describe('pacificTradingDate', () => {
  it('uses the Pacific calendar day at 01:00 UTC (daily cron time)', () => {
    const cronInstant = new Date('2026-10-03T01:00:00.000Z');
    expect(formatDateInTimeZone(cronInstant, 'America/Los_Angeles')).toBe(
      '2026-10-02',
    );
    expect(pacificTradingDate(cronInstant)).toBe('2026-10-02');
  });
});
