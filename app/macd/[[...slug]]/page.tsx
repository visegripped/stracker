'use client';

/**
 * MACD page — ported from src/pages/Macd.jsx
 * Params: optional symbol via /macd/AAPL, falls back to localStorage
 */

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DateRangePicker, Fieldset, SymbolPicker, MacdLinePicker } from '@components/index';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { Chart } from 'react-chartjs-2';
import type { ChartDataset } from 'chart.js';
import type { ColDef } from 'ag-grid-community';
import 'chart.js/auto';
import '@views/Macd.css';
import apiPost from '@utilities/apiPost';
import { formatMACDData } from '@utilities/macdCalculations';
import { resolveSymbolFromSlug } from '@utilities/symbolParam';
import { useTheme } from '@context/ThemeContext';
import { agGridThemeClass, getChartChrome } from '@utilities/chartTheme';
import AppShell from '../../AppShell';

type HistoryRow = { date: string; EOD: string | number; [key: string]: unknown };
type MacdRow = { date: string; EOD: string | number; MACD: number | null; Signal: number | null; Histogram: number | null };

type EnabledLines = Record<string, boolean>;

function MacdGraph({ symbol, macdData, enabledLines }: { symbol: string; macdData: MacdRow[]; enabledLines: EnabledLines }) {
  const { resolvedTheme } = useTheme();
  const labels = macdData.map((r) => r.date);
  const datasets: ChartDataset<'line' | 'bar', (number | null)[]>[] = [];

  if (enabledLines.MACD) datasets.push({ type: 'line', label: 'MACD', data: macdData.map((r) => r.MACD), fill: false, borderColor: 'rgb(75,192,192)', backgroundColor: 'rgb(75,192,192)', tension: 0.1 } as ChartDataset<'line', (number | null)[]>);
  if (enabledLines.Signal) datasets.push({ type: 'line', label: 'Signal', data: macdData.map((r) => r.Signal), fill: false, borderColor: 'rgb(255,159,64)', backgroundColor: 'rgb(255,159,64)', tension: 0.1 } as ChartDataset<'line', (number | null)[]>);
  if (enabledLines.Histogram) datasets.push({ type: 'bar', label: 'Histogram', data: macdData.map((r) => r.Histogram), backgroundColor: macdData.map((r) => (r.Histogram ?? 0) >= 0 ? 'rgba(75,192,75,.6)' : 'rgba(255,99,132,.6)'), borderColor: macdData.map((r) => (r.Histogram ?? 0) >= 0 ? 'rgb(75,192,75)' : 'rgb(255,99,132)'), borderWidth: 1 } as ChartDataset<'bar', (number | null)[]>);

  const chrome = getChartChrome(resolvedTheme, `MACD for ${symbol}`);
  const options = { ...chrome, maintainAspectRatio: false };

  return <div className="macd-graph-container chart-card"><Chart type="bar" options={options} data={{ labels, datasets }} /></div>;
}

function MacdTable({ macdData }: { macdData: MacdRow[] }) {
  const { resolvedTheme } = useTheme();
  const fmt = (p: { value: number | null }) => (p.value != null ? p.value.toFixed(4) : 'N/A');
  const colDefs: ColDef<MacdRow>[] = [
    { field: 'date', sortable: true, sort: 'desc' as const, width: 120 },
    { field: 'EOD', sortable: true, width: 100 },
    { field: 'MACD', sortable: true, width: 120, valueFormatter: fmt },
    { field: 'Signal', sortable: true, width: 120, valueFormatter: fmt },
    { field: 'Histogram', sortable: true, width: 120, valueFormatter: fmt, cellStyle: (p: { value: number | null }) => ({ color: (p.value ?? 0) >= 0 ? '#43a047' : '#e53935' }) },
  ];
  return <div className={`macd-table-container ${agGridThemeClass(resolvedTheme)}`}><AgGridReact rowData={macdData} columnDefs={colDefs} domLayout="autoHeight" /></div>;
}

