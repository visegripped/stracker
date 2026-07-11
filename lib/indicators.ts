import { alertsForDay, signalAlignment } from './secretSauce';

export interface EodRow {
  date: string;
  eod: string | number;
}

export interface IndicatorRow extends EodRow {
  delta: number;
  deltaMa5: number;
  deltaMa10: number;
  deltaMa20: number;
  ma20: number;
  ma50: number;
  m1: number;
  m2: number;
  m3: number;
  p0: number;
  p1: number;
  p2: number;
}

/** Round to 2 decimal places — matches PHP round(..., 2) */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Compute SMA of the last n items of an array.
 * Mirrors PHP: round(array_sum(array_slice($data, -$n, $n)) / $n, 2)
 */
export function calcMA(data: number[], n: number): number {
  const slice = data.slice(-n);
  const sum = slice.reduce((a, b) => a + b, 0);
  return round2(sum / n);
}

/**
 * Compute all indicators for a history array.
 * Faithful port of getDataFromHistory.php + alertsForDay (from secretSauce).
 *
 * PHP loop: i starts at 0
 *   - MA20 computed when i > 20  (first value at i=21, uses last 20 prices)
 *   - delta, deltaMA5/10/20, M1/2/3 when i > 25 (first at i=26)
 *   - MA50 when i > 50 (first at i=51)
 */
export function getDataFromHistory(history: EodRow[]): IndicatorRow[] {
  const eodPrices: number[] = [];
  const deltas: number[] = [];
  const result: IndicatorRow[] = [];

  for (let i = 0; i < history.length; i++) {
    const { date, eod: rawEod } = history[i];
    const eod = typeof rawEod === 'string' ? parseFloat(rawEod) : rawEod;

    if (!isFinite(eod)) continue;

    eodPrices.push(eod);

    let ma20 = 0;
    let delta = 0;
    let deltaMa5 = 0;
    let deltaMa10 = 0;
    let deltaMa20 = 0;
    let m1 = 0;
    let m2 = 0;
    let m3 = 0;
    let ma50 = 0;

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

    if (i > 50) {
      ma50 = calcMA(eodPrices, 50);
    }

    const dayData = {
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
      p0: 0,
      p1: 0,
      p2: 0,
    };

    const alerts = alertsForDay(dayData);
    result.push({ ...dayData, ...alerts });
  }

  return result;
}

export { signalAlignment };
