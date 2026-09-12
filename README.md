# Stracker

Private stock tracker. Next.js on Vercel, Postgres on Neon.

## Local development

1. Copy `.env.example` to `.env.local` and fill in values (at minimum `POSTGRES_URL` and `GOOGLE_SHEET_CSV_URL`).
2. Put formula source in `lib/secretSauce.local.ts` (gitignored; copy from `lib/secretSauce.template.ts`).
3. Install and run:

```bash
pnpm install
pnpm dev
```

App: http://localhost:3000

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Next.js dev server |
| `pnpm build` | Production build |
| `pnpm test:once` | Run Vitest once |
| `pnpm db:push` | Push Drizzle schema to Neon |
| `pnpm seed` | Backfill Yahoo history for CSV symbols |
| `pnpm encode-secret-sauce` | Print `SECRET_SAUCE_MODULE_B64` for Vercel |

## Yahoo history import

`pnpm seed` and `/api/cron/backfill` load up to two years of daily closes from Yahoo Finance, then compute indicators.

Yahoo retired anonymous CSV download (`/v7/finance/download`). That endpoint now returns `401 User is not logged in`. The importer uses the chart API instead. Logging in at finance.yahoo.com in a browser does **not** apply to Node.

To send a logged-in session (needed if chart still 401s/404s):

1. Sign in at [finance.yahoo.com](https://finance.yahoo.com).
2. DevTools → Network → open any quote → click a `query1`/`query2.finance.yahoo.com` request.
3. Copy the `Cookie` header into `.env.local` as `YAHOO_COOKIE=...` (see `.env.example`). Restart `pnpm dev` or re-run `pnpm seed`. Cookies expire; refresh them when import starts failing again.

Ticker remaps (sheet symbol still stored in the DB):

- `SGH` is requested as `PENG` (SMART Global Holdings → Penguin Solutions).
- Extra remaps: `YAHOO_SYMBOL_ALIASES=TEF:TEF.MC` (comma-separated `SHEET:YAHOO` pairs).

A 404 with “symbol may be delisted” is often a real ticker change, not an account ban.

Vercel Hobby caps this function at **60 seconds**. The cron therefore stops starting new symbols around 50s and returns JSON (`stoppedEarly: true`) instead of a 504. Hit `/api/cron/backfill` again (or wait for the next scheduled run) to continue. For a full sheet import, run `pnpm seed` locally.

## Crons (Vercel)

Defined in `vercel.json`, Tuesday–Saturday UTC so they land Monday–Friday Pacific:

- `/api/cron/backfill` — `0 0 * * 2-6` (5 PM PT)
- `/api/cron/daily` — `0 1 * * 2-6` (6 PM PT)

Protect cron routes with `CRON_SECRET`.

## Docs

- [Vercel setup](docs/VERCEL_SETUP.md)
- [Cutover checklist](docs/CUTOVER_CHECKLIST.md)
