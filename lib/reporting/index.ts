import 'server-only';
import { getDb } from '../db';
import { applicationReports } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';

export type ReportType = 'error' | 'warning' | 'info' | 'debug';

export async function logReport(
  reportType: ReportType,
  message: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  if (!process.env.POSTGRES_URL) {
    console.error('[reporting] POSTGRES_URL not set, skipping DB report:', message);
    return;
  }

  try {
    const db = getDb();
    await db.insert(applicationReports).values({
      stid: uuidv4(),
      reportType,
      message,
      metadata: metadata ?? null,
    });
  } catch (err) {
    console.error('[reporting] Failed to insert report:', err, { message, metadata });
  }
}

export async function logError(
  message: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  console.error('[stracker error]', message, metadata);
  await logReport('error', message, metadata);
}
