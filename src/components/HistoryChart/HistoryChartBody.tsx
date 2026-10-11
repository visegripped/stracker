'use client';

import { useEffect, useState } from 'react';
import Graph from '@components/Graph/Graph';
import ChartLoading from '@components/ChartLoading/ChartLoading';
import apiPost from '@utilities/apiPost';
import { readSymbolChartSettings } from '@utilities/chartSettings';

type HistoryRow = { date: string; EOD: string | number; [key: string]: unknown };

export default function HistoryChartBody({ symbol }: { symbol: string }) {
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataPoints, setDataPoints] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const settings = readSymbolChartSettings(localStorage);
    setDataPoints(settings.dataPoints);
    let cancelled = false;
    setLoading(true);
    apiPost({
      task: 'history',
      symbol,
      startDate: settings.startDate,
      endDate: settings.endDate,
    })
      .then((data) => {
        if (cancelled) return;
        setHistory(Array.isArray(data) ? (data as HistoryRow[]) : []);
      })
      .catch((err) => {
        console.error('Error fetching history:', err);
        if (!cancelled) setHistory([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  if (loading) return <ChartLoading label={`Loading ${symbol}`} />;
  if (!history.length) {
    return (
      <h2 className="chart-empty">
        No history for {symbol} in the date range saved on the symbol page.
      </h2>
    );
  }
  return <Graph symbol={symbol} history={history} enabledDataPoints={dataPoints} />;
}
