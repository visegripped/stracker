---
name: Stracker → Vercel Migration
overview: Port stracker (PHP/MySQL/Vite on SiteGround) to a full Next.js 15 + Neon Postgres app on Vercel Hobby, following the giftmanager pattern. Includes schema consolidation to a single `symbol_data` table, last-10-symbols restriction, merged daily cron with Resend email, and DB-backed error logging.
todos:
  - id: setup-nextjs
    content: Initialize Next.js 15 + Drizzle + Neon in stracker; add vercel.json, .env.example, pnpm scripts
    status: pending
  - id: schema
    content: Define Drizzle schema (symbols, symbol_data, alerts, track, users, application_reports) and generate initial migration SQL
    status: pending
  - id: port-lib
    content: "Port PHP business logic to TypeScript: secretSauce, indicators (getDataFromHistory), yahoo fetch+scrape, email (Resend)"
    status: pending
  - id: port-auth
    content: Port Google OAuth token validation to lib/auth (reuse giftmanager pattern)
    status: pending
  - id: port-api
    content: Port api.php tasks to Next.js Route Handler at /api/route.ts (history, alerts, symbols, track, untrack, getAlertHistory, getAlertHistoryList)
    status: pending
  - id: cron-handler
    content: "Implement merged /api/cron/daily/route.ts: last-10-symbols, daily update, alert emails, error logging, CRON_SECRET guard"
    status: pending
  - id: port-frontend
    content: Migrate React+Vite pages (Home, Symbol, Alerts, Macd) to Next.js App Router pages; update API calls to relative /api
    status: pending
  - id: env-and-deploy
    content: Create .env.example; verify Resend domain (visegripped.com); add Vercel custom domain; update Google OAuth origins; run db:migrate on Neon
    status: pending
isProject: false
---

# Stracker → Vercel Migration Plan

## Target project
`/Users/justinlaugesen/Documents/sites/stracker` — stock tracker app (React+Vite + PHP + MySQL on SiteGround). The vicegripped portfolio site is left untouched.

## Stack (matching giftmanager)
- Next.js 15 App Router (replaces Vite SPA + PHP/Apache)
- Neon Postgres + `@neondatabase/serverless` HTTP driver (replaces MySQL)
- Drizzle ORM for schema + migrations
- Resend for transactional email (replaces PHP `mail()`)
- pnpm, Vercel Hobby

## New file structure

```
stracker/
├── app/
│   ├── layout.tsx + page.tsx       ← replaces Vite SPA shell
│   ├── symbol/[ticker]/page.tsx    ← was React Router /symbol/:symbol
│   ├── alerts/page.tsx             ← was /alerts
│   ├── macd/page.tsx               ← was /macd
│   ├── api/
│   │   ├── route.ts                ← replaces api.php (all tasks)
│   │   └── cron/daily/route.ts    ← merged daily update + alert emails
├── lib/
│   ├── db/index.ts + schema.ts     ← Drizzle + Neon HTTP
│   ├── auth/index.ts               ← Google token validation (giftmanager pattern)
│   ├── cron/daily.ts               ← ported daily.php logic
│   ├── cron/alerts.ts              ← ported daily-alerts.php logic
│   ├── secretSauce.ts              ← server-only; ported from PHP
│   ├── indicators.ts               ← ported getDataFromHistory.php
│   ├── yahoo.ts                    ← Yahoo CSV + scrape fallback (fetch, not fopen)
│   └── email/index.ts              ← Resend client
├── drizzle/migrations/             ← SQL migrations
├── vercel.json
├── .env.example                    ← NEW (existing .env/.env.bak/.env.production untouched)
└── drizzle.config.ts
```

## Database schema

Replaces all per-symbol dynamic tables. Key change: `symbol_data` uses `(symbol, date)` composite PK.

- `symbols` — was `_symbols`; columns: `symbol`, `name`
- `symbol_data` — **new**; columns: `symbol`, `date`, `eod`, `ma20`, `ma50`, `delta`, `delta_ma5`, `delta_ma10`, `delta_ma20`, `p0`, `p1`, `p2`, `m1`, `m2`, `m3`; PK `(symbol, date)`; index on `(symbol, date DESC)`
- `alerts` — was `_alerts`; columns: `id`, `date`, `symbol`, `type`; unique `(date, symbol)`
- `track` — was `_track`; columns: `symbol`, `user_id` (email); unique `(symbol, user_id)`
- `users` — new; Google email as PK; stores display name + avatar
- `application_reports` — new; mirrors giftmanager; columns: `id`, `report`, `meta` (jsonb), `timestamp`

Migration SQL will live in `drizzle/migrations/0000_initial.sql`. No historical data migration — fresh start. On first run, new symbols pull Yahoo history automatically.

