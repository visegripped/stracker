import { describe, it, expect } from 'vitest';
import { resolveSymbolFromSlug } from '../utilities/symbolParam';

describe('resolveSymbolFromSlug', () => {
  it('uses the first catch-all segment, uppercased', () => {
    expect(resolveSymbolFromSlug(['aapl'])).toBe('AAPL');
    expect(resolveSymbolFromSlug('msft')).toBe('MSFT');
  });

  it('falls back when the slug is missing', () => {
    expect(resolveSymbolFromSlug(undefined)).toBe('INTU');
    expect(resolveSymbolFromSlug(null)).toBe('INTU');
    expect(resolveSymbolFromSlug([])).toBe('INTU');
    expect(resolveSymbolFromSlug('')).toBe('INTU');
    expect(resolveSymbolFromSlug(undefined, 'AAPL')).toBe('AAPL');
  });

  it('trims whitespace', () => {
    expect(resolveSymbolFromSlug('  intu  ')).toBe('INTU');
  });
});
