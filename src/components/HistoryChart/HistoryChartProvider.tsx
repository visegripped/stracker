'use client';

import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import HistoryChartBody from './HistoryChartBody';
import { HistoryChartContext } from './HistoryChartContext';
import './HistoryChart.css';

function openDialog(dialog: HTMLDialogElement) {
  if (typeof dialog.showModal === 'function') {
    if (!dialog.open) dialog.showModal();
    return;
  }
  dialog.setAttribute('open', '');
}

function closeDialog(dialog: HTMLDialogElement) {
  if (typeof dialog.close === 'function') {
    dialog.close();
    return;
  }
  dialog.removeAttribute('open');
  dialog.dispatchEvent(new Event('close', { bubbles: false }));
}

export function HistoryChartProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [symbol, setSymbol] = useState<string | null>(null);

  const openChart = useCallback((next: string) => {
    setSymbol(next);
    const dialog = dialogRef.current;
    if (dialog) openDialog(dialog);
  }, []);

  const value = useMemo(() => ({ openChart }), [openChart]);

  return (
    <HistoryChartContext.Provider value={value}>
      {children}
      <dialog
        ref={dialogRef}
        className="history-chart-modal"
        aria-label={symbol ? `History for ${symbol}` : 'History chart'}
        onClose={() => setSymbol(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) closeDialog(dialogRef.current);
        }}
      >
        {symbol ? (
          <>
            <header className="history-chart-modal__header">
              <h2>{symbol}</h2>
              <form method="dialog">
                <button type="submit" className="history-chart-modal__close">
                  Close
                </button>
              </form>
            </header>
            <div className="history-chart-modal__body">
              <HistoryChartBody symbol={symbol} />
            </div>
          </>
        ) : null}
      </dialog>
    </HistoryChartContext.Provider>
  );
}
