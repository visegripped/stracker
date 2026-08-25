/**
 * Writes lib/secretSauce.ts before build.
 *
 * Priority:
 * 1. SECRET_SAUCE_MODULE env var (plain TypeScript source), OR
 * 2. SECRET_SAUCE_MODULE_B64 env var (base64-encoded TypeScript source)
 * 3. Existing lib/secretSauce.ts on disk (local development)
 *
 * On Vercel: set SECRET_SAUCE_MODULE_B64 (preferred) or SECRET_SAUCE_MODULE.
 * Generate the base64 value with: pnpm encode-secret-sauce
 */

import { existsSync, writeFileSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const targetPath = join(__dirname, '..', 'lib', 'secretSauce.ts');

function resolveSource() {
  const plain = process.env.SECRET_SAUCE_MODULE?.trim();
  if (plain) return plain;

  // Strip whitespace — Vercel UI pastes can introduce newlines
  const b64 = process.env.SECRET_SAUCE_MODULE_B64?.replace(/\s+/g, '');
  if (b64) {
    try {
      const decoded = Buffer.from(b64, 'base64').toString('utf8');
      if (!decoded.includes('export function')) {
        console.error(
          'SECRET_SAUCE_MODULE_B64 decoded but does not look like secretSauce.ts (missing exports). Re-run: pnpm encode-secret-sauce'
        );
        process.exit(1);
      }
      return decoded;
    } catch (err) {
      console.error('Failed to decode SECRET_SAUCE_MODULE_B64:', err.message);
      process.exit(1);
    }
  }

  if (existsSync(targetPath)) {
    return readFileSync(targetPath, 'utf8');
  }

  return null;
}

const source = resolveSource();

if (!source) {
  const hasPlain = process.env.SECRET_SAUCE_MODULE != null;
  const hasB64 = process.env.SECRET_SAUCE_MODULE_B64 != null;
  console.error(`
Missing secretSauce module.

Diagnostics:
  SECRET_SAUCE_MODULE set:     ${hasPlain} (length: ${process.env.SECRET_SAUCE_MODULE?.length ?? 0})
  SECRET_SAUCE_MODULE_B64 set: ${hasB64} (length: ${process.env.SECRET_SAUCE_MODULE_B64?.length ?? 0})
  lib/secretSauce.ts on disk:  ${existsSync(targetPath)}
  VERCEL env:                  ${process.env.VERCEL ?? 'not set'}
  VERCEL_ENV:                  ${process.env.VERCEL_ENV ?? 'not set'}

Local:  keep lib/secretSauce.ts on disk (from lib/secretSauce.template.ts)
Vercel: Project Settings → Environment Variables → add SECRET_SAUCE_MODULE_B64
        for Production AND Preview, then Redeploy.
        Generate value: pnpm encode-secret-sauce
`);
  process.exit(1);
}

writeFileSync(targetPath, source, 'utf8');
console.log(`Wrote ${targetPath} (${source.length} bytes)`);
