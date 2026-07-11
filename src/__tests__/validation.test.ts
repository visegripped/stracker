import { describe, it, expect } from 'vitest';

// Inline the validation helpers (ported from validation.php)
const isValidSymbol = (s: unknown): boolean => {
  if (!s || typeof s !== 'string') return false;
  if (s.length > 10) return false;
  return /^[A-Za-z.]+$/.test(s);
};

const isValidDate = (d: unknown): boolean => {
  if (!d || typeof d !== 'string') return false;
  return /^\d{6,8}$/.test(d);
};

const isValidEmail = (e: unknown): boolean => {
  if (!e || typeof e !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
};

const isValidLimit = (l: unknown): boolean => {
  const n = Number(l);
  return isFinite(n) && n > 0 && n <= 1000;
};

describe('isValidSymbol', () => {
  it('accepts valid US stock tickers', () => {
    expect(isValidSymbol('AAPL')).toBe(true);
    expect(isValidSymbol('BRK.A')).toBe(true);
    expect(isValidSymbol('intu')).toBe(true);
  });

  it('rejects invalid tickers', () => {
    expect(isValidSymbol('')).toBe(false);
    expect(isValidSymbol(null)).toBe(false);
    expect(isValidSymbol('TOOLONGTICKER')).toBe(false);
    expect(isValidSymbol('AAPL1')).toBe(false);
    expect(isValidSymbol('AAP L')).toBe(false);
  });
});

describe('isValidDate', () => {
  it('accepts 6 or 8-digit strings', () => {
    expect(isValidDate('20240101')).toBe(true);
    expect(isValidDate('240101')).toBe(true);
  });

  it('rejects non-numeric or wrong-length strings', () => {
    expect(isValidDate('')).toBe(false);
    expect(isValidDate('2024-01-01')).toBe(false);
    expect(isValidDate('2024')).toBe(false);
    expect(isValidDate('202401012')).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('accepts valid email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user+tag@sub.domain.io')).toBe(true);
  });

  it('rejects invalid email addresses', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('no@')).toBe(false);
  });
});

describe('isValidLimit', () => {
  it('accepts positive integers up to 1000', () => {
    expect(isValidLimit(1)).toBe(true);
    expect(isValidLimit(100)).toBe(true);
    expect(isValidLimit(1000)).toBe(true);
  });

  it('rejects invalid values', () => {
    expect(isValidLimit(0)).toBe(false);
    expect(isValidLimit(-1)).toBe(false);
    expect(isValidLimit(1001)).toBe(false);
    expect(isValidLimit('abc')).toBe(false);
    expect(isValidLimit(null)).toBe(false);
  });
});
