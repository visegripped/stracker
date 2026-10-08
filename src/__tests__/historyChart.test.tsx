import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HistoryChartProvider } from '../components/HistoryChart/HistoryChartProvider';
import { SymbolChartButton } from '../components/HistoryChart/SymbolChartButton';
import apiPost from '@utilities/apiPost';

vi.mock('@utilities/apiPost', () => ({
  default: vi.fn(),
}));

vi.mock('@components/Graph/Graph', () => ({
  default: ({
    symbol,
    enabledDataPoints,
  }: {
    symbol: string;
    enabledDataPoints: Record<string, boolean>;
  }) => (
    <div data-testid="history-graph">
      {symbol}:
      {Object.entries(enabledDataPoints)
        .filter(([, on]) => on)
        .map(([key]) => key)
        .join(',')}
    </div>
  ),
}));

const mockedApiPost = vi.mocked(apiPost);

function renderPeek(symbol = 'INTU') {
  return render(
    <HistoryChartProvider>
      <SymbolChartButton symbol={symbol} />
    </HistoryChartProvider>,
  );
}

describe('history chart modal', () => {
  beforeEach(() => {
    localStorage.clear();
    mockedApiPost.mockReset();
    mockedApiPost.mockResolvedValue([{ date: '2026-01-02', EOD: 10 }]);
  });

  it('opens a dialog and charts with the saved symbol-page settings', async () => {
    localStorage.setItem('startDate', '2026-01-01T00:00:00.000Z');
    localStorage.setItem('endDate', '2026-02-01T00:00:00.000Z');
    localStorage.setItem('dataPoints', JSON.stringify({ EOD: true, MA50: true }));

    renderPeek();
    expect(document.querySelector('dialog')?.open).toBe(false);
    expect(mockedApiPost).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Show history chart for INTU' }));

    const dialog = document.querySelector('dialog');
    expect(dialog?.open).toBe(true);
    expect(screen.getByRole('heading', { name: 'INTU' })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('history-graph')).toHaveTextContent('INTU:EOD,MA50');
    });
    expect(mockedApiPost).toHaveBeenCalledWith({
      task: 'history',
      symbol: 'INTU',
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: new Date('2026-02-01T00:00:00.000Z'),
    });
  });

  it('closes from the dialog backdrop', async () => {
    renderPeek('AAPL');
    fireEvent.click(screen.getByRole('button', { name: 'Show history chart for AAPL' }));
    const dialog = document.querySelector('dialog');
    expect(dialog?.open).toBe(true);

    fireEvent.click(dialog!);
    await waitFor(() => {
      expect(dialog?.open).toBe(false);
    });
  });
});
