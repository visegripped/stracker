'use client';

import { createContext, useContext } from 'react';

type HistoryChartContextValue = {
  openChart: (symbol: string) => void;
};

export const HistoryChartContext = createContext<HistoryChartContextValue | null>(null);

export function useHistoryChart() {
  const value = useContext(HistoryChartContext);
  if (!value) {
    throw new Error('useHistoryChart must be used within HistoryChartProvider');
  }
  return value;
}