function MacdContent({ symbol }: { symbol: string }) {
  const parseLS = (key: string, fallback: Date) => {
    const v = localStorage.getItem(key) ?? '';
    if (!v || v === 'null') return fallback;
    const d = new Date(v); return isNaN(d.getTime()) ? fallback : d;
  };

  const defaultStart = (() => { const d = new Date(); d.setDate(d.getDate() - 90); return d; })();
  const parseIntLS = (key: string, fallback: number) => parseInt(localStorage.getItem(key) ?? '') || fallback;
  const parseObjLS = (key: string, fallback: Record<string, boolean>) => {
    try { const v = JSON.parse(localStorage.getItem(key) ?? '{}'); return (v && typeof v === 'object') ? v : fallback; } catch { return fallback; }
  };

  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [macdData, setMacdData] = useState<MacdRow[]>([]);
  const [fastPeriod, setFastPeriod] = useState(() => parseIntLS('macdFastPeriod', 12));
  const [slowPeriod, setSlowPeriod] = useState(() => parseIntLS('macdSlowPeriod', 26));
  const [signalPeriod, setSignalPeriod] = useState(() => parseIntLS('macdSignalPeriod', 9));
  const [enabledLines, setEnabledLines] = useState<EnabledLines>(() => parseObjLS('macdEnabledLines', { MACD: true, Signal: true, Histogram: true }));
  const [startDate, setStartDate] = useState<Date>(() => parseLS('macdStartDate', defaultStart));
  const [endDate, setEndDate] = useState<Date>(() => parseLS('macdEndDate', new Date()));

  const setLS = (key: string, val: string | number) => localStorage.setItem(key, String(val));

  useEffect(() => {
    if (symbol) localStorage.setItem('mostRecentlyViewedSymbol', symbol);
  }, [symbol]);

  useEffect(() => {
    if (!startDate || !endDate || !symbol) return;
    const adjusted = new Date(startDate);
    adjusted.setDate(adjusted.getDate() - (slowPeriod + signalPeriod + 5));
    apiPost({ task: 'history', symbol, startDate: adjusted, endDate })
      .then((d) => setHistory(Array.isArray(d) ? (d as HistoryRow[]) : []))
      .catch((e) => { console.error(e); setHistory([]); });
  }, [symbol, startDate, endDate, slowPeriod, signalPeriod]);

  useEffect(() => {
    if (history.length === 0) { setMacdData([]); return; }
    const formatted = formatMACDData(history, fastPeriod, slowPeriod, signalPeriod) as MacdRow[];
    setMacdData(formatted.filter((r) => {
      const d = new Date(r.date);
      return d >= startDate && d <= endDate && r.MACD != null && r.Signal != null && r.Histogram != null;
    }));
  }, [history, fastPeriod, slowPeriod, signalPeriod, startDate, endDate]);

  return (
    <>
      <section className="search-bar">
        <SymbolPicker symbol={symbol} symbolName={symbol} navigationBasePath="/macd" />
      </section>
      <section className="macd-container">
        <div className="macd-controls">
          <Fieldset legend="MACD Parameters">
            <div className="parameter-inputs">
              {([['Fast', fastPeriod, (v: number) => { setFastPeriod(v); setLS('macdFastPeriod', v); }], ['Slow', slowPeriod, (v: number) => { setSlowPeriod(v); setLS('macdSlowPeriod', v); }], ['Signal', signalPeriod, (v: number) => { setSignalPeriod(v); setLS('macdSignalPeriod', v); }]] as [string, number, (v: number) => void][]).map(([label, val, setter]) => (
                <label key={label}>{label} Period:<input type="number" value={val} onChange={(e) => setter(parseInt(e.target.value) || val)} min="1" max="100" /></label>
              ))}
            </div>
          </Fieldset>
          <Fieldset legend="Display Options">
            <MacdLinePicker clickHandler={(id: string, v: boolean) => { const u = { ...enabledLines, [id]: v }; setEnabledLines(u); setLS('macdEnabledLines', JSON.stringify(u)); }} enabledLines={enabledLines} />
          </Fieldset>
          <Fieldset legend="Date Range">
            <DateRangePicker startDate={startDate} endDate={endDate} updateStartDate={(d: Date) => { setStartDate(d); setLS('macdStartDate', d.toISOString()); }} updateEndDate={(d: Date) => { setEndDate(d); setLS('macdEndDate', d.toISOString()); }} />
          </Fieldset>
        </div>
        <div className="macd-content">
          {macdData.length > 0 ? (<><MacdGraph symbol={symbol} macdData={macdData} enabledLines={enabledLines} /><MacdTable macdData={macdData} /></>) : (<h2>Loading MACD data for {symbol}. Ensure the date range has sufficient data (~34 days).</h2>)}
        </div>
      </section>
    </>
  );
}

export default function MacdPage() {
  const params = useParams<{ slug?: string | string[] }>();
  const storedFallback =
    typeof window !== 'undefined'
      ? (localStorage.getItem('mostRecentlyViewedSymbol') ?? 'INTU')
      : 'INTU';
  const symbol = resolveSymbolFromSlug(params.slug, storedFallback);
  return (
    <AppShell>
      <MacdContent symbol={symbol} />
    </AppShell>
  );
}
