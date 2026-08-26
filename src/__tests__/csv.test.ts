import { describe, it, expect } from 'vitest';
import { selectUntrackedBatch, type CsvSymbolRow } from '../../lib/cron/csv';

const row = (symbol: string): CsvSymbolRow => ({
  symbol,
  eod: 1,
  tradeDate: '2026-08-25',
  companyName: symbol,
  sector: null,
  industry: null,
});

describe('selectUntrackedBatch', () => {
  it('takes the first five untracked symbols in sheet order', () => {
    const csv = ['AAA', 'BBB', 'CCC', 'DDD', 'EEE', 'FFF', 'GGG'].map(row);
    const { batch, pending } = selectUntrackedBatch(csv, new Set(['BBB']), 5);
    expect(batch.map((r) => r.symbol)).toEqual(['AAA', 'CCC', 'DDD', 'EEE', 'FFF']);
    expect(pending).toEqual(['GGG']);
  });

  it('skips duplicates in the spreadsheet', () => {
    const csv = ['AAA', 'AAA', 'BBB', 'BBB', 'CCC'].map(row);
    const { batch, pending } = selectUntrackedBatch(csv, [], 2);
    expect(batch.map((r) => r.symbol)).toEqual(['AAA', 'BBB']);
    expect(pending).toEqual(['CCC']);
  });

  it('returns empty when every CSV symbol is already tracked', () => {
    const csv = ['AAA', 'BBB'].map(row);
    const { batch, pending } = selectUntrackedBatch(csv, ['AAA', 'BBB'], 5);
    expect(batch).toEqual([]);
    expect(pending).toEqual([]);
  });
});
