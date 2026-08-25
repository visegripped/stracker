/**
 * Stub — real formulas are NOT committed.
 *
 * Build/dev overwrite this file via scripts/write-secret-sauce.mjs from:
 *   - SECRET_SAUCE_MODULE_B64 (Vercel), or
 *   - lib/secretSauce.local.ts (local, gitignored)
 *
 * After local prebuild/dev/test this file is dirty with real formulas.
 * Before committing, restore the stub:
 *   git checkout -- lib/secretSauce.ts
 *
 * See lib/secretSauce.template.ts and docs/VERCEL_SETUP.md.
 */

export interface DayData {
  m1: number;
  m2: number;
  m3: number;
  ma20: number;
  p0: number;
  p1: number;
  p2: number;
}

export interface AlertFlags {
  p0: number;
  p1: number;
  p2: number;
}

export function getAlertStatusForDay(_day: DayData): AlertFlags {
  throw new Error(
    'secretSauce stub — run pnpm prebuild (needs SECRET_SAUCE_MODULE_B64 or lib/secretSauce.local.ts)'
  );
}

export function alertsForDay(day: DayData): AlertFlags {
  return getAlertStatusForDay(day);
}

export function getSignalAlignmentForDay(_history: DayData[]): string | undefined {
  throw new Error(
    'secretSauce stub — run pnpm prebuild (needs SECRET_SAUCE_MODULE_B64 or lib/secretSauce.local.ts)'
  );
}

export function signalAlignment(history: DayData[]): string | undefined {
  return getSignalAlignmentForDay(history);
}
