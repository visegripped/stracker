/**
 * Prints base64 of the secret sauce source for Vercel env SECRET_SAUCE_MODULE_B64.
 * Prefers lib/secretSauce.local.ts (gitignored), else lib/secretSauce.ts.
 */

import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const localPath = join(root, 'lib', 'secretSauce.local.ts');
const stubPath = join(root, 'lib', 'secretSauce.ts');

const sourcePath = existsSync(localPath) ? localPath : stubPath;

if (!existsSync(sourcePath)) {
  console.error('No secretSauce source found. Create lib/secretSauce.local.ts first.');
  process.exit(1);
}

const source = readFileSync(sourcePath, 'utf8');
if (!source.includes('export function alertsForDay')) {
  console.error(`${sourcePath} does not look like a full secretSauce implementation.`);
  process.exit(1);
}

const b64 = Buffer.from(source, 'utf8').toString('base64');
console.log(`\nEncoded from: ${sourcePath}\n`);
console.log('Paste this into Vercel env var SECRET_SAUCE_MODULE_B64:\n');
console.log(b64);
console.log('');
