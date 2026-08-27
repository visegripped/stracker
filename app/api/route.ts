import { NextRequest, NextResponse } from 'next/server';
import { isValidGoogleAccessToken } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { schema } from '@/lib/db';
import { eq, and, between, desc, sql, inArray } from 'drizzle-orm';

// ─── validation ──────────────────────────────────────────────────────────────

function isValidSymbol(symbol: unknown): symbol is string {
  if (!symbol || typeof symbol !== 'string') return false;
  if (symbol.length > 10) return false;
  return /^[A-Za-z.]+$/.test(symbol);
}

function isValidDate(date: unknown): date is string {
  if (!date || typeof date !== 'string') return false;
  return /^\d{6,8}$/.test(date);
}

function isValidEmail(email: unknown): email is string {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Convert 8-digit string YYYYMMDD to ISO date YYYY-MM-DD */
function toIsoDate(raw: string): string {
  if (raw.length === 8) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }
  return raw;
}

// ─── handlers ────────────────────────────────────────────────────────────────

async function getHistory(
  symbol: string,
  startDate: string,
  endDate: string
) {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.symbolData)
    .where(
      and(
        eq(schema.symbolData.symbol, symbol),
        between(schema.symbolData.date, toIsoDate(startDate), toIsoDate(endDate))
      )
    )
    .orderBy(schema.symbolData.date);

  return rows.map((r) => ({
    date: r.date,
    EOD: r.eod,
    MA20: r.ma20,
    MA50: r.ma50,
    delta: r.delta,
    deltaMA5: r.deltaMa5,
    deltaMA10: r.deltaMa10,
    deltaMA20: r.deltaMa20,
    P0: r.p0,
    P1: r.p1,
    P2: r.p2,
    M1: r.m1,
    M2: r.m2,
    M3: r.m3,
  }));
}

async function getSymbols() {
  const db = getDb();
  const rows = await db
    .select({
      symbol: schema.symbols.symbol,
      name: schema.symbols.name,
      sector: schema.symbols.sector,
      industry: schema.symbols.industry,
    })
    .from(schema.symbols)
    .orderBy(schema.symbols.symbol);
  return rows;
}

async function getAlerts(symbol: string, limit: number) {
  const db = getDb();
  return db
    .select()
    .from(schema.alerts)
    .where(eq(schema.alerts.symbol, symbol))
    .orderBy(desc(schema.alerts.date))
    .limit(limit);
}

async function getAlertHistory(limit: number, alertTypes: string[]) {
  const db = getDb();
  let query = db
    .select({
      symbol: schema.alerts.symbol,
      date: schema.alerts.date,
      type: schema.alerts.type,
      id: schema.alerts.id,
      name: schema.symbols.name,
      sector: schema.symbols.sector,
      industry: schema.symbols.industry,
    })
    .from(schema.alerts)
    .innerJoin(schema.symbols, eq(schema.alerts.symbol, schema.symbols.symbol))
    .orderBy(desc(schema.alerts.date))
    .limit(limit);

  if (alertTypes.length > 0) {
    query = query.where(inArray(schema.alerts.type, alertTypes)) as typeof query;
  }

  return query;
}

async function getAlertHistoryList(limit: number, alertTypes: string[]) {
  const db = getDb();
  const currentYear = new Date().getFullYear();
  const yearStart = `${currentYear}-01-02`;

  let baseQuery = db
    .select({
      symbol: schema.alerts.symbol,
      date: schema.alerts.date,
      type: schema.alerts.type,
      id: schema.alerts.id,
      name: schema.symbols.name,
      sector: schema.symbols.sector,
      industry: schema.symbols.industry,
    })
    .from(schema.alerts)
    .innerJoin(schema.symbols, eq(schema.alerts.symbol, schema.symbols.symbol))
    .orderBy(desc(schema.alerts.date))
    .limit(limit);

  if (alertTypes.length > 0) {
    baseQuery = baseQuery.where(inArray(schema.alerts.type, alertTypes)) as typeof baseQuery;
  }

  const alertRows = await baseQuery;
  const alertSymbols = [...new Set(alertRows.map((r) => r.symbol))];

  if (alertSymbols.length === 0) return alertRows;

  // Single join query to get yearStartEOD, lastEOD, previousDayEOD for all symbols
  const priceRows = await db
    .select({
      symbol: schema.symbolData.symbol,
      yearStartEOD: sql<string>`MAX(CASE WHEN ${schema.symbolData.date} = ${yearStart} THEN ${schema.symbolData.eod} END)`,
      lastEOD: sql<string>`MAX(CASE WHEN ${schema.symbolData.date} = (SELECT MAX(date) FROM symbol_data sd2 WHERE sd2.symbol = ${schema.symbolData.symbol}) THEN ${schema.symbolData.eod} END)`,
      previousDayEOD: sql<string>`MAX(CASE WHEN ${schema.symbolData.date} = (SELECT MAX(date) FROM symbol_data sd3 WHERE sd3.symbol = ${schema.symbolData.symbol} AND sd3.date < (SELECT MAX(date) FROM symbol_data sd4 WHERE sd4.symbol = ${schema.symbolData.symbol})) THEN ${schema.symbolData.eod} END)`,
    })
    .from(schema.symbolData)
    .where(inArray(schema.symbolData.symbol, alertSymbols))
    .groupBy(schema.symbolData.symbol);

  const priceMap: Record<string, { yearStartEOD: string | null; lastEOD: string | null; previousDayEOD: string | null }> = {};
  for (const r of priceRows) {
    priceMap[r.symbol] = {
      yearStartEOD: r.yearStartEOD,
      lastEOD: r.lastEOD,
      previousDayEOD: r.previousDayEOD,
    };
  }

  return alertRows.map((r) => ({
    ...r,
    yearStartEOD: priceMap[r.symbol]?.yearStartEOD ?? null,
    lastEOD: priceMap[r.symbol]?.lastEOD ?? null,
    previousDayEOD: priceMap[r.symbol]?.previousDayEOD ?? null,
  }));
}

