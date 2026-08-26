import 'server-only';
import { getDb } from '../db';
import { schema } from '../db';
import { getDataFromHistory } from '../indicators';
import { fetchYahooHistory, twoYearsAgo } from '../yahoo';
import { fetchSheetCsv, selectUntrackedBatch } from './csv';
import { logError } from '../reporting';
import { formatBackfillFailure, formatUnknownError } from '../errors';

/** Insert a row into the symbols table (upsert — safe to re-run) */
async function insertSymbol(
  symbol: string,
  name: string,
  sector: string | null,
  industry: string | null
): Promise<void> {
  const db = getDb();
  await db
    .insert(schema.symbols)
    .values({ symbol, name, sector, industry })
    .onConflictDoUpdate({
      target: schema.symbols.symbol,
      set: { name, sector, industry },
    });
}

/** Bulk-insert computed indicator rows for a symbol */
async function bulkInsertHistory(
  symbol: string,
  history: ReturnType<typeof getDataFromHistory>
): Promise<void> {
  if (history.length === 0) return;
  const db = getDb();

  const values = history.map((row) => ({
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

  // Insert in chunks to avoid query size limits
  const CHUNK = 500;
  for (let i = 0; i < values.length; i += CHUNK) {
    await db
      .insert(schema.symbolData)
      .values(values.slice(i, i + CHUNK))
      .onConflictDoNothing();
  }
}

export interface BackfillFailure {
  symbol: string;
  reason: string;
}

export interface BackfillResult {
  added: string[];
  failed: BackfillFailure[];
  pending: string[];
}

/**
 * Backfill untracked symbols from the Google Sheet CSV.
 * Each run processes at most `batchCap` symbols that are not yet in `symbols`
 * (default 5), so successive runs walk the rest of the sheet.
 */
export async function runBackfill(batchCap = 5): Promise<BackfillResult> {
  const csvRows = await fetchSheetCsv();
  const db = getDb();

  const existingRows = await db
    .select({ symbol: schema.symbols.symbol })
    .from(schema.symbols);
  const existing = new Set(existingRows.map((r) => r.symbol));

  const { batch, pending } = selectUntrackedBatch(csvRows, existing, batchCap);

  const result: BackfillResult = { added: [], failed: [], pending };

  for (let i = 0; i < batch.length; i++) {
    const { symbol, companyName, sector, industry } = batch[i];
    try {
      const period1 = twoYearsAgo();
      const yahooRows = await fetchYahooHistory(symbol, period1);

      if (yahooRows.length === 0) {
        const reason = 'Yahoo returned no data (empty series after CSV and chart fetch)';
        result.failed.push({ symbol, reason });
        await logError(formatBackfillFailure(symbol, reason), {
          symbol,
          reason,
          source: 'cron/backfill',
        });
        continue;
      }

      const history = getDataFromHistory(yahooRows);
      if (history.length === 0) {
        const reason = `Computed 0 indicator rows from ${yahooRows.length} Yahoo bars`;
        result.failed.push({ symbol, reason });
        await logError(formatBackfillFailure(symbol, reason), {
          symbol,
          reason,
          source: 'cron/backfill',
        });
        continue;
      }

      await insertSymbol(symbol, companyName, sector, industry);
      await bulkInsertHistory(symbol, history);

      result.added.push(symbol);
    } catch (err) {
      const reason = formatUnknownError(err);
      result.failed.push({ symbol, reason });
      await logError(formatBackfillFailure(symbol, reason), {
        symbol,
        reason,
        source: 'cron/backfill',
        stack: err instanceof Error ? err.stack : undefined,
      });
    }

    if (i < batch.length - 1) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  return result;
}
