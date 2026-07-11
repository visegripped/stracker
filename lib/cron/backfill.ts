import 'server-only';
import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { schema } from '../db';
import { getDataFromHistory } from '../indicators';
import { fetchYahooHistory, twoYearsAgo } from '../yahoo';
import { fetchSheetCsv } from './csv';
import { logError } from '../reporting';

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

export interface BackfillResult {
  added: string[];
  failed: string[];
  pending: string[];
}

/**
 * Backfill new symbols from the Google Sheet CSV.
 * Processes at most `batchCap` symbols per run (default 5).
 * Symbols not processed this run are noted in `pending`.
 */
export async function runBackfill(batchCap = 5): Promise<BackfillResult> {
  const csvRows = await fetchSheetCsv(10);
  const db = getDb();

  // Find which CSV symbols are missing from the symbols table
  const existingRows = await db
    .select({ symbol: schema.symbols.symbol })
    .from(schema.symbols);
  const existing = new Set(existingRows.map((r) => r.symbol));

  const newSymbols = csvRows.filter((r) => !existing.has(r.symbol));
  const batch = newSymbols.slice(0, batchCap);
  const pending = newSymbols.slice(batchCap).map((r) => r.symbol);

  const result: BackfillResult = { added: [], failed: [], pending };

  for (const { symbol, companyName, sector, industry } of batch) {
    try {
      const period1 = twoYearsAgo();
      const yahooRows = await fetchYahooHistory(symbol, period1);

      if (yahooRows.length === 0) {
        const message = `Yahoo returned no data for ${symbol}`;
        result.failed.push(symbol);
        await logError(message, { symbol });
        continue;
      }

      const history = getDataFromHistory(yahooRows);

      await insertSymbol(symbol, companyName, sector, industry);
      await bulkInsertHistory(symbol, history);

      result.added.push(symbol);
    } catch (err) {
      const message = `Backfill failed for ${symbol}: ${err instanceof Error ? err.message : String(err)}`;
      result.failed.push(symbol);
      await logError(message, { symbol });
    }

    // Anti-rate-limit pause between symbols
    if (batch.indexOf({ symbol, companyName, sector, industry } as (typeof batch)[0]) < batch.length - 1) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  return result;
}
