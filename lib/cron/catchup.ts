import 'server-only';
import { sql } from 'drizzle-orm';
import { getDb } from '../db';
import { schema } from '../db';
import { getDataFromHistory } from '../indicators';
import { fetchTiingoHistory } from '../tiingo';
import { fetchSheetCsv, uniqueSheetRows } from './csv';
import { logError } from '../reporting';
import {
  formatBackfillFailure,
  formatUnknownError,
  isTiingoRateLimitError,
} from '../errors';
import {
  prependUnprocessedToPending,
  shouldStopBackfill,
} from './backfillDeadline';
import type { EodRow } from '../indicators';

export function toIsoDate(value: string | Date): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

export function nextIsoDay(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export interface LastBar {
  symbol: string;
  lastDate: string;
}

export function selectStaleSymbols(
  lastBars: LastBar[],
  targetDate: string,
  batchCap: number,
): { batch: LastBar[]; pending: string[] } {
  const stale = lastBars
    .filter((row) => row.lastDate < targetDate)
    .sort(
      (a, b) =>
        a.lastDate.localeCompare(b.lastDate) || a.symbol.localeCompare(b.symbol),
    );
  return {
    batch: stale.slice(0, batchCap),
    pending: stale.slice(batchCap).map((row) => row.symbol),
  };
}

async function getRecentHistory(symbol: string, maxRows = 75): Promise<EodRow[]> {
  const db = getDb();
  const rows = await db
    .select({ date: schema.symbolData.date, eod: schema.symbolData.eod })
    .from(schema.symbolData)
    .where(sql`${schema.symbolData.symbol} = ${symbol}`)
    .orderBy(sql`${schema.symbolData.date} DESC`)
    .limit(maxRows);

  return rows.reverse().map((r) => ({ date: r.date, eod: r.eod }));
}

async function insertMissingDays(
  symbol: string,
  rows: ReturnType<typeof getDataFromHistory>,
): Promise<number> {
  if (rows.length === 0) return 0;
  const db = getDb();
  const values = rows.map((row) => ({
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
  }));

  const CHUNK = 500;
  for (let i = 0; i < values.length; i += CHUNK) {
    await db
      .insert(schema.symbolData)
      .values(values.slice(i, i + CHUNK))
      .onConflictDoNothing();
  }
  return values.length;
}

export interface CatchupResult {
  filled: string[];
  skipped: string[];
  failed: Array<{ symbol: string; reason: string }>;
  pending: string[];
  targetDate: string | null;
  stoppedEarly: boolean;
  rateLimited: boolean;
}

export interface CatchupOptions {
  deadlineAt?: number;
}

/**
 * Fill missing EOD days after each symbol's latest stored bar, using Tiingo.
 * Daily sheet updates only insert "today"; this repairs days the cron missed.
 *
 * Not run by the scheduled `/api/cron/backfill` job. Call runCatchup only when
 * the request includes `?catchup=1` (see `isCatchupRequested`).
 */
export async function runCatchup(
  batchCap = 10,
  options: CatchupOptions = {},
): Promise<CatchupResult> {
  const csvRows = uniqueSheetRows(await fetchSheetCsv());
  const sheetSymbols = new Set(csvRows.map((row) => row.symbol));
  const targetDate = csvRows.reduce<string | null>((max, row) => {
    if (!max || row.tradeDate > max) return row.tradeDate;
    return max;
  }, null);

  const result: CatchupResult = {
    filled: [],
    skipped: [],
    failed: [],
    pending: [],
    targetDate,
    stoppedEarly: false,
    rateLimited: false,
  };

  if (!targetDate) return result;

  const db = getDb();
  const lastBars: LastBar[] = (
    await db
      .select({
        symbol: schema.symbolData.symbol,
        lastDate: sql<string>`max(${schema.symbolData.date})`.as('lastDate'),
      })
      .from(schema.symbolData)
      .groupBy(schema.symbolData.symbol)
  )
    .map((row) => ({
      symbol: row.symbol,
      lastDate: toIsoDate(row.lastDate),
    }))
    .filter((row) => sheetSymbols.has(row.symbol));

  const { batch, pending } = selectStaleSymbols(lastBars, targetDate, batchCap);
  result.pending = pending;
  const serverless = Boolean(process.env.VERCEL);

  for (let i = 0; i < batch.length; i++) {
    if (shouldStopBackfill(Date.now(), options.deadlineAt)) {
      result.pending = prependUnprocessedToPending(batch, i, result.pending);
      result.stoppedEarly = true;
      break;
    }

    const { symbol, lastDate } = batch[i];
    try {
      const startDate = nextIsoDay(lastDate);
      if (startDate > targetDate) {
        result.skipped.push(symbol);
        continue;
      }

      const tiingoRows = await fetchTiingoHistory(symbol, startDate, targetDate);
      const recent = await getRecentHistory(symbol, 75);
      const have = new Set(recent.map((r) => r.date));
      const missing = tiingoRows.filter((row) => !have.has(row.date));
      if (missing.length === 0) {
        result.skipped.push(symbol);
        continue;
      }

      const combined = [...recent, ...missing];
      const computed = getDataFromHistory(combined);
      const newDates = new Set(missing.map((row) => row.date));
      const toInsert = computed.filter((row) => newDates.has(row.date));
      await insertMissingDays(symbol, toInsert);
      result.filled.push(symbol);
    } catch (err) {
      if (isTiingoRateLimitError(err)) {
        result.pending = prependUnprocessedToPending(batch, i, result.pending);
        result.stoppedEarly = true;
        result.rateLimited = true;
        break;
      }
      const reason = formatUnknownError(err);
      result.failed.push({ symbol, reason });
      await logError(formatBackfillFailure(symbol, reason), {
        symbol,
        reason,
        source: 'cron/catchup',
        stack: err instanceof Error ? err.stack : undefined,
      });
    }

    if (i < batch.length - 1) {
      await new Promise((r) => setTimeout(r, serverless ? 800 : 500));
    }
  }

  return result;
}
