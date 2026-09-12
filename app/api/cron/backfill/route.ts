import { NextRequest, NextResponse } from 'next/server';
import { runBackfill } from '@/lib/cron/backfill';
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
    const result = await runBackfill(5, {
      deadlineAt: Date.now() + DEADLINE_BUDGET_MS,
    });

    if (result.failed.length > 0) {
      const errors = result.failed.map((f) =>
        formatBackfillFailure(f.symbol, f.reason),
      );
      await sendErrorEmail(errors);
    }

    return NextResponse.json({
      success: true,
      added: result.added,
      failed: result.failed,
      pending: result.pending,
      stoppedEarly: result.stoppedEarly,
      rateLimited: result.rateLimited,
      hint: result.rateLimited
        ? 'Yahoo rate-limited this Vercel IP. Wait before retrying, or run pnpm seed locally from a residential network.'
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
