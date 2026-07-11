import { NextRequest, NextResponse } from 'next/server';
import { runBackfill } from '@/lib/cron/backfill';
import { sendErrorEmail } from '@/lib/email';
import { logError } from '@/lib/reporting';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const result = await runBackfill(5);

    if (result.failed.length > 0) {
      const errors = result.failed.map((s) => `Backfill failed for ${s}`);
      await sendErrorEmail(errors);
      for (const msg of errors) {
        await logError(msg, { source: 'cron/backfill' });
      }
    }

    return NextResponse.json({
      success: true,
      added: result.added,
      failed: result.failed,
      pending: result.pending,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Backfill cron failed';
    console.error('Backfill cron error:', error);

    await logError(message, { source: 'cron/backfill' }).catch(() => {});
    await sendErrorEmail([message]).catch(() => {});

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
