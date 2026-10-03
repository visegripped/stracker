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

| Variable                       | Value                                              |
| ------------------------------ | -------------------------------------------------- |
| `POSTGRES_URL`                 | Neon connection string                             |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID                             |
| `GOOGLE_OAUTH_CLIENT_ID`       | Same as above                                      |
| `GOOGLE_SHEET_CSV_URL`         | Public Google Sheet CSV URL                        |
| `RESEND_API_KEY`               | Resend API key                                     |
| `ERROR_EMAIL`                  | Where to send error emails                         |
| `CRON_SECRET`                  | Random strong secret (e.g. `openssl rand -hex 32`) |
| `SECRET_SAUCE_MODULE_B64`      | Base64 of `lib/secretSauce.ts` (not in git)        |
| `TIINGO_API_TOKEN`             | Tiingo API token (historical backfill only)        |

### Secret sauce (formulas stay out of GitHub)

`lib/secretSauce.ts` is a committed **loader** (no formulas). At runtime it loads
TypeScript from `SECRET_SAUCE_MODULE_B64` (or local `lib/secretSauce.local.ts`).

1. Keep formulas in `lib/secretSauce.local.ts` (gitignored).
2. Generate the Vercel value:
   ```bash
   pnpm encode-secret-sauce
   ```
3. Vercel → Environment Variables → `SECRET_SAUCE_MODULE_B64` for **Production** and **Preview**.
4. Redeploy.

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

This backfills up to 2 years of Tiingo history for CSV symbols not yet in Neon. Daily EOD still comes from the Google Sheet. See [History import vs daily EOD](../README.md#history-import-vs-daily-eod).

---

## 9. Verify Cron Jobs

Crons are defined in `vercel.json` and run only on the **Production** deployment (not Preview URLs such as `stracker-beta.vercel.app`).

| Route                | Schedule (UTC) | Local time      | What it does                                      |
| -------------------- | -------------- | --------------- | ------------------------------------------------- |
| `/api/cron/backfill` | `0 0 * * 2-6`  | 5 PM PT Mon–Fri | New sheet symbols only (not missed-day catch-up) |
| `/api/cron/daily`    | `0 1 * * 2-6`  | 6 PM PT Mon–Fri | Today's Google Sheet close for every tracked ticker |

**Hobby limits:** at most one run per path per day; timing is approximate (± about an hour). Weekend UTC days `0`/`1` are skipped so Pacific Friday close is Saturday 01:00 UTC, not Sunday.

Checklist if a job looks idle:

1. Vercel → this project (production, not a Preview) → **Cron Jobs** — both paths should be listed.
2. Production env: `CRON_SECRET`, `GOOGLE_SHEET_CSV_URL`, `TIINGO_API_TOKEN`, `POSTGRES_URL`.
3. Redeploy **Production** after changing `vercel.json`.
4. Manual trigger (expect JSON, not `401`):

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://stracker.visegripped.com/api/cron/daily
curl -H "Authorization: Bearer $CRON_SECRET" https://stracker.visegripped.com/api/cron/backfill
```

Missed-day catch-up is **opt-in** (`lib/cron/catchup.ts`). The scheduled cron does not pass a query string, so it skips catch-up. To fill gaps:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  'https://stracker.visegripped.com/api/cron/backfill?catchup=1'
```

About 10 stale symbols per run (Tiingo free tier is ~50 requests/hour). To drain a large gap: `pnpm fill-gaps`.
