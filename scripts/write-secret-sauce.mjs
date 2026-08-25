/**
 * Writes lib/secretSauce.ts before build/dev/test.
 *
 * Why overwrite a committed stub?
 * Next.js/Turbopack on Vercel does not reliably resolve modules created only
 * under gitignored paths. We commit a stub at lib/secretSauce.ts and overwrite
 * it at build time with the real formulas.
 *
 * Source priority:
 * 1. SECRET_SAUCE_MODULE (plain TypeScript)
 * 2. SECRET_SAUCE_MODULE_B64 (base64 TypeScript)
 * 3. lib/secretSauce.local.ts (gitignored — local development)
 *
 * Vercel: set SECRET_SAUCE_MODULE_B64 (pnpm encode-secret-sauce)
 * Local:  keep formulas in lib/secretSauce.local.ts
 */

import { existsSync, writeFileSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const targetPath = join(root, 'lib', 'secretSauce.ts');
const localPath = join(root, 'lib', 'secretSauce.local.ts');

function looksLikeSecretSauce(source) {
  return (
    source.includes('export function alertsForDay') &&
    source.includes('export function signalAlignment')
  );
}

function resolveSource() {
  const plain = process.env.SECRET_SAUCE_MODULE?.trim();
  if (plain) {
    if (!looksLikeSecretSauce(plain)) {
      console.error('SECRET_SAUCE_MODULE is set but missing required exports');
      process.exit(1);
    }
    return { source: plain, from: 'SECRET_SAUCE_MODULE' };
  }

  const b64 = process.env.SECRET_SAUCE_MODULE_B64?.replace(/\s+/g, '');
  if (b64) {
    try {
      const decoded = Buffer.from(b64, 'base64').toString('utf8');
      if (!looksLikeSecretSauce(decoded)) {
        console.error(
          'SECRET_SAUCE_MODULE_B64 decoded but missing required exports. Re-run: pnpm encode-secret-sauce'
        );
        process.exit(1);
      }
      return { source: decoded, from: 'SECRET_SAUCE_MODULE_B64' };
    } catch (err) {
      console.error('Failed to decode SECRET_SAUCE_MODULE_B64:', err.message);
      process.exit(1);
    }
  }

  if (existsSync(localPath)) {
    const source = readFileSync(localPath, 'utf8');
    if (!looksLikeSecretSauce(source)) {
      console.error('lib/secretSauce.local.ts is missing required exports');
      process.exit(1);
    }
    return { source, from: 'lib/secretSauce.local.ts' };
  }

  return null;
}

const resolved = resolveSource();

if (!resolved) {
  const onVercel = process.env.VERCEL === '1';
  console.error(`
Missing secretSauce implementation.

Diagnostics:
  SECRET_SAUCE_MODULE set:     ${process.env.SECRET_SAUCE_MODULE != null} (length: ${process.env.SECRET_SAUCE_MODULE?.length ?? 0})
  SECRET_SAUCE_MODULE_B64 set: ${process.env.SECRET_SAUCE_MODULE_B64 != null} (length: ${process.env.SECRET_SAUCE_MODULE_B64?.length ?? 0})
  lib/secretSauce.local.ts:    ${existsSync(localPath)}
  VERCEL:                      ${process.env.VERCEL ?? 'not set'}
  VERCEL_ENV:                  ${process.env.VERCEL_ENV ?? 'not set'}

${
  onVercel
    ? `Vercel: add SECRET_SAUCE_MODULE_B64 for Production AND Preview, then Redeploy.
       Generate: pnpm encode-secret-sauce`
    : `Local: copy your formulas to lib/secretSauce.local.ts
       (gitignored), then re-run. Or set SECRET_SAUCE_MODULE_B64 in .env.local.`
}
`);
  process.exit(1);
}

writeFileSync(targetPath, resolved.source, 'utf8');
console.log(`Wrote lib/secretSauce.ts from ${resolved.from} (${resolved.source.length} bytes)`);
