import 'server-only';
import { eq, and } from 'drizzle-orm';
import { getDb } from '../db';
import { schema } from '../db';
import { sendAlertEmail, sendSectorSummaryEmail } from '../email';
import type { AlertMatch, TodaysAlerts } from '../email';

/** Load all alerts for a given date, keyed by symbol */
async function getAlertsByDate(date: string): Promise<TodaysAlerts> {
  const db = getDb();
  const rows = await db
    .select({ symbol: schema.alerts.symbol, type: schema.alerts.type })
    .from(schema.alerts)
    .where(eq(schema.alerts.date, date));

  const result: TodaysAlerts = {};
  for (const r of rows) {
    result[r.symbol] = r.type;
  }
  return result;
}

/** Load all watchlist entries, grouped by userId */
async function getTrackedAlertsByUser(): Promise<Record<string, string[]>> {
  const db = getDb();
  const rows = await db
    .select({ symbol: schema.track.symbol, userId: schema.track.userId })
    .from(schema.track);

  const byUser: Record<string, string[]> = {};
  for (const r of rows) {
    if (!byUser[r.userId]) byUser[r.userId] = [];
    byUser[r.userId].push(r.symbol);
  }
  return byUser;
}

/** Load sector/industry for a list of symbols */
async function getSymbolMeta(
  symbols: string[]
): Promise<Record<string, { sector: string | null; industry: string | null }>> {
  if (symbols.length === 0) return {};
  const db = getDb();
  const rows = await db
    .select({ symbol: schema.symbols.symbol, sector: schema.symbols.sector, industry: schema.symbols.industry })
    .from(schema.symbols);

  const meta: Record<string, { sector: string | null; industry: string | null }> = {};
  for (const r of rows) {
    if (symbols.includes(r.symbol)) {
      meta[r.symbol] = { sector: r.sector, industry: r.industry };
    }
  }
  return meta;
}

export interface AlertsResult {
  emailsSent: number;
  sectorSummaryEmails: number;
}

/**
 * Send per-user alert emails and owner sector summary.
 * Fixes two bugs from the PHP version:
 *   1. getAlertsByDate used wrong variable ($endDate instead of $date)
 *   2. formatEmailBody used $key instead of $symbol in links
 */
export async function runAlertEmails(
  alertsForToday: Record<string, string>
): Promise<AlertsResult> {
  const today = new Date().toISOString().slice(0, 10);

  const todaysAlerts: TodaysAlerts =
    Object.keys(alertsForToday).length > 0
      ? alertsForToday
      : await getAlertsByDate(today);

  if (Object.keys(todaysAlerts).length === 0) {
    return { emailsSent: 0, sectorSummaryEmails: 0 };
  }

  const trackedByUser = await getTrackedAlertsByUser();
  const alertSymbols = Object.keys(todaysAlerts);
  const meta = await getSymbolMeta(alertSymbols);

  let emailsSent = 0;

  for (const [userId, watchlist] of Object.entries(trackedByUser)) {
    const matched: AlertMatch[] = watchlist
      .filter((sym) => todaysAlerts[sym] !== undefined)
      .map((sym) => ({
        symbol: sym,
        type: todaysAlerts[sym],
        sector: meta[sym]?.sector ?? null,
        industry: meta[sym]?.industry ?? null,
      }));

    if (matched.length === 0) continue;

    await sendAlertEmail(userId, matched, todaysAlerts);
    emailsSent++;
  }

  // Build sector summary
  const bySector: Record<
    string,
    { symbol: string; type: string; industry: string | null }[]
  > = {};

  for (const sym of alertSymbols) {
    const sector = meta[sym]?.sector ?? 'Uncategorized';
    if (!bySector[sector]) bySector[sector] = [];
    bySector[sector].push({
      symbol: sym,
      type: todaysAlerts[sym],
      industry: meta[sym]?.industry ?? null,
    });
  }

  await sendSectorSummaryEmail(bySector);

  return { emailsSent, sectorSummaryEmails: 1 };
}
