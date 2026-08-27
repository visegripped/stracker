'use client';

import './ChartLoading.css';

export default function ChartLoading({ label = 'Loading chart' }: { label?: string }) {
  return (
    <div className="chart-loading chart-card" role="status" aria-live="polite" aria-busy="true">
      <span className="chart-loading__spinner" aria-hidden="true" />
      <span className="chart-loading__label">{label}…</span>
    </div>
  );
}
