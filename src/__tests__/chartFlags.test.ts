import { describe, it, expect } from 'vitest';
import {
  applyFlagToggle,
  DEFAULT_MACD_LINES,
  DEFAULT_SYMBOL_DATA_POINTS,
  hasEnabledFlag,
  readPersistedFlags,
} from '../utilities/chartFlags';

describe('readPersistedFlags', () => {
  it('uses defaults when nothing is stored', () => {
    expect(readPersistedFlags(null, DEFAULT_SYMBOL_DATA_POINTS)).toEqual(
      DEFAULT_SYMBOL_DATA_POINTS
    );
    expect(readPersistedFlags('', DEFAULT_MACD_LINES)).toEqual(DEFAULT_MACD_LINES);
  });

  it('uses defaults for empty or all-off objects so the chart is never blank', () => {
    expect(readPersistedFlags('{}', DEFAULT_SYMBOL_DATA_POINTS)).toEqual(
      DEFAULT_SYMBOL_DATA_POINTS
    );
    expect(
      readPersistedFlags('{"MACD":false,"Signal":false}', DEFAULT_MACD_LINES)
    ).toEqual(DEFAULT_MACD_LINES);
  });

  it('keeps a real user selection', () => {
    const stored = '{"EOD":true,"MA50":true}';
    expect(readPersistedFlags(stored, DEFAULT_SYMBOL_DATA_POINTS)).toEqual({
      EOD: true,
      MA50: true,
    });
  });

  it('uses defaults for invalid JSON', () => {
    expect(readPersistedFlags('nope', DEFAULT_MACD_LINES)).toEqual(DEFAULT_MACD_LINES);
  });
});

describe('applyFlagToggle', () => {
  it('turns a series on or off', () => {
    const next = applyFlagToggle({ MACD: true, Signal: true }, 'Signal', false);
    expect(next).toEqual({ MACD: true, Signal: false });
  });

  it('refuses to turn off the last remaining series', () => {
    const current = { MACD: true, Signal: false };
    expect(applyFlagToggle(current, 'MACD', false)).toEqual(current);
  });
});

describe('default series', () => {
  it('enables the symbol defaults used on first visit', () => {
    expect(hasEnabledFlag(DEFAULT_SYMBOL_DATA_POINTS)).toBe(true);
    expect(DEFAULT_SYMBOL_DATA_POINTS).toMatchObject({
      EOD: true,
      M1: true,
      M2: true,
      M3: true,
      MA20: true,
    });
  });

  it('enables MACD and Signal by default, not Histogram', () => {
    expect(DEFAULT_MACD_LINES).toEqual({
      MACD: true,
      Signal: true,
      Histogram: false,
    });
  });
});
