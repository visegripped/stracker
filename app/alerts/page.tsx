'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import apiPost from '@utilities/apiPost';
import type { GridApi, GridReadyEvent } from 'ag-grid-community';
import '@views/Alerts.css';
import {
  ALERT_TYPE_FILTERS,
  alertTypeColumnFilterModel,
  matchesAlertTypeFilter,
  type AlertTypeFilter,
} from '@utilities/alertTypeFilter';
import type { QuoteGridRow } from '@utilities/quoteGrid';
import { QuoteGrid, alertHistoryColumnDefs } from '@components/QuoteGrid';
import AppShell from '../AppShell';

type AlertRow = QuoteGridRow & {
  id?: number;
};

function applyTypeColumnFilter(api: GridApi<QuoteGridRow> | null, filter: AlertTypeFilter) {
  if (!api) return;
  void api.setColumnFilterModel('type', alertTypeColumnFilterModel(filter)).then(() => {
    api.onFilterChanged();
  });
}

function AlertsContent() {
  const [alertHistory, setAlertHistory] = useState<AlertRow[]>([]);
  const [typeFilter, setTypeFilter] = useState<AlertTypeFilter>('all');
  const [groupBySector, setGroupBySector] = useState(false);
  const gridApiRef = useRef<GridApi<QuoteGridRow> | null>(null);

  useEffect(() => {
    apiPost({ task: 'getAlertHistoryList', limit: 200 })
      .then((data) => setAlertHistory(Array.isArray(data) ? (data as AlertRow[]) : []))
      .catch((err) => { console.error('Error fetching alert history:', err); setAlertHistory([]); });
  }, []);

  const onGridReady = useCallback((event: GridReadyEvent<QuoteGridRow>) => {
    gridApiRef.current = event.api;
    applyTypeColumnFilter(event.api, typeFilter);
  }, [typeFilter]);

  const selectTypeFilter = (next: AlertTypeFilter) => {
    setTypeFilter(next);
    applyTypeColumnFilter(gridApiRef.current, next);
  };

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

      {groupBySector ? (
        alertHistory.length ? (
          <section className="table-container">
            <SectorGroupedView alerts={visibleAlerts} />
          </section>
        ) : (
          <section className="table-container">
            <h3>Fetching data...</h3>
          </section>
        )
      ) : (
        <QuoteGrid
          rowData={alertHistory}
          columnDefs={alertHistoryColumnDefs()}
          onGridReady={onGridReady}
          onGridPreDestroyed={() => { gridApiRef.current = null; }}
        />
      )}
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
