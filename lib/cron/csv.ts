import 'server-only';

export interface CsvSymbolRow {
  symbol: string;
  eod: number;
  tradeDate: string;
  companyName: string;
  sector: string | null;
  industry: string | null;
}

/**
 * Fetch and parse the published Google Sheet CSV.
 * Columns: [0]=symbol [1]=eod [2]=tradeDate [3]=companyName [4]=sector [5]=industry
 * Returns only the last `limit` rows (default 10).
 */
export async function fetchSheetCsv(limit = 10): Promise<CsvSymbolRow[]> {
  const url = process.env.GOOGLE_SHEET_CSV_URL;
  if (!url) {
    throw new Error('GOOGLE_SHEET_CSV_URL environment variable is not set');
  }

  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) {
    throw new Error(`Failed to fetch Google Sheet CSV: HTTP ${res.status}`);
  }

  const text = await res.text();
  const lines = text.trim().split('\n');

  const rows: CsvSymbolRow[] = [];

  for (const line of lines) {
    const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    const symbol = cols[0];
    const rawPrice = cols[1];
    const rawDate = cols[2];
    const companyName = cols[3] ?? '';
    const sector = cols[4] || null;
    const industry = cols[5] || null;

    // Skip header rows or rows with non-numeric prices
    if (!symbol || !isFinite(parseFloat(rawPrice))) continue;

    // Parse date: "7/10/2026 16:00:01" -> "2026-07-10"
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

  // Take the last `limit` rows
  return rows.slice(-limit);
}

function parseCsvDate(rawDate: string): string | null {
  if (!rawDate) return null;
  // Format: "7/10/2026 16:00:01" or "7/10/2026"
  const datePart = rawDate.split(' ')[0];
  const parts = datePart.split('/');
  if (parts.length !== 3) return null;
  const [month, day, year] = parts;
  if (!month || !day || !year) return null;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
