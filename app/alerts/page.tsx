'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import apiPost from '@utilities/apiPost';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import '@views/Alerts.css';
import { useTheme } from '@context/ThemeContext';
import { agGridThemeClass } from '@utilities/chartTheme';
import {
  ALERT_TYPE_FILTERS,
  alertTypeColumnFilterModel,
  matchesAlertTypeFilter,
  type AlertTypeFilter,
} from '@utilities/alertTypeFilter';
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

function applyTypeColumnFilter(api: GridApi<AlertRow> | null, filter: AlertTypeFilter) {
  if (!api) return;
  void api.setColumnFilterModel('type', alertTypeColumnFilterModel(filter)).then(() => {
    api.onFilterChanged();
  });
}

function AlertsContent() {
  const { resolvedTheme } = useTheme();
  const [alertHistory, setAlertHistory] = useState<AlertRow[]>([]);
  const [typeFilter, setTypeFilter] = useState<AlertTypeFilter>('all');
  const [groupBySector, setGroupBySector] = useState(false);
  const gridApiRef = useRef<GridApi<AlertRow> | null>(null);

  useEffect(() => {
    apiPost({ task: 'getAlertHistoryList', limit: 200 })
      .then((data) => setAlertHistory(Array.isArray(data) ? (data as AlertRow[]) : []))
      .catch((err) => { console.error('Error fetching alert history:', err); setAlertHistory([]); });
  }, []);

  const onGridReady = useCallback((event: GridReadyEvent<AlertRow>) => {
    gridApiRef.current = event.api;
    applyTypeColumnFilter(event.api, typeFilter);
  }, [typeFilter]);

  const selectTypeFilter = (next: AlertTypeFilter) => {
    setTypeFilter(next);
    applyTypeColumnFilter(gridApiRef.current, next);
  };

  const colDefs: ColDef<AlertRow>[] = [
    { field: 'symbol', sortable: true, cellRenderer: LinkedSymbol },
    { field: 'name', flex: 2 },
    { field: 'sector' },
    { field: 'industry', flex: 2 },
    { field: 'type', filter: 'agTextColumnFilter' },
    { field: 'lastEOD', headerName: 'EOD' },
    { field: 'yearStartEOD', cellRenderer: YTDCell, headerName: 'Year to EOD' },
    { field: 'dayOverDay', cellRenderer: DODCell },
    { field: 'date', sort: 'asc' },
  ];

  const visibleAlerts = alertHistory.filter((a) => matchesAlertTypeFilter(a.type, typeFilter));

  return (
    <>
      <div className="alerts-toolbar">
        <div className="filter-buttons">
          {ALERT_TYPE_FILTERS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => selectTypeFilter(opt.id)}
              className={typeFilter === opt.id ? 'active' : ''}
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

      <section className={`table-container ${agGridThemeClass(resolvedTheme)}`}>
        {alertHistory.length ? (
          groupBySector ? (
            <SectorGroupedView alerts={visibleAlerts} />
          ) : (
            <AgGridReact<AlertRow>
              rowData={alertHistory}
              columnDefs={colDefs}
              onGridReady={onGridReady}
              onGridPreDestroyed={() => { gridApiRef.current = null; }}
            />
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
