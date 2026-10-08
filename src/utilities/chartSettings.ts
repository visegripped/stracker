import { DEFAULT_SYMBOL_DATA_POINTS, readPersistedFlags } from './chartFlags';

/** Keys the symbol page writes. The history glimpse reads these and does not change them. */
export const SYMBOL_CHART_STORAGE = {
  startDate: 'startDate',
  endDate: 'endDate',
  dataPoints: 'dataPoints',
} as const;

export function readPersistedDate(stored: string | null, fallback: Date): Date {
  if (!stored || stored === 'null') return fallback;
  const parsed = new Date(stored);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

export function defaultChartStart(daysBack = 35): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  return date;
}

type SettingsStorage = { getItem(key: string): string | null };

/** Date range and series flags last saved on the symbol page. */
export function readSymbolChartSettings(storage: SettingsStorage): {
  startDate: Date;
  endDate: Date;
  dataPoints: Record<string, boolean>;
} {
  return {
    startDate: readPersistedDate(
      storage.getItem(SYMBOL_CHART_STORAGE.startDate),
      defaultChartStart(35),
    ),
    endDate: readPersistedDate(storage.getItem(SYMBOL_CHART_STORAGE.endDate), new Date()),
    dataPoints: readPersistedFlags(
      storage.getItem(SYMBOL_CHART_STORAGE.dataPoints),
      DEFAULT_SYMBOL_DATA_POINTS,
    ),
  };
}
