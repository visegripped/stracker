import { describe, expect, it } from 'vitest';
import { navIsActive } from '../utilities/nav';

describe('navIsActive', () => {
  it('matches an exact path and nested symbol routes', () => {
    expect(navIsActive('/symbol', '/symbol')).toBe(true);
    expect(navIsActive('/symbol/AAPL', '/symbol')).toBe(true);
    expect(navIsActive('/alerts', '/alerts')).toBe(true);
  });

  it('does not treat Symbols as the Symbol page', () => {
    expect(navIsActive('/symbols', '/symbol')).toBe(false);
    expect(navIsActive('/symbol', '/symbols')).toBe(false);
    expect(navIsActive('/symbols', '/symbols')).toBe(true);
  });
});
