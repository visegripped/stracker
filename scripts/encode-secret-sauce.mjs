/**
 * Prints a base64 string of lib/secretSauce.ts for pasting into Vercel.
 * Usage: pnpm encode-secret-sauce
 */

import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(__dirname, '..', 'lib', 'secretSauce.ts');

if (!existsSync(sourcePath)) {
  console.error('lib/secretSauce.ts not found. Create it first (from the template).');
  process.exit(1);
}

const b64 = Buffer.from(readFileSync(sourcePath, 'utf8'), 'utf8').toString('base64');

console.log('\nPaste this into Vercel env var SECRET_SAUCE_MODULE_B64:\n');
console.log(b64);
console.log('\n(Also available as SECRET_SAUCE_MODULE with the raw TypeScript source.)\n');
