# Vercel Setup — Stracker

## Prerequisites

- Vercel account (Hobby tier — free)
- Neon account (Free tier — free)
- Resend account (Free tier)
- `vercel` CLI: `pnpm add -g vercel`

---

## 1. Create Neon Database

1. [app.neon.tech](https://app.neon.tech) → New project → name it `stracker`
2. Copy the **connection string** (postgres://...)
3. In Neon console → SQL Editor, run the migration:
   ```sql
   -- Paste contents of drizzle/migrations/0000_dry_warbound.sql
   ```
   Or use `pnpm db:push` (see below).

---

## 2. Create Vercel Project

```bash
vercel link      # link to existing project or create new
```

Or via the Vercel dashboard: **New Project** → import from GitHub.

---

## 3. Set Environment Variables

In Vercel dashboard → Project Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `POSTGRES_URL` | Neon connection string |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_OAUTH_CLIENT_ID` | Same as above |
| `GOOGLE_SHEET_CSV_URL` | Public Google Sheet CSV URL |
| `RESEND_API_KEY` | Resend API key |
| `ERROR_EMAIL` | Where to send error emails |
| `CRON_SECRET` | Random strong secret (e.g. `openssl rand -hex 32`) |
| `SECRET_SAUCE_MODULE_B64` | Base64 of `lib/secretSauce.ts` (not in git) |

### Secret sauce (formulas stay out of GitHub)

Next/Turbopack on Vercel does not reliably resolve files that only exist under
`.gitignore`, so we commit a **stub** at `lib/secretSauce.ts` and overwrite it
at build time.

1. Locally keep real formulas in `lib/secretSauce.local.ts` (gitignored).
2. Generate the Vercel env value:
   ```bash
   pnpm encode-secret-sauce
   ```
3. Vercel → Environment Variables → `SECRET_SAUCE_MODULE_B64` for **Production** and **Preview**.
4. Redeploy.

`prebuild` overwrites `lib/secretSauce.ts` from that env var before `next build`.

---

## 4. Google OAuth Setup

1. [console.cloud.google.com](https://console.cloud.google.com) → API & Services → Credentials
2. Edit the existing OAuth client (shared with giftmanager)
3. Add to **Authorized JavaScript origins**:
   - `https://stracker.visegripped.com`
4. Add to **Authorized redirect URIs** (not needed for implicit flow)

---

## 5. Resend Setup

1. [resend.com](https://resend.com) → Domains → Add domain `visegripped.com`
2. Verify DNS records (TXT, DKIM)
3. Create API key → paste into `RESEND_API_KEY`

---

## 6. Deploy

```bash
vercel deploy --prod
```

Or push to `main` (Vercel auto-deploys on push).

---

## 7. Run Database Migration on Neon

With environment variables available locally:

```bash
pnpm db:push
```

---

## 8. Seed Initial Data

After the database is ready and environment variables are set:

```bash
cp .env.example .env.local
# Fill in POSTGRES_URL and GOOGLE_SHEET_CSV_URL
pnpm seed
```

This backfills up to 2 years of Yahoo Finance history for all CSV symbols.

---

## 9. Verify Cron Jobs

Crons are defined in `vercel.json`:

| Route | Schedule (UTC) | Local time |
|---|---|---|
| `/api/cron/backfill` | `0 0 * * 2-6` | 5 PM PT Mon–Fri |
| `/api/cron/daily` | `0 1 * * 2-6` | 6 PM PT Mon–Fri |

**Note:** Vercel Hobby crons run at most once per day and timing is approximate (±30 min).

Test manually:
```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://stracker.visegripped.com/api/cron/daily
```
