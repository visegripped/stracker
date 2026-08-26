'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  DateRangePicker,
  Fieldset,
  Graph,
  SymbolPicker,
  PlotPicker,
  TrackButton,
} from '@components/index';
import '@views/Symbol.css';
import apiPost from '@utilities/apiPost';
import { resolveSymbolFromSlug } from '@utilities/symbolParam';
import AppShell from '../../AppShell';

type HistoryRow = { date: string; EOD: string | number; [key: string]: unknown };
type AlertRow = { id?: string | number; date: string; type: string };

function SymbolContent({ symbol }: { symbol: string }) {
  const defaultDataPoints = (() => {
    try {
      const dp = localStorage.getItem('dataPoints') ?? '{}';
      const parsed = JSON.parse(dp);
      return parsed && typeof parsed === 'object' ? parsed : { EOD: true };
    } catch { return { EOD: true }; }
  })();

  const parseLS = (key: string, fallback: Date): Date => {
    const v = localStorage.getItem(key) ?? '';
    if (!v || v === 'null') return fallback;
    const d = new Date(v);
    return isNaN(d.getTime()) ? fallback : d;
  };

  const defaultStart = (() => {
    const d = new Date(); d.setDate(d.getDate() - 35); return d;
  })();

  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertRow[]>([]);
  const [startDate, setStartDate] = useState<Date>(() => parseLS('startDate', defaultStart));
  const [endDate, setEndDate] = useState<Date>(() => parseLS('endDate', new Date()));
  const [dataPoints, setDataPoints] = useState<Record<string, boolean>>(defaultDataPoints);

  const updateDataPoint = (id: string, val: boolean) => {
    const updated = { ...dataPoints, [id]: val };
    setDataPoints(updated);
    localStorage.setItem('dataPoints', JSON.stringify(updated));
  };

  const updateStartDate = (date: Date) => {
    setStartDate(date);
    localStorage.setItem('startDate', date instanceof Date ? date.toISOString() : String(date));
  };

  const updateEndDate = (date: Date) => {
    setEndDate(date);
    localStorage.setItem('endDate', date instanceof Date ? date.toISOString() : String(date));
  };

  useEffect(() => {
    if (startDate && endDate && symbol) {
      apiPost({ task: 'history', symbol, startDate, endDate })
        .then((data) => setHistory(Array.isArray(data) ? (data as HistoryRow[]) : []))
        .catch((err) => { console.error('Error fetching history:', err); setHistory([]); });
    }
  }, [symbol, startDate, endDate]);

  useEffect(() => {
    if (symbol) {
      localStorage.setItem('mostRecentlyViewedSymbol', symbol);
      apiPost({ task: 'alerts', symbol, limit: 20 })
        .then((data) => setAlertHistory(Array.isArray(data) ? (data as AlertRow[]) : []))
        .catch((err) => { console.error('Error fetching alerts:', err); setAlertHistory([]); });
    }
  }, [symbol]);

  return (
    <>
      <section className="search-bar">
        <SymbolPicker symbol={symbol} symbolName={symbol} />
      </section>
      <section className="grid-container grid-sidebar">
        <TrackButton symbol={symbol} />
        <br />
        <div>
          <Fieldset legend="Data Points">
            <PlotPicker clickHandler={updateDataPoint} enabledDataPoints={dataPoints} />
          </Fieldset>
          <Fieldset legend="Date Range">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              updateStartDate={updateStartDate}
              updateEndDate={updateEndDate}
            />
          </Fieldset>
          <Fieldset legend="Alert History">
            {alertHistory.map((alert) => (
              <div className="alertItem" key={alert.id ?? `${alert.date}-${alert.type}`}>
                {alert.date}: {alert.type}
              </div>
            ))}
          </Fieldset>
        </div>
        <div>
          {history.length ? (
            <Graph symbol={symbol} symbolName={symbol} history={history} enabledDataPoints={dataPoints} />
          ) : (
            <h2>
              There does not appear to be any data for {symbol} and the date range you have
              selected. Please adjust the dates.
            </h2>
          )}
        </div>
      </section>
    </>
  );
}

export default function SymbolPage() {
  const params = useParams<{ slug?: string | string[] }>();
  const storedFallback =
    typeof window !== 'undefined'
      ? (localStorage.getItem('mostRecentlyViewedSymbol') ?? 'INTU')
      : 'INTU';
  const symbol = resolveSymbolFromSlug(params.slug, storedFallback);

  return (
    <AppShell>
      <SymbolContent symbol={symbol} />
    </AppShell>
  );
}
