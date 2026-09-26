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
| `pnpm encode-secret-sauce` | Print `SECRET_SAUCE_MODULE_B64` for Vercel              |

## History import vs daily EOD

Daily cron (`/api/cron/daily`) still uses the published **Google Sheet** for each day's close. It does not call Tiingo.

`pnpm seed` and `/api/cron/backfill` load up to two years of daily closes from **Tiingo**, then compute indicators. Set `TIINGO_API_TOKEN` locally and in Vercel.

The backfill cron processes about **10** new sheet symbols per weekday. Remaining names stay in `pending` until later runs. Seed skips symbols already in Neon and stops on HTTP 429.

Ticker remaps (sheet symbol still stored in the DB):

- `SGH` is requested as `PENG` (SMART Global Holdings → Penguin Solutions).
- Extra remaps: `TIINGO_SYMBOL_ALIASES=TEF:TEF` (comma-separated `SHEET:TIINGO` pairs).

Vercel Hobby caps the backfill function at **60 seconds**. It stops starting new symbols around 50s (`stoppedEarly: true`) instead of returning a 504.

## Crons (Vercel)

Defined in `vercel.json`, Tuesday–Saturday UTC so they land Monday–Friday Pacific:

- `/api/cron/backfill` — `0 0 * * 2-6` (5 PM PT)
- `/api/cron/daily` — `0 1 * * 2-6` (6 PM PT)

Protect cron routes with `CRON_SECRET`.

## Docs

- [Vercel setup](docs/VERCEL_SETUP.md)
- [Cutover checklist](docs/CUTOVER_CHECKLIST.md)