async function trackSymbol(symbol: string, userId: string) {
  const db = getDb();
  await db
    .insert(schema.track)
    .values({ symbol, userId })
    .onConflictDoNothing();
  return { msg: `${symbol} now being tracked` };
}

async function untrackSymbol(symbol: string, userId: string) {
  const db = getDb();
  const result = await db
    .delete(schema.track)
    .where(and(eq(schema.track.symbol, symbol), eq(schema.track.userId, userId)));
  return { msg: `${symbol} no longer being tracked` };
}

async function symbolIsTrackedByUser(symbol: string, userId: string) {
  const db = getDb();
  const [row] = await db
    .select({ symbol: schema.track.symbol })
    .from(schema.track)
    .where(and(eq(schema.track.symbol, symbol), eq(schema.track.userId, userId)))
    .limit(1);
  return { isTracked: !!row };
}

async function getTrackedSymbolList(userId: string) {
  const db = getDb();
  return db
    .select({
      symbol: schema.track.symbol,
      name: schema.symbols.name,
      sector: schema.symbols.sector,
      industry: schema.symbols.industry,
    })
    .from(schema.track)
    .innerJoin(schema.symbols, eq(schema.track.symbol, schema.symbols.symbol))
    .where(eq(schema.track.userId, userId))
    .orderBy(schema.track.symbol);
}

// ─── route handler ────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let body: Record<string, string | string[]>;
  try {
    const formData = await request.formData();
    body = {};
    for (const key of new Set(formData.keys())) {
      const values = [...formData.getAll(key)].flatMap((v) =>
        v instanceof File ? [] : [String(v)]
      );
      if (values.length === 0) continue;
      const name = key.endsWith('[]') ? key.slice(0, -2) : key;
      if (key.endsWith('[]') || values.length > 1) {
        const prev = body[name];
        const existing = Array.isArray(prev) ? prev : prev != null ? [prev] : [];
        body[name] = [...existing, ...values];
      } else {
        body[name] = values[0];
      }
    }
  } catch {
    return NextResponse.json({ err: 'Invalid request body' }, { status: 400 });
  }

  const task = String(body.task ?? '');
  const symbol = String(body.symbol ?? '').toUpperCase();
  const userId = String(body.userId ?? '');
  const startDate = String(body.startDate ?? '');
  const endDate = String(body.endDate ?? '');
  const rawLimit = body.limit ? parseInt(String(body.limit), 10) : 50;
  const limit = isNaN(rawLimit) ? 50 : rawLimit;
  const alertTypes = body.alertTypes
    ? (Array.isArray(body.alertTypes) ? body.alertTypes : [body.alertTypes]).filter(Boolean)
    : [];

  const accessToken = String(body.access_token ?? body.tokenId ?? '');

  if (!accessToken) {
    return NextResponse.json({ err: 'Token not specified on API request.' });
  }

  const tokenValid = await isValidGoogleAccessToken(accessToken);
  if (!tokenValid) {
    return NextResponse.json({ err: 'Invalid/expired token. Please sign (or re-sign) in.' });
  }

  try {
    let data: unknown;

    if (task === 'history' && isValidSymbol(symbol) && isValidDate(startDate) && isValidDate(endDate)) {
      data = await getHistory(symbol, startDate, endDate);
    } else if (task === 'alerts' && isValidSymbol(symbol)) {
      data = await getAlerts(symbol, limit);
    } else if (task === 'symbols') {
      data = await getSymbols();
    } else if (task === 'getAlertHistory') {
      data = await getAlertHistory(limit, alertTypes as string[]);
    } else if (task === 'getAlertHistoryList') {
      data = await getAlertHistoryList(limit, alertTypes as string[]);
    } else if (task === 'track' && isValidSymbol(symbol) && isValidEmail(userId)) {
      data = await trackSymbol(symbol, userId);
    } else if (task === 'untrack' && isValidSymbol(symbol) && isValidEmail(userId)) {
      data = await untrackSymbol(symbol, userId);
    } else if (task === 'symbolIsTrackedByUser' && isValidSymbol(symbol) && isValidEmail(userId)) {
      data = await symbolIsTrackedByUser(symbol, userId);
    } else if (task === 'getTrackedSymbolList' && userId) {
      data = await getTrackedSymbolList(userId);
    } else {
      data = { err: `No/Invalid task defined [${task}]` };
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json(
      { err: 'Internal server error' },
      { status: 500 }
    );
  }
}
