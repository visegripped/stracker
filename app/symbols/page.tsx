'use client';

import { useState, useEffect } from 'react';
import apiPost from '@utilities/apiPost';
import '@views/Alerts.css';
import type { QuoteGridRow } from '@utilities/quoteGrid';
import { QuoteGrid, symbolsColumnDefs } from '@components/QuoteGrid';
import AppShell from '../AppShell';

function SymbolsContent() {
  const [rows, setRows] = useState<QuoteGridRow[]>([]);

  useEffect(() => {
    apiPost({ task: 'getSymbolList' })
      .then((data) => setRows(Array.isArray(data) ? (data as QuoteGridRow[]) : []))
      .catch((err) => {
        console.error('Error fetching symbols:', err);
        setRows([]);
      });
  }, []);

  return (
    <QuoteGrid
      rowData={rows}
      columnDefs={symbolsColumnDefs()}
      emptyMessage="Fetching data..."
    />
  );
}

export default function SymbolsPage() {
  return (
    <AppShell>
      <SymbolsContent />
    </AppShell>
  );
}
