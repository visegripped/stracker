import { describe, it, expect } from 'vitest';
import {
  parseStoredPreference,
  resolveTheme,
  isThemePreference,
  THEME_BOOTSTRAP_SCRIPT,
  THEME_PREFERENCE_KEY,
  LEGACY_THEME_KEY,
} from '../utilities/theme';
import { agGridThemeClass, getChartChrome } from '../utilities/chartTheme';

describe('isThemePreference', () => {
  it('accepts light, dark, and system', () => {
    expect(isThemePreference('light')).toBe(true);
    expect(isThemePreference('dark')).toBe(true);
    expect(isThemePreference('system')).toBe(true);
  });

  it('rejects unknown values', () => {
    expect(isThemePreference('akira')).toBe(false);
    expect(isThemePreference('default')).toBe(false);
    expect(isThemePreference(null)).toBe(false);
  });
});

describe('parseStoredPreference', () => {
  it('defaults to system when nothing is stored', () => {
    expect(parseStoredPreference(null)).toBe('system');
    expect(parseStoredPreference('')).toBe('system');
  });

  it('reads the explicit preference', () => {
    expect(parseStoredPreference('light')).toBe('light');
    expect(parseStoredPreference('dark')).toBe('dark');
    expect(parseStoredPreference('system')).toBe('system');
  });

  it('maps the legacy akira/default theme names', () => {
    expect(parseStoredPreference(null, 'akira')).toBe('light');
    expect(parseStoredPreference(null, 'default')).toBe('dark');
  });

  it('prefers the new key over the legacy key', () => {
    expect(parseStoredPreference('system', 'default')).toBe('system');
  });
});

describe('resolveTheme', () => {
  it('follows the system preference when set to system', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('ignores the system preference when the user picked a theme', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});

describe('THEME_BOOTSTRAP_SCRIPT', () => {
  it('reads both storage keys before first paint', () => {
    expect(THEME_BOOTSTRAP_SCRIPT).toContain(THEME_PREFERENCE_KEY);
    expect(THEME_BOOTSTRAP_SCRIPT).toContain(LEGACY_THEME_KEY);
    expect(THEME_BOOTSTRAP_SCRIPT).toContain('prefers-color-scheme: dark');
    expect(THEME_BOOTSTRAP_SCRIPT).toContain('data-theme');
  });
});

describe('chart theme helpers', () => {
  it('picks the matching AG Grid class', () => {
    expect(agGridThemeClass('dark')).toBe('ag-theme-quartz-dark');
    expect(agGridThemeClass('light')).toBe('ag-theme-quartz');
  });

  it('uses high-contrast colors for the requested theme, not the live CSS variables', () => {
    const light = getChartChrome('light', 'History for LMT', { x: 'Date', y: 'Price' });
    const dark = getChartChrome('dark', 'MACD for LMT');
    expect(light.plugins.title.color).toBe('#2c292b');
    expect(dark.plugins.title.color).toBe('#f2eee9');
    expect(dark.plugins.legend.labels.color).toBe('#f2eee9');
    expect(dark.scales.x.ticks.color).toBe('#f2eee9');
    expect(dark.scales.x.grid.color).toBe('rgba(242, 238, 233, 0.12)');
    expect(light.plugins.legend.labels.color).toBe(light.plugins.title.color);
    expect(light.scales.x.title?.text).toBe('Date');
    expect(light.scales.y.title?.text).toBe('Price');
  });
});
