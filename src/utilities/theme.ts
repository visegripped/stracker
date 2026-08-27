export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_PREFERENCE_KEY = 'theme-preference';
export const LEGACY_THEME_KEY = 'theme';

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

/** Map stored + legacy ("akira"/"default") values to a preference. */
export function parseStoredPreference(
  stored: string | null,
  legacy: string | null = null
): ThemePreference {
  if (isThemePreference(stored)) return stored;
  if (legacy === 'akira') return 'light';
  if (legacy === 'default') return 'dark';
  return 'system';
}

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean
): ResolvedTheme {
  if (preference === 'light' || preference === 'dark') return preference;
  return systemPrefersDark ? 'dark' : 'light';
}

/** Inline script: apply theme before first paint to avoid a flash. */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var stored=localStorage.getItem('${THEME_PREFERENCE_KEY}');var legacy=localStorage.getItem('${LEGACY_THEME_KEY}');var pref=stored;if(pref!=='light'&&pref!=='dark'&&pref!=='system'){if(legacy==='akira')pref='light';else if(legacy==='default')pref='dark';else pref='system';}var systemDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=(pref==='light'||pref==='dark')?pref:(systemDark?'dark':'light');document.documentElement.setAttribute('data-theme',resolved);document.documentElement.style.colorScheme=resolved;}catch(e){}})();`;
