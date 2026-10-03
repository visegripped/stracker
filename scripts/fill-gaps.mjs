/**
 * Loop production (or local) `/api/cron/backfill?catchup=1` until catch-up
 * pending is empty or Tiingo rate-limits. Each call fills about 10 stale symbols.
 * The scheduled backfill cron does **not** pass this flag (new symbols only).
 *
 *   pnpm fill-gaps
 *   FILL_GAPS_URL=http://localhost:3000/api/cron/backfill pnpm fill-gaps
 *
 * Reads CRON_SECRET from .env.local (via --env-file).
 */

const CRON_SECRET = process.env.CRON_SECRET;
const BASE_URL =
  process.env.FILL_GAPS_URL ||
  'https://stracker.visegripped.com/api/cron/backfill';

if (!CRON_SECRET) {
  console.error('CRON_SECRET not set. Copy .env.example to .env.local first.');
  process.exit(1);
}

function catchupUrl(raw) {
  const url = new URL(raw);
  url.searchParams.set('catchup', '1');
  return url.toString();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const URL = catchupUrl(BASE_URL);
  console.log(`Catch-up target: ${URL}`);

  for (let round = 1; ; round++) {
    console.log(`\nRound ${round}...`);
    const res = await fetch(URL, {
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      console.error(`HTTP ${res.status}: response was not JSON`);
      console.error(text.slice(0, 400));
      process.exit(1);
    }

    if (!res.ok) {
      console.error(`HTTP ${res.status}:`, json);
      process.exit(1);
    }

    const catchup = json.catchup ?? {};
    console.log(
      JSON.stringify(
        {
          targetDate: catchup.targetDate,
          filled: catchup.filled,
          skipped: catchup.skipped,
          failed: catchup.failed,
          pendingCount: (catchup.pending ?? []).length,
          added: json.added,
          rateLimited: json.rateLimited,
          stoppedEarly: json.stoppedEarly,
          hint: json.hint,
        },
        null,
        2,
      ),
    );

    if (json.rateLimited || catchup.rateLimited) {
      console.error(
        '\nTiingo rate-limited this run. Wait 15–30 minutes, then pnpm fill-gaps again.',
      );
      process.exit(1);
    }

    if (catchup.enabled === false) {
      console.error(
        'Catch-up did not run. This script requires /api/cron/backfill?catchup=1.',
      );
      process.exit(1);
    }

    const pending = catchup.pending ?? [];
    if (pending.length === 0) {
      console.log('\nNo stale symbols remaining.');
      return;
    }

    console.log(`${pending.length} still behind. Waiting 5s...`);
    await sleep(5_000);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
