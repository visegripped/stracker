import { describe, it, expect } from 'vitest';
import { CHART_SERIES_COLORS, PRIMARY_SERIES } from '../utilities/chartSeriesColors';

describe('CHART_SERIES_COLORS', () => {
  it('keeps EOD red', () => {
    expect(CHART_SERIES_COLORS.EOD.toLowerCase()).toBe('#dc2626');
  });

  it('gives the most-used series unique hues', () => {
    const colors = PRIMARY_SERIES.map((key) => CHART_SERIES_COLORS[key]);
    expect(new Set(colors).size).toBe(PRIMARY_SERIES.length);
  });

  it('does not reuse a primary color on another series', () => {
    const primary = new Set(PRIMARY_SERIES.map((key) => CHART_SERIES_COLORS[key]));
    const others = Object.entries(CHART_SERIES_COLORS)
      .filter(([key]) => !PRIMARY_SERIES.includes(key as (typeof PRIMARY_SERIES)[number]))
      .map(([, color]) => color);
    expect(others.some((color) => primary.has(color))).toBe(false);
  });
});
