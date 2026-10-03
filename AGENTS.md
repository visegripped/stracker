<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Stracker cron notes

- `/api/cron/backfill` scheduled job imports **new symbols only**.
- Tiingo missed-day catch-up is implemented in `lib/cron/catchup.ts` but **off unless** `?catchup=1` (see README and `.cursor/rules/stracker.mdc`).
- `/api/cron/daily` writes today's Google Sheet close and sends alert emails.
