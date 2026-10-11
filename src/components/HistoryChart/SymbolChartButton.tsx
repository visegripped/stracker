'use client';

import Link from 'next/link';
import { useHistoryChart } from './HistoryChartContext';
import './HistoryChart.css';

function ChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <polyline
        points="1,12 5,6 8,9 15,3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <line x1="1" y1="14.5" x2="15" y2="14.5" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function SymbolChartButton({ symbol }: { symbol: string }) {
  const { openChart } = useHistoryChart();

  return (
    <button
      type="button"
      className="chart-peek"
      aria-label={`Show history chart for ${symbol}`}
      title={`History chart for ${symbol}`}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        openChart(symbol);
      }}
    >
      <ChartIcon />
    </button>
  );
}

export function StockNameLink({ symbol, label }: { symbol: string; label: string }) {
  return (
    <span className="name-with-chart">
      <Link href={`/symbol/${symbol}`}>{label}</Link>
      <SymbolChartButton symbol={symbol} />
    </span>
  );
}
