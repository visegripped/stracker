import { describe, it, expect } from 'vitest';
import {
  getAlertStatusForDay,
  getSignalAlignmentForDay,
} from '../../lib/secretSauce';

const makeDay = (m1: number, m2: number, m3: number, ma20: number, p0 = 0, p1 = 0, p2 = 0) => ({
  m1, m2, m3, ma20, p0, p1, p2,
});

describe('getAlertStatusForDay', () => {
  it('sets P0=1 when M1 > MA20', () => {
    const flags = getAlertStatusForDay(makeDay(110, 105, 100, 100));
    expect(flags.p0).toBe(1);
  });

  it('sets P0=0 when M1 <= MA20', () => {
    const flags = getAlertStatusForDay(makeDay(90, 105, 100, 100));
    expect(flags.p0).toBe(0);
  });

  it('sets P1=1 when M2 > M3', () => {
    const flags = getAlertStatusForDay(makeDay(100, 110, 100, 95));
    expect(flags.p1).toBe(1);
  });

  it('sets P1=0 when M2 <= M3', () => {
    const flags = getAlertStatusForDay(makeDay(100, 100, 110, 95));
    expect(flags.p1).toBe(0);
  });

  it('sets P2=1 when M1 > M2', () => {
    const flags = getAlertStatusForDay(makeDay(115, 110, 100, 95));
    expect(flags.p2).toBe(1);
  });

  it('sets P2=0 when M1 <= M2', () => {
    const flags = getAlertStatusForDay(makeDay(105, 115, 100, 95));
    expect(flags.p2).toBe(0);
  });
});

describe('getSignalAlignmentForDay', () => {
  it('returns undefined for empty or single-element history', () => {
    expect(getSignalAlignmentForDay([])).toBeUndefined();
    expect(getSignalAlignmentForDay([makeDay(110, 105, 100, 100)])).toBeUndefined();
  });

  it('returns P0-buy when P0 flips to 1 and all signals are on', () => {
    const yesterday = makeDay(90, 105, 100, 100, 0, 0, 0);
    const today = makeDay(110, 115, 100, 100, 1, 1, 1);
    expect(getSignalAlignmentForDay([yesterday, today])).toBe('P0-buy');
  });

  it('returns P0-sell when P0 flips to 0 and all signals are off', () => {
    const yesterday = makeDay(110, 115, 100, 100, 1, 0, 0);
    const today = makeDay(90, 85, 100, 100, 0, 0, 0);
    expect(getSignalAlignmentForDay([yesterday, today])).toBe('P0-sell');
  });

  it('returns undefined when no transition occurs', () => {
    const day = makeDay(110, 115, 100, 100, 1, 1, 1);
    expect(getSignalAlignmentForDay([day, { ...day }])).toBeUndefined();
  });
});
