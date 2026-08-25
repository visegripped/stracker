/**
 * Validates that secret sauce source will be available at runtime.
 * Does NOT write files (Turbopack cannot reliably resolve build-time generated modules).
 */

const onVercel = process.env.VERCEL === '1';
const hasPlain = Boolean(process.env.SECRET_SAUCE_MODULE?.trim());
const hasB64 = Boolean(process.env.SECRET_SAUCE_MODULE_B64?.replace(/\s+/g, ''));

if (onVercel && !hasPlain && !hasB64) {
  console.error(`
Missing SECRET_SAUCE_MODULE_B64 on Vercel (VERCEL_ENV=${process.env.VERCEL_ENV ?? '?'}).

Add Project → Settings → Environment Variables → SECRET_SAUCE_MODULE_B64
for Production AND Preview, then Redeploy.

Generate value locally: pnpm encode-secret-sauce
`);
  process.exit(1);
}

if (hasB64 || hasPlain) {
  console.log(
    `secretSauce env OK (${hasB64 ? 'SECRET_SAUCE_MODULE_B64' : 'SECRET_SAUCE_MODULE'})`
  );
} else {
  console.log(
    'secretSauce: no env var set — will use lib/secretSauce.local.ts at runtime if present'
  );
}
