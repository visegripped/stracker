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

## Crons (Vercel)

Defined in `vercel.json`, Tuesday–Saturday UTC so they land Monday–Friday Pacific:

- `/api/cron/backfill` — `0 0 * * 2-6` (5 PM PT)
- `/api/cron/daily` — `0 1 * * 2-6` (6 PM PT)

Protect cron routes with `CRON_SECRET`.

## Docs

- [Vercel setup](docs/VERCEL_SETUP.md)
- [Cutover checklist](docs/CUTOVER_CHECKLIST.md)
