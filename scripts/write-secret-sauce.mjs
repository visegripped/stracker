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

  const b64 = process.env.SECRET_SAUCE_MODULE_B64?.trim();
  if (b64) {
    try {
      return Buffer.from(b64, 'base64').toString('utf8');
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
  console.error(`
Missing secretSauce module.

Local:  copy lib/secretSauce.template.ts → lib/secretSauce.ts and implement it
Vercel: set SECRET_SAUCE_MODULE_B64 (run: pnpm encode-secret-sauce)
`);
  process.exit(1);
}

writeFileSync(targetPath, source, 'utf8');
console.log(`Wrote ${targetPath} (${source.length} bytes)`);
