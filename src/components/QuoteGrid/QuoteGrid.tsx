'use client';

import Link from 'next/link';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, GridReadyEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { useTheme } from '@context/ThemeContext';
import { agGridThemeClass } from '@utilities/chartTheme';
import {
  TEXT_COLUMN_FILTER,
  formatRecentSignal,
  type QuoteGridRow,
} from '@utilities/quoteGrid';

export function getSpanFromDiff(
  eod: string | number | null | undefined,
  earlier: string | number | null | undefined,
) {
  const a = parseFloat(String(eod));
  const b = parseFloat(String(earlier));
  if (isNaN(a) || isNaN(b) || !earlier || !eod) return '';
  const diff = a - b;
  const cls = diff >= 0 ? 'positive' : 'negative';
  return <span className={`price-${cls}`}>{diff.toFixed(2)}</span>;
}

export const LinkedSymbol = (props: { value: string }) => (
  <Link href={`/symbol/${props.value}`}>{props.value}</Link>
);

export const YTDCell = (props: { data?: QuoteGridRow }) =>
  getSpanFromDiff(props.data?.lastEOD, props.data?.yearStartEOD);

export const DODCell = (props: { data?: QuoteGridRow }) =>
  getSpanFromDiff(props.data?.lastEOD, props.data?.previousDayEOD);

export const RecentSignalCell = (props: { data?: QuoteGridRow }) =>
  formatRecentSignal(props.data?.type, props.data?.date);

function textCol(
  field: keyof QuoteGridRow & string,
  extra: ColDef<QuoteGridRow> = {},
): ColDef<QuoteGridRow> {
  return { field, filter: TEXT_COLUMN_FILTER, ...extra };
}

export function alertHistoryColumnDefs(): ColDef<QuoteGridRow>[] {
  return [
    { field: 'symbol', sortable: true, cellRenderer: LinkedSymbol },
    textCol('name', { flex: 2 }),
    textCol('sector'),
    textCol('industry', { flex: 2 }),
    textCol('type'),
    { field: 'lastEOD', headerName: 'EOD' },
    { field: 'yearStartEOD', cellRenderer: YTDCell, headerName: 'Year to EOD' },
    { field: 'dayOverDay', headerName: 'Day over Day', cellRenderer: DODCell },
    { field: 'date', sort: 'asc' },
  ];
}

export function symbolsColumnDefs(): ColDef<QuoteGridRow>[] {
  return [
    { field: 'symbol', sortable: true, sort: 'asc', cellRenderer: LinkedSymbol },
    textCol('name', { flex: 2 }),
    textCol('sector'),
    textCol('industry', { flex: 2 }),
    { field: 'lastEOD', headerName: 'EOD' },
    { field: 'yearStartEOD', cellRenderer: YTDCell, headerName: 'Year to EOD' },
    { field: 'dayOverDay', headerName: 'Day over Day', cellRenderer: DODCell },
    {
      colId: 'recentSignal',
      headerName: 'Most recent signal',
      flex: 2,
      filter: TEXT_COLUMN_FILTER,
      valueGetter: (params) =>
        formatRecentSignal(params.data?.type, params.data?.date),
      cellRenderer: RecentSignalCell,
    },
  ];
}

export function QuoteGrid({
  rowData,
  columnDefs,
  onGridReady,
  onGridPreDestroyed,
  emptyMessage = 'Fetching data...',
}: {
  rowData: QuoteGridRow[];
  columnDefs: ColDef<QuoteGridRow>[];
  onGridReady?: (event: GridReadyEvent<QuoteGridRow>) => void;
  onGridPreDestroyed?: () => void;
  emptyMessage?: string;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <section className={`table-container ${agGridThemeClass(resolvedTheme)}`}>
      {rowData.length ? (
        <AgGridReact<QuoteGridRow>
          rowData={rowData}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          onGridPreDestroyed={onGridPreDestroyed}
        />
      ) : (
        <h3>{emptyMessage}</h3>
      )}
    </section>
  );
}
