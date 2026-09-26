/**
 * Seed script — backfills missing CSV symbols with 2 years of Tiingo history.
 * Run locally: pnpm seed
 * Reads POSTGRES_URL and TIINGO_API_TOKEN from .env.local (via --env-file).
 *
 * Avoids Vercel 60s function timeout since this runs as a plain Node script.
 * Daily EOD updates still come from the Google Sheet, not this script.
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const POSTGRES_URL = process.env.POSTGRES_URL;
if (!POSTGRES_URL) {
  console.error('POSTGRES_URL not set. Copy .env.example to .env.local first.');
  process.exit(1);
}

const GOOGLE_SHEET_CSV_URL = process.env.GOOGLE_SHEET_CSV_URL;
if (!GOOGLE_SHEET_CSV_URL) {
  console.error('GOOGLE_SHEET_CSV_URL not set. Check .env.local.');
  process.exit(1);
}

const TIINGO_API_TOKEN = process.env.TIINGO_API_TOKEN?.trim();
if (!TIINGO_API_TOKEN) {
  console.error('TIINGO_API_TOKEN not set. Check .env.local.');
  process.exit(1);
}

const sql = neon(POSTGRES_URL);
const db = drizzle(sql);

// ──────────────────────────────────────────────────────────────────────────────

function round2(n) {
  return Math.round(n * 100) / 100;
}

function calcMA(data, n) {
  const slice = data.slice(-n);
  return round2(slice.reduce((a, b) => a + b, 0) / n);
}

function getDataFromHistory(history) {
  const eodPrices = [];
  const deltas = [];
  const result = [];

  for (let i = 0; i < history.length; i++) {
    const { date, eod: rawEod } = history[i];
    const eod = parseFloat(rawEod);
    if (!isFinite(eod)) continue;
    eodPrices.push(eod);

    let ma20 = 0,
      delta = 0,
      deltaMa5 = 0,
      deltaMa10 = 0,
      deltaMa20 = 0,
      m1 = 0,
      m2 = 0,
      m3 = 0,
      ma50 = 0;

    if (i > 20) {
      ma20 = calcMA(eodPrices, 20);
      delta = round2(eod - ma20);
      deltas.push(delta);
    }
    if (i > 25) {
      deltaMa5 = calcMA(deltas, 5);
      deltaMa10 = calcMA(deltas, 10);
      deltaMa20 = calcMA(deltas, 20);
      m1 = round2(ma20 + deltaMa5);
      m2 = round2(ma20 + deltaMa10);
      m3 = round2(ma20 + deltaMa20);
    }
    if (i > 50) ma50 = calcMA(eodPrices, 50);

    // Simple P0/P1/P2 (placeholder — real logic is in lib/secretSauce.ts)
    const p0 = m1 - ma20 > 0 ? 1 : 0;
    const p1 = m2 - m3 > 0 ? 1 : 0;
    const p2 = m1 - m2 > 0 ? 1 : 0;

    result.push({
      date,
      eod,
      delta,
      deltaMa5,
      deltaMa10,
      deltaMa20,
      ma20,
      ma50,
      m1,
      m2,
      m3,
      p0,
      p1,
      p2,
    });
  }
  return result;
}

function parseCsvDate(raw) {
  if (!raw) return null;
  const datePart = raw.split(' ')[0];
  const parts = datePart.split('/');
  if (parts.length !== 3) return null;
  const [m, d, y] = parts;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

async function fetchSheetCsv() {
  const res = await fetch(GOOGLE_SHEET_CSV_URL);
  if (!res.ok) throw new Error(`CSV fetch failed: ${res.status}`);
  const text = await res.text();
  const lines = text.trim().split('\n');
  const rows = [];
  for (const line of lines) {
    const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    const symbol = cols[0];
    const rawPrice = cols[1];
    const rawDate = cols[2];
    const companyName = cols[3] ?? '';
    const sector = cols[4] || null;
    const industry = cols[5] || null;
    if (!symbol || !isFinite(parseFloat(rawPrice))) continue;
    const tradeDate = parseCsvDate(rawDate);
    if (!tradeDate) continue;
    rows.push({
      symbol: symbol.toUpperCase(),
      eod: parseFloat(rawPrice),
      tradeDate,
      companyName,
      sector,
      industry,
    });
  }
  return rows;
}

function twoYearsAgoDate() {
  return new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

const TIINGO_ALIASES = {
  SGH: 'PENG',
  ...(
    process.env.TIINGO_SYMBOL_ALIASES ||
    process.env.YAHOO_SYMBOL_ALIASES ||
    ''
  )
    .split(',')
    .reduce((acc, pair) => {
      const [from, to] = pair.split(':').map((s) => s.trim().toUpperCase());
      if (from && to) acc[from] = to;
      return acc;
    }, {}),
};

class TiingoRateLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TiingoRateLimitError';
  }
}

function parseTiingoPrices(json) {
  if (!Array.isArray(json)) {
    throw new Error('Tiingo response was not a price array');
  }
  const rows = [];
  for (const item of json) {
    const date = item.date?.slice(0, 10);
    const price = item.adjClose ?? item.close;
    if (!date || price == null || !isFinite(price) || price <= 0) continue;
    rows.push({ date, eod: price });
  }
  if (rows.length === 0) throw new Error('Tiingo returned no usable closes');
  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchTiingoHistory(symbol) {
  const tiingoSymbol = TIINGO_ALIASES[symbol] || symbol;
  const startDate = twoYearsAgoDate();
  const endDate = new Date().toISOString().slice(0, 10);
  const url =
    `https://api.tiingo.com/tiingo/daily/${encodeURIComponent(tiingoSymbol)}/prices` +
    `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Token ${TIINGO_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
  const text = await res.text();
  if (res.status === 429 || res.status === 503) {
    throw new TiingoRateLimitError(
      `Tiingo HTTP ${res.status}: ${text.slice(0, 120)}`,
    );
  }
  if (!res.ok) {
    throw new Error(
      `Tiingo returned no history for ${symbol}${tiingoSymbol !== symbol ? ` as ${tiingoSymbol}` : ''} (HTTP ${res.status}: ${text.slice(0, 120)})`,
    );
  }
  return parseTiingoPrices(JSON.parse(text));
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ──────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching CSV symbols...');
  const csvRows = await fetchSheetCsv();
  console.log(`Found ${csvRows.length} symbols in CSV`);

  const existingRows = await sql`SELECT symbol FROM symbols`;
  const existing = new Set(existingRows.map((r) => r.symbol));
  const toImport = csvRows.filter((row, i, all) => {
    if (existing.has(row.symbol)) return false;
    return all.findIndex((r) => r.symbol === row.symbol) === i;
  });
  console.log(
    `Already in Neon: ${existing.size}. Remaining to import: ${toImport.length}`,
  );
  if (toImport.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  for (let i = 0; i < toImport.length; i++) {
    const { symbol, companyName, sector, industry } = toImport[i];
    console.log(`\n→ ${symbol} (${companyName}) [${i + 1}/${toImport.length}]`);

    try {
      const tiingoRows = await fetchTiingoHistory(symbol);
      if (tiingoRows.length === 0) {
        console.warn(`  No Tiingo data for ${symbol}`);
        continue;
      }

      const history = getDataFromHistory(tiingoRows);
      console.log(
        `  ${tiingoRows.length} raw rows → ${history.length} computed rows`,
      );

      // Upsert symbol
      await sql`
        INSERT INTO symbols (symbol, name, sector, industry)
        VALUES (${symbol}, ${companyName}, ${sector}, ${industry})
        ON CONFLICT (symbol) DO UPDATE SET name = EXCLUDED.name, sector = EXCLUDED.sector, industry = EXCLUDED.industry
      `;

      // Bulk-insert in chunks
      const CHUNK = 500;
      let inserted = 0;
      for (let j = 0; j < history.length; j += CHUNK) {
        const chunk = history.slice(j, j + CHUNK);
        for (const row of chunk) {
          await sql`
            INSERT INTO symbol_data (symbol, date, eod, ma20, ma50, delta, delta_ma5, delta_ma10, delta_ma20, m1, m2, m3, p0, p1, p2)
            VALUES (
              ${symbol}, ${row.date}, ${String(row.eod)},
              ${row.ma20 || null}, ${row.ma50 || null},
              ${String(row.delta)}, ${String(row.deltaMa5)}, ${String(row.deltaMa10)}, ${String(row.deltaMa20)},
              ${row.m1 || null}, ${row.m2 || null}, ${row.m3 || null},
              ${row.p0}, ${row.p1}, ${row.p2}
            )
            ON CONFLICT DO NOTHING
          `;
          inserted++;
        }
      }
      console.log(`  Inserted ${inserted} rows`);
    } catch (err) {
      if (err instanceof TiingoRateLimitError) {
        console.error(`  Rate limited: ${err.message}`);
        console.error(
          `\nStopped. ${toImport.length - i} symbol(s) not imported (including ${symbol}).`,
        );
        console.error(
          'Wait 15–30 minutes, then run pnpm seed again. Existing Neon rows were left as-is.',
        );
        process.exit(1);
      }
      console.error(`  Failed: ${err.message}`);
    }

    if (i < toImport.length - 1) {
      await sleep(1500);
    }
  }

  console.log('\nSeed complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
