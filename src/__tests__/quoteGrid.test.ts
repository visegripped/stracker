import { describe, expect, it } from 'vitest';
import {
  TEXT_COLUMN_FILTER,
  QUOTE_TEXT_FILTER_FIELDS,
  buildSymbolListRows,
  formatRecentSignal,
  pickLatestAlerts,
  withPriceSnapshot,
} from '../utilities/quoteGrid';
import { alertHistoryColumnDefs, symbolsColumnDefs } from '../components/QuoteGrid/QuoteGrid';

describe('formatRecentSignal', () => {
  it('joins type and date', () => {
    expect(formatRecentSignal('P0-buy', '2026-09-12')).toBe('P0-buy on 2026-09-12');
  });

  it('returns empty when there is no signal', () => {
    expect(formatRecentSignal(null, '2026-09-12')).toBe('');
    expect(formatRecentSignal('', '2026-09-12')).toBe('');
  });
});

describe('pickLatestAlerts', () => {
  it('keeps the first (newest) row per symbol', () => {
    expect(
      pickLatestAlerts([
        { symbol: 'AAA', type: 'P0-buy', date: '2026-09-12' },
        { symbol: 'AAA', type: 'P1-buy', date: '2026-08-01' },
        { symbol: 'BBB', type: 'P2-sell', date: '2026-09-10' },
      ]),
    ).toEqual({
      AAA: { type: 'P0-buy', date: '2026-09-12' },
      BBB: { type: 'P2-sell', date: '2026-09-10' },
    });
  });
});

describe('buildSymbolListRows', () => {
  it('attaches EOD snapshot and latest signal', () => {
    const rows = buildSymbolListRows(
      [{ symbol: 'INTU', name: 'Intuit', sector: 'Tech', industry: 'Software' }],
      {
        INTU: { lastEOD: '100', yearStartEOD: '90', previousDayEOD: '99' },
      },
      { INTU: { type: 'P1-buy', date: '2026-09-11' } },
    );
    expect(rows).toEqual([
      {
        symbol: 'INTU',
        name: 'Intuit',
        sector: 'Tech',
        industry: 'Software',
        lastEOD: '100',
        yearStartEOD: '90',
        previousDayEOD: '99',
        type: 'P1-buy',
        date: '2026-09-11',
      },
    ]);
  });

  it('leaves prices and signal null when missing', () => {
    const rows = withPriceSnapshot(
      [{ symbol: 'AAA', name: 'A' }],
      {},
    );
    expect(rows[0]).toMatchObject({
      lastEOD: null,
      yearStartEOD: null,
      previousDayEOD: null,
    });
  });
});

describe('quote grid column filters', () => {
  it('uses the type-column text filter on name, sector, and industry', () => {
    const byField = Object.fromEntries(
      alertHistoryColumnDefs().map((col) => [col.field, col]),
    );
    for (const field of QUOTE_TEXT_FILTER_FIELDS) {
      expect(byField[field]?.filter).toBe(TEXT_COLUMN_FILTER);
    }
    expect(byField.type?.filter).toBe(TEXT_COLUMN_FILTER);
  });

  it('defaults Symbols to alphabetical symbol order and a recent-signal column', () => {
    const cols = symbolsColumnDefs();
    const symbolCol = cols.find((col) => col.field === 'symbol');
    expect(symbolCol?.sort).toBe('asc');
    const signalCol = cols.find((col) => col.colId === 'recentSignal');
    expect(signalCol?.headerName).toBe('Most recent signal');
    expect(signalCol?.filter).toBe(TEXT_COLUMN_FILTER);
    for (const field of QUOTE_TEXT_FILTER_FIELDS) {
      expect(cols.find((col) => col.field === field)?.filter).toBe(TEXT_COLUMN_FILTER);
    }
  });
});
