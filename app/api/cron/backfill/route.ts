import { NextRequest, NextResponse } from 'next/server';
import { runBackfill } from '@/lib/cron/backfill';
import { runCatchup } from '@/lib/cron/catchup';
import { shouldStopBackfill } from '@/lib/cron/backfillDeadline';
import { sendErrorEmail } from '@/lib/email';
import { logError } from '@/lib/reporting';
import { formatBackfillFailure, formatUnknownError } from '@/lib/errors';

/** Hobby/cron cap is 60s. Return before that so the client gets JSON, not a 504. */
export const maxDuration = 60;

const DEADLINE_BUDGET_MS = 50_000;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const deadlineAt = Date.now() + DEADLINE_BUDGET_MS;

    // Gaps first: the sheet only has today's close, so missed days need Tiingo.
    const catchup = await runCatchup(10, { deadlineAt });

    const backfillEmpty = {
      added: [] as string[],
      failed: [] as Array<{ symbol: string; reason: string }>,
      pending: [] as string[],
      stoppedEarly: false,
      rateLimited: false,
    };
    const backfill =
      catchup.rateLimited || shouldStopBackfill(Date.now(), deadlineAt)
        ? { ...backfillEmpty, stoppedEarly: true }
        : await runBackfill(10, { deadlineAt });

    const failed = [...catchup.failed, ...backfill.failed];
    if (failed.length > 0) {
      const errors = failed.map((f) => formatBackfillFailure(f.symbol, f.reason));
      await sendErrorEmail(errors);
    }

    const rateLimited = catchup.rateLimited || backfill.rateLimited;

    return NextResponse.json({
      success: true,
      catchup: {
        filled: catchup.filled,
        skipped: catchup.skipped,
        failed: catchup.failed,
        pending: catchup.pending,
        targetDate: catchup.targetDate,
        stoppedEarly: catchup.stoppedEarly,
        rateLimited: catchup.rateLimited,
      },
      added: backfill.added,
      failed: backfill.failed,
      pending: backfill.pending,
      stoppedEarly: catchup.stoppedEarly || backfill.stoppedEarly,
      rateLimited,
      hint: rateLimited
        ? 'Tiingo rate-limited this run. Wait before retrying; remaining symbols stay pending.'
        : catchup.pending.length > 0
          ? `${catchup.pending.length} symbol(s) still behind ${catchup.targetDate}. Re-run or wait for the next backfill cron.`
          : undefined,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? formatUnknownError(error)
        : 'Backfill cron failed';
    console.error('Backfill cron error:', error);

    await logError(message, { source: 'cron/backfill' }).catch(() => {});
    await sendErrorEmail([message]).catch(() => {});

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
