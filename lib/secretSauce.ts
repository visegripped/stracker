/**
 * Secret sauce loader — committed; real formulas are NOT in this file.
 *
 * Loads implementation from (first match):
 *   1. SECRET_SAUCE_MODULE (TypeScript source)
 *   2. SECRET_SAUCE_MODULE_B64 (base64 TypeScript source)
 *   3. lib/secretSauce.local.ts (local, gitignored)
 *
 * Vercel: set SECRET_SAUCE_MODULE_B64 (pnpm encode-secret-sauce)
 * Local:  keep formulas in lib/secretSauce.local.ts
 */

import 'server-only';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import ts from 'typescript';

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

type SauceImpl = {
  getAlertStatusForDay: (day: DayData) => AlertFlags;
  alertsForDay: (day: DayData) => AlertFlags;
  getSignalAlignmentForDay: (history: DayData[]) => string | undefined;
  signalAlignment: (history: DayData[]) => string | undefined;
};

let cached: SauceImpl | null = null;

function resolveSource(): string {
  const plain = process.env.SECRET_SAUCE_MODULE?.trim();
  if (plain) return plain;

  const b64 = process.env.SECRET_SAUCE_MODULE_B64?.replace(/\s+/g, '');
  if (b64) {
    return Buffer.from(b64, 'base64').toString('utf8');
  }

  const localPath = join(process.cwd(), 'lib', 'secretSauce.local.ts');
  if (existsSync(localPath)) {
    return readFileSync(localPath, 'utf8');
  }

  throw new Error(
    'Missing secretSauce: set SECRET_SAUCE_MODULE_B64 (Vercel) or create lib/secretSauce.local.ts (local)'
  );
}

function loadImpl(): SauceImpl {
  const source = resolveSource();
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: 'secretSauce.ts',
  });

  const module = { exports: {} as Record<string, unknown> };
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  new Function('exports', 'module', outputText)(module.exports, module);

  const impl = module.exports as SauceImpl;
  if (
    typeof impl.alertsForDay !== 'function' ||
    typeof impl.signalAlignment !== 'function' ||
    typeof impl.getAlertStatusForDay !== 'function' ||
    typeof impl.getSignalAlignmentForDay !== 'function'
  ) {
    throw new Error(
      'secretSauce source is missing required exports (alertsForDay, signalAlignment, …)'
    );
  }
  return impl;
}

function getImpl(): SauceImpl {
  if (!cached) cached = loadImpl();
  return cached;
}

export function getAlertStatusForDay(day: DayData): AlertFlags {
  return getImpl().getAlertStatusForDay(day);
}

export function alertsForDay(day: DayData): AlertFlags {
  return getImpl().alertsForDay(day);
}

export function getSignalAlignmentForDay(
  history: DayData[]
): string | undefined {
  return getImpl().getSignalAlignmentForDay(history);
}

export function signalAlignment(history: DayData[]): string | undefined {
  return getImpl().signalAlignment(history);
}
