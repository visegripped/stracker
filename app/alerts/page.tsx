'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import apiPost from '@utilities/apiPost';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import '@views/Alerts.css';
import AppShell from '../AppShell';

type AlertRow = {
  id?: number;
  symbol: string;
  name?: string;
  type: string;
  date: string;
  lastEOD?: string | number | null;
  yearStartEOD?: string | number | null;
  previousDayEOD?: string | number | null;
  sector?: string | null;
  industry?: string | null;
  dayOverDay?: string | number | null;
};

const getSpanFromDiff = (eod: string | number | null | undefined, earlier: string | number | null | undefined) => {
  const a = parseFloat(String(eod));
  const b = parseFloat(String(earlier));
  if (isNaN(a) || isNaN(b) || !earlier || !eod) return '';
  const diff = a - b;
  const cls = diff >= 0 ? 'positive' : 'negative';
  return <span className={`price-${cls}`}>{diff.toFixed(2)}</span>;
};

const LinkedSymbol = (props: { value: string }) => (
  <Link href={`/symbol/${props.value}`}>{props.value}</Link>
);

const YTDCell = (props: { data: AlertRow }) => getSpanFromDiff(props.data.lastEOD, props.data.yearStartEOD);
const DODCell = (props: { data: AlertRow }) => getSpanFromDiff(props.data.lastEOD, props.data.previousDayEOD);

const ALERT_TYPES = ['P0-buy', 'P1-buy', 'P2-buy', 'P0-sell', 'P1-sell', 'P2-sell'];
const BUY_TYPES = ALERT_TYPES.filter((t) => t.includes('buy'));
const SELL_TYPES = ALERT_TYPES.filter((t) => t.includes('sell'));

const FILTER_OPTIONS = [
  { label: 'All', types: [] },
  { label: 'Buy only', types: BUY_TYPES },
  { label: 'Sell only', types: SELL_TYPES },
];

function AlertsContent() {
  const [alertHistory, setAlertHistory] = useState<AlertRow[]>([]);
  const [filterIdx, setFilterIdx] = useState(0);
  const [groupBySector, setGroupBySector] = useState(false);

  const fetchAlerts = (types: string[]) => {
    apiPost({ task: 'getAlertHistoryList', limit: 200, alertTypes: types })
      .then((data) => setAlertHistory(Array.isArray(data) ? (data as AlertRow[]) : []))
      .catch((err) => { console.error('Error fetching alert history:', err); setAlertHistory([]); });
  };

  useEffect(() => {
    fetchAlerts(FILTER_OPTIONS[filterIdx].types);
  }, [filterIdx]);

  const colDefs: ColDef<AlertRow>[] = [
    { field: 'symbol', sortable: true, cellRenderer: LinkedSymbol },
    { field: 'name', flex: 2 },
    { field: 'sector' },
    { field: 'industry', flex: 2 },
    { field: 'type', filter: 'agSetColumnFilter' },
    { field: 'lastEOD', headerName: 'EOD' },
    { field: 'yearStartEOD', cellRenderer: YTDCell, headerName: 'Year to EOD' },
    { field: 'dayOverDay', cellRenderer: DODCell },
    { field: 'date', sort: 'asc' },
  ];

  return (
    <>
      <div className="alerts-toolbar">
        <div className="filter-buttons">
          {FILTER_OPTIONS.map((opt, i) => (
            <button
              key={opt.label}
              onClick={() => setFilterIdx(i)}
              className={filterIdx === i ? 'active' : ''}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <label className="group-toggle">
          <input type="checkbox" checked={groupBySector} onChange={(e) => setGroupBySector(e.target.checked)} />
          &nbsp;Group by sector
        </label>
      </div>

      <section className="table-container ag-theme-quartz-dark">
        {alertHistory.length ? (
          groupBySector ? (
            <SectorGroupedView alerts={alertHistory} />
          ) : (
            <AgGridReact rowData={alertHistory} columnDefs={colDefs} />
          )
        ) : (
          <h3>Fetching data...</h3>
        )}
      </section>
    </>
  );
}

function SectorGroupedView({ alerts }: { alerts: AlertRow[] }) {
  const bySector: Record<string, Record<string, AlertRow[]>> = {};
  for (const a of alerts) {
    const sector = a.sector ?? 'Uncategorized';
    const industry = a.industry ?? 'Unknown';
    if (!bySector[sector]) bySector[sector] = {};
    if (!bySector[sector][industry]) bySector[sector][industry] = [];
    bySector[sector][industry].push(a);
  }

  return (
    <div className="sector-grouped-alerts">
      {Object.entries(bySector).map(([sector, industries]) => (
        <div key={sector} className="sector-block">
          <h3>{sector}</h3>
          {Object.entries(industries).map(([industry, items]) => (
            <div key={industry} className="industry-block">
              <h4>{industry}</h4>
              {items.map((a, i) => (
                <div key={`${a.symbol}-${i}`} className="alert-row">
                  <Link href={`/symbol/${a.symbol}`}>{a.symbol}</Link>
                  &nbsp;— {a.type} on {a.date}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function AlertsPage() {
  return (
    <AppShell>
      <AlertsContent />
    </AppShell>
  );
}