## Daily cron (merged, in order)

`/api/cron/daily` — protected by `Authorization: Bearer CRON_SECRET` (Vercel sends this automatically).

**Step 1 — daily update (must complete before step 2):**
1. Fetch Google Sheet CSV (`GOOGLE_SHEET_CSV_URL`)
2. Slice to **last 10 rows** only
3. For each symbol:
   - Query `SELECT date, eod FROM symbol_data WHERE symbol = $1 ORDER BY date DESC LIMIT 75`
   - If rows exist: append today's price, recompute indicators, upsert latest row
   - If no rows: fetch Yahoo history (2 years back), compute all indicators, bulk insert
   - Run `signalAlignment()` → may produce `P0-buy`, `P0-sell`, `P1-*`, `P2-*`
4. Upsert new alerts to `alerts` table
5. On any error: log to `application_reports` + send error email via Resend (from `stracker-errors@visegripped.com`)

**Step 2 — alert emails:**
1. Load today's alerts from `alerts`
2. Load all watchlist entries from `track`
3. For each user with a matching symbol: send HTML email via Resend (from `stracker@visegripped.com`)

```json
// vercel.json cron — 5pm PST / 6pm PDT ≈ 1am UTC Tue-Sat
{ "path": "/api/cron/daily", "schedule": "0 1 * * 2-6" }
```

## `vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "buildCommand": "pnpm build",
  "crons": [{ "path": "/api/cron/daily", "schedule": "0 1 * * 2-6" }]
}
```

## Env vars

`.env.example` (new — existing `.env` files untouched):

```
POSTGRES_URL=postgresql://...@...neon.tech/stracker
NEXT_PUBLIC_GOOGLE_CLIENT_ID=       # same value as giftmanager
GOOGLE_OAUTH_CLIENT_ID=             # same value
GOOGLE_SHEET_CSV_URL=https://docs.google.com/spreadsheets/...
RESEND_API_KEY=
ERROR_EMAIL=visegripped@gmail.com
CRON_SECRET=
```

## Email (Resend)

- Install `resend` package
- `lib/email/index.ts` with `sendErrorEmail()` and `sendAlertEmail()`
- Pre-requisite: verify `visegripped.com` domain in Resend dashboard (one-time DNS step)
- Free tier: 3,000 emails/month — well within needs

## Error logging (giftmanager pattern)

- All cron errors: insert row into `application_reports` with `report`, `meta` (error details JSON), `timestamp`
- API errors: `console.error` + JSON error response
- Admin-accessible query via Drizzle for debugging (no dedicated UI needed initially)

## Google OAuth

Reuse the same Google Cloud OAuth client as giftmanager. Only change needed: add new Vercel deployment URL (and custom subdomain e.g. `stracker.visegripped.com`) to **Authorized JavaScript Origins** in Google Cloud Console.

Auth validation pattern copied from `giftmanager/lib/auth/index.ts` (tokeninfo endpoint + audience check).

## 2-year data limit

Enforced at import time in `lib/yahoo.ts`:
```ts
const period1 = Math.floor((Date.now() - 2 * 365 * 24 * 60 * 60 * 1000) / 1000);
```
The daily cron also deletes rows older than 2 years from `symbol_data` at the start of each run (one SQL statement, negligible cost).

## secretSauce

Ported to `lib/secretSauce.ts` as a server-only module (never bundled client-side; Next.js ensures this via the `server-only` package). Logic stays private and is kept out of source control the same way — `.gitignore` continues to cover it.

## Suggestions

- **Yahoo fragility**: keep the scrape fallback ported to TypeScript `fetch` (no `fopen`). If Yahoo blocks further, Alpha Vantage has a free tier (5 calls/min, 500/day) as a longer-term replacement.
- **`getAlertHistoryList` simplification**: the current PHP does N dynamic subqueries (one per alert row) hitting per-symbol tables. With `symbol_data`, this becomes a single join — significant cleanup.
- **Deploy subdomain**: `stracker.visegripped.com` (parallel to `gm.visegripped.com`), configured as a custom domain in Vercel dashboard.
- **No data migration needed**: fresh `symbol_data` table; Yahoo backfill handles history on first daily run for each active symbol.
- **`secretSauce` gitignore**: add `lib/secretSauce.ts` to `.gitignore` (same pattern as the PHP version).
- **Max function duration**: Vercel Hobby allows 10s for API routes and 60s for cron routes (Pro allows 300s). With 10 symbols and Yahoo fetches only for new ones, the cron should complete well within 60s under normal conditions.
- **Storybook / unit tests**: port PHP unit tests (e.g. `ValidationTest.php`) to Vitest; add stories for updated React components.
