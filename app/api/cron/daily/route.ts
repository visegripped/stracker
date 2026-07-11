import { NextRequest, NextResponse } from 'next/server';
import { runDailyUpdate } from '@/lib/cron/daily';
import { runAlertEmails } from '@/lib/cron/alerts';
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
    // Step 1: Daily EOD update (must complete before step 2)
    const updateResult = await runDailyUpdate();

    if (updateResult.errors.length > 0) {
      await sendErrorEmail(updateResult.errors);
      for (const msg of updateResult.errors) {
        await logError(msg, { source: 'cron/daily' });
      }
    }

    // Step 2: Alert emails (uses today's alerts produced in step 1)
    const alertResult = await runAlertEmails(updateResult.alerts);

    return NextResponse.json({
      success: true,
      processed: updateResult.processed,
      skipped: updateResult.skipped,
      errors: updateResult.errors,
      alerts: updateResult.alerts,
      emailsSent: alertResult.emailsSent,
      sectorSummaryEmails: alertResult.sectorSummaryEmails,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Daily cron failed';
    console.error('Daily cron error:', error);

    await logError(message, { source: 'cron/daily' }).catch(() => {});
    await sendErrorEmail([message]).catch(() => {});

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
