import 'server-only';
import { eq, and, sql, lt } from 'drizzle-orm';
import { getDb } from '../db';
import { schema } from '../db';
import { getDataFromHistory, signalAlignment } from '../indicators';
import { fetchSheetCsv } from './csv';
import { logError } from '../reporting';
import type { EodRow } from '../indicators';

const TWO_YEARS_AGO_SQL = sql`NOW() - INTERVAL '2 years'`;

/** Delete symbol_data rows older than 2 years */
async function pruneOldData(): Promise<void> {
  const db = getDb();
  await db
    .delete(schema.symbolData)
    .where(lt(schema.symbolData.date, TWO_YEARS_AGO_SQL));
}

/** Load last N EOD rows for a symbol, ordered oldest-first */
async function getRecentHistory(symbol: string, maxRows = 75): Promise<EodRow[]> {
  const db = getDb();
  const rows = await db
    .select({ date: schema.symbolData.date, eod: schema.symbolData.eod })
    .from(schema.symbolData)
    .where(eq(schema.symbolData.symbol, symbol))
    .orderBy(sql`${schema.symbolData.date} DESC`)
    .limit(maxRows);

  // Reverse to get chronological order
  return rows.reverse().map((r) => ({ date: r.date, eod: r.eod }));
}

/** Upsert a single day's computed indicator row */
async function upsertLatestDay(
  symbol: string,
  row: ReturnType<typeof getDataFromHistory>[number]
): Promise<void> {
  const db = getDb();
  await db
    .insert(schema.symbolData)
    .values({
      symbol,
      date: row.date,
      eod: String(row.eod),
      ma20: row.ma20 ? String(row.ma20) : null,
      ma50: row.ma50 ? String(row.ma50) : null,
      delta: String(row.delta),
      deltaMa5: String(row.deltaMa5),
      deltaMa10: String(row.deltaMa10),
      deltaMa20: String(row.deltaMa20),
      m1: row.m1 ? String(row.m1) : null,
      m2: row.m2 ? String(row.m2) : null,
      m3: row.m3 ? String(row.m3) : null,
      p0: row.p0,
      p1: row.p1,
      p2: row.p2,
    })
    .onConflictDoUpdate({
      target: [schema.symbolData.symbol, schema.symbolData.date],
      set: {
        eod: String(row.eod),
        ma20: row.ma20 ? String(row.ma20) : null,
        ma50: row.ma50 ? String(row.ma50) : null,
        delta: String(row.delta),
        deltaMa5: String(row.deltaMa5),
        deltaMa10: String(row.deltaMa10),
        deltaMa20: String(row.deltaMa20),
        m1: row.m1 ? String(row.m1) : null,
        m2: row.m2 ? String(row.m2) : null,
        m3: row.m3 ? String(row.m3) : null,
        p0: row.p0,
        p1: row.p1,
        p2: row.p2,
      },
    });
}

/** Upsert alert (idempotent via unique constraint on date+symbol+type) */
async function recordAlert(date: string, symbol: string, type: string): Promise<void> {
  const db = getDb();
  await db
    .insert(schema.alerts)
    .values({ date, symbol, type })
    .onConflictDoNothing();
}

/** Refresh symbol name/sector/industry from CSV data */
async function refreshSymbolMeta(
  symbol: string,
  name: string,
  sector: string | null,
  industry: string | null
): Promise<void> {
  const db = getDb();
  await db
    .update(schema.symbols)
    .set({ name, sector, industry })
    .where(eq(schema.symbols.symbol, symbol));
}

export interface DailyUpdateResult {
  processed: string[];
  alerts: Record<string, string>;
  skipped: string[];
  errors: string[];
}

/**
 * Main daily update logic.
 * Handles EXISTING symbols only — new symbols are handled by backfill cron.
 */
export async function runDailyUpdate(): Promise<DailyUpdateResult> {
  const csvRows = await fetchSheetCsv(10);
  const db = getDb();

  await pruneOldData();

  const result: DailyUpdateResult = {
    processed: [],
    alerts: {},
    skipped: [],
    errors: [],
  };

  for (const row of csvRows) {
    const { symbol, eod, tradeDate, companyName, sector, industry } = row;

    // Check if symbol exists in our DB
    const [existingSymbol] = await db
      .select({ symbol: schema.symbols.symbol })
      .from(schema.symbols)
      .where(eq(schema.symbols.symbol, symbol))
      .limit(1);

    if (!existingSymbol) {
      result.skipped.push(symbol);
      continue;
    }

    // Idempotency: skip if this date is already processed
    const [existing] = await db
      .select({ date: schema.symbolData.date })
      .from(schema.symbolData)
      .where(
        and(
          eq(schema.symbolData.symbol, symbol),
          eq(schema.symbolData.date, tradeDate)
        )
      )
      .limit(1);

    if (existing) {
      result.skipped.push(symbol);
      continue;
    }

    try {
      // Load recent history and append today's price
      const recentHistory = await getRecentHistory(symbol, 75);
      recentHistory.push({ date: tradeDate, eod: String(eod) });

      // Compute all indicators
      const history = getDataFromHistory(recentHistory);
      if (history.length === 0) {
        result.errors.push(`No indicator data computed for ${symbol}`);
        continue;
      }

      // Upsert only the most recent day
      const latestDay = history[history.length - 1];
      await upsertLatestDay(symbol, latestDay);

      // Refresh meta from CSV
      await refreshSymbolMeta(symbol, companyName, sector, industry);

      // Check for buy/sell signal transition
      const alertType = signalAlignment(history);
      if (alertType) {
        await recordAlert(tradeDate, symbol, alertType);
        result.alerts[symbol] = alertType;
      }

      result.processed.push(symbol);
    } catch (err) {
      const message = `Error processing ${symbol}: ${err instanceof Error ? err.message : String(err)}`;
      result.errors.push(message);
      await logError(message, { symbol });
    }
  }

  return result;
}
