# Stracker

Private stock tracker. Next.js on Vercel, Postgres on Neon.

## Local development

1. Copy `.env.example` to `.env.local` and fill in values (at minimum `POSTGRES_URL`, `GOOGLE_SHEET_CSV_URL`, and `TIINGO_API_TOKEN`).
2. Put formula source in `lib/secretSauce.local.ts` (gitignored; copy from `lib/secretSauce.template.ts`).
3. Install and run:

```bash
pnpm install
pnpm dev
```

App: http://localhost:3000

## Scripts

| Command                    | Purpose                                                 |
| -------------------------- | ------------------------------------------------------- |
| `pnpm dev`                 | Next.js dev server                                      |
| `pnpm build`               | Production build                                        |
| `pnpm test:once`           | Run Vitest once                                         |
| `pnpm db:push`             | Push Drizzle schema to Neon                             |
| `pnpm seed`                | Backfill Tiingo history for CSV symbols not yet in Neon |
| `pnpm fill-gaps`           | Loop `/api/cron/backfill` until missed EOD days are filled |
| `pnpm encode-secret-sauce` | Print `SECRET_SAUCE_MODULE_B64` for Vercel              |

## History import vs daily EOD

Daily cron (`/api/cron/daily`) still uses the published **Google Sheet** for each day's close. It does not call Tiingo. It writes **today's** bar for every unique ticker on the sheet that is already in Neon.

The sheet only holds the latest close, so a missed weekday cannot be recovered from CSV. `/api/cron/backfill` first runs a **Tiingo catch-up**: for each tracked sheet symbol whose latest `symbol_data` date is before the sheet date, it fills the days after `max(date)` (about **10** stale tickers per run). Then it imports about **10** new sheet symbols that are not in Neon yet.

`pnpm seed` loads up to two years of daily closes from **Tiingo** for symbols not yet in Neon. Set `TIINGO_API_TOKEN` locally and in Vercel. Seed skips symbols already in Neon and stops on HTTP 429.

To repair a large gap quickly: `pnpm fill-gaps` (loops the production backfill route until `catchup.pending` is empty, or until Tiingo returns 429).

Ticker remaps (sheet symbol still stored in the DB):

- `SGH` is requested as `PENG` (SMART Global Holdings → Penguin Solutions).
- Extra remaps: `TIINGO_SYMBOL_ALIASES=TEF:TEF` (comma-separated `SHEET:TIINGO` pairs).

Vercel Hobby caps the backfill function at **60 seconds**. It stops starting new symbols around 50s (`stoppedEarly: true`) instead of returning a 504.

## Crons (Vercel)

Defined in `vercel.json`, Tuesday–Saturday UTC so they land Monday–Friday Pacific:

- `/api/cron/backfill` — `0 0 * * 2-6` (5 PM PT) — catch-up missed days, then new symbols
- `/api/cron/daily` — `0 1 * * 2-6` (6 PM PT) — today's sheet close for all tracked tickers

Vercel only runs these on the **Production** deployment, not Preview (for example `stracker-beta`). Hobby allows at most one run per path per day, and the clock is approximate (± about an hour). Protect both routes with `CRON_SECRET` (Vercel sends `Authorization: Bearer …` automatically).

Confirm they are scheduled: Vercel dashboard → project → **Cron Jobs**. Trigger a run:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://stracker.visegripped.com/api/cron/daily
curl -H "Authorization: Bearer $CRON_SECRET" https://stracker.visegripped.com/api/cron/backfill
```

A `401` means Production `CRON_SECRET` does not match. Empty Cron Jobs after a git push usually means the latest `vercel.json` is not on Production — redeploy Production.

## Docs

- [Vercel setup](docs/VERCEL_SETUP.md)
- [Cutover checklist](docs/CUTOVER_CHECKLIST.md)
