import { describe, expect, it } from 'vitest';
import { DEFAULT_SYMBOL_DATA_POINTS } from '../utilities/chartFlags';
import { readPersistedDate, readSymbolChartSettings } from '../utilities/chartSettings';

function memoryStorage(values: Record<string, string> = {}) {
  return { getItem: (key: string) => values[key] ?? null };
}

describe('readPersistedDate', () => {
  const fallback = new Date('2026-03-01T00:00:00.000Z');

  it('uses the fallback when nothing usable is stored', () => {
    expect(readPersistedDate(null, fallback)).toBe(fallback);
    expect(readPersistedDate('', fallback)).toBe(fallback);
    expect(readPersistedDate('null', fallback)).toBe(fallback);
    expect(readPersistedDate('not-a-date', fallback)).toBe(fallback);
  });

  it('parses a stored ISO date', () => {
    expect(readPersistedDate('2026-01-15T00:00:00.000Z', fallback).toISOString()).toBe(
      '2026-01-15T00:00:00.000Z',
    );
  });
});

describe('readSymbolChartSettings', () => {
  it('uses the symbol-page defaults when nothing is stored', () => {
    const settings = readSymbolChartSettings(memoryStorage());
    const days = (settings.endDate.getTime() - settings.startDate.getTime()) / 86_400_000;
    expect(days).toBeGreaterThan(34);
    expect(days).toBeLessThan(36);
    expect(settings.dataPoints).toEqual(DEFAULT_SYMBOL_DATA_POINTS);
  });

  it('returns the saved range and series', () => {
    const settings = readSymbolChartSettings(
      memoryStorage({
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-02-01T00:00:00.000Z',
        dataPoints: JSON.stringify({ EOD: true, MA50: true }),
      }),
    );
    expect(settings.startDate.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    expect(settings.endDate.toISOString()).toBe('2026-02-01T00:00:00.000Z');
    expect(settings.dataPoints).toEqual({ EOD: true, MA50: true });
  });
});
