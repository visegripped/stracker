/**
 * Secret sauce template — copy to lib/secretSauce.local.ts and implement.
 * lib/secretSauce.local.ts is gitignored. Vercel uses SECRET_SAUCE_MODULE_B64.
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
  throw new Error('Copy lib/secretSauce.template.ts to lib/secretSauce.local.ts and implement');
}

export function alertsForDay(day: DayData): AlertFlags {
  return getAlertStatusForDay(day);
}

export function getSignalAlignmentForDay(_history: DayData[]): string | undefined {
  throw new Error('Copy lib/secretSauce.template.ts to lib/secretSauce.local.ts and implement');
}

export function signalAlignment(history: DayData[]): string | undefined {
  return getSignalAlignmentForDay(history);
}
