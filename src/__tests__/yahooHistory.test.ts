import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchYahooHistory,
  parseYahooChart,
  parseYahooCsv,
  resetYahooSession,
  resolveYahooSymbol,
} from '../../lib/yahoo';

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { 'content-type': 'application/json', ...init.headers },
  });
}

function chartBody(
  closes: Array<{ ts: number; adj?: number; close?: number }>,
) {
  return {
    chart: {
      result: [
        {
          timestamp: closes.map((c) => c.ts),
          indicators: {
            quote: [{ close: closes.map((c) => c.close ?? null) }],
            adjclose: [{ adjclose: closes.map((c) => c.adj ?? null) }],
          },
        },
      ],
      error: null,
    },
  };
}

describe('parseYahooCsv', () => {
  it('reads Close from the fifth column', () => {
    const csv = [
      'Date,Open,High,Low,Close,Adj Close,Volume',
      '2024-01-02,1,2,3,10.5,10.5,100',
      '2024-01-03,1,2,3,11,11,100',
    ].join('\n');
    expect(parseYahooCsv(csv)).toEqual([
      { date: '2024-01-02', eod: 10.5 },
      { date: '2024-01-03', eod: 11 },
    ]);
  });
});

describe('parseYahooChart', () => {
  it('prefers adjclose and falls back to close', () => {
    const rows = parseYahooChart(
      chartBody([
        { ts: 1704153600, adj: 12.5, close: 10 },
        { ts: 1704240000, close: 11 },
      ]),
    );
    expect(rows).toEqual([
      { date: '2024-01-02', eod: 12.5 },
      { date: '2024-01-03', eod: 11 },
    ]);
  });

  it('throws Yahoo chart errors', () => {
    expect(() =>
      parseYahooChart({
        chart: {
          result: null,
          error: { code: 'Not Found', description: 'No data found' },
        },
      }),
    ).toThrow('chart error: No data found');
  });
});

describe('resolveYahooSymbol', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('maps SGH to PENG', () => {
    expect(resolveYahooSymbol('sgh')).toEqual({
      sheetSymbol: 'SGH',
      yahooSymbol: 'PENG',
    });
  });

  it('honors YAHOO_SYMBOL_ALIASES', () => {
    vi.stubEnv('YAHOO_SYMBOL_ALIASES', 'TEF:TEF.MC');
    expect(resolveYahooSymbol('TEF')).toEqual({
      sheetSymbol: 'TEF',
      yahooSymbol: 'TEF.MC',
    });
  });
});

describe('fetchYahooHistory', () => {
  beforeEach(() => {
    resetYahooSession();
    vi.stubEnv('YAHOO_COOKIE', '');
    vi.stubEnv('YAHOO_SYMBOL_ALIASES', '');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    resetYahooSession();
  });

  it('loads history from the chart API without hitting CSV download', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('fc.yahoo.com')) {
        return new Response('', { status: 404 });
      }
      if (url.includes('getcrumb')) {
        return new Response('crumb123', { status: 200 });
      }
      if (url.includes('/v8/finance/chart/CORT')) {
        return jsonResponse(
          chartBody([
            { ts: 1704153600, adj: 32.1 },
            { ts: 1704240000, adj: 33.4 },
          ]),
        );
      }
      return new Response('unexpected ' + url, { status: 500 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const rows = await fetchYahooHistory('CORT', 1, 2);
    expect(rows).toEqual([
      { date: '2024-01-02', eod: 32.1 },
      { date: '2024-01-03', eod: 33.4 },
    ]);
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes('/v7/finance/download/'),
      ),
    ).toBe(false);
    const chartUrl = fetchMock.mock.calls
      .map(([url]) => String(url))
      .find((url) => url.includes('/v8/finance/chart/CORT'));
    expect(chartUrl).toContain('crumb=crumb123');
  });

  it('sends YAHOO_COOKIE on chart requests', async () => {
    vi.stubEnv('YAHOO_COOKIE', 'A1=login; A3=session');
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const headers = new Headers(init?.headers);
        if (url.includes('getcrumb') || url.includes('fc.yahoo.com')) {
          expect(headers.get('Cookie')).toContain('A1=login');
          return new Response(url.includes('getcrumb') ? 'abc' : '', {
            status: 200,
          });
        }
        expect(headers.get('Cookie')).toContain('A1=login');
        return jsonResponse(chartBody([{ ts: 1704153600, adj: 1 }]));
      },
    );
    vi.stubGlobal('fetch', fetchMock);

    await fetchYahooHistory('RUN', 1, 2);
  });

  it('requests PENG history for sheet symbol SGH', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('fc.yahoo.com'))
        return new Response('', { status: 404 });
      if (url.includes('getcrumb')) return new Response('c', { status: 200 });
      if (url.includes('/v8/finance/chart/PENG')) {
        return jsonResponse(chartBody([{ ts: 1704153600, adj: 20 }]));
      }
      if (url.includes('/v8/finance/chart/SGH')) {
        return jsonResponse({
          chart: {
            result: null,
            error: { code: 'Not Found', description: 'delisted' },
          },
        });
      }
      return new Response('nope', { status: 500 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const rows = await fetchYahooHistory('SGH', 1, 2);
    expect(rows).toEqual([{ date: '2024-01-02', eod: 20 }]);
  });

  it('tries CSV download only when YAHOO_COOKIE is set', async () => {
    vi.stubEnv('YAHOO_COOKIE', 'A1=login');
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('fc.yahoo.com'))
        return new Response('', { status: 404 });
      if (url.includes('getcrumb')) return new Response('c', { status: 200 });
      if (url.includes('/v8/finance/chart/')) {
        return jsonResponse({
          chart: {
            result: null,
            error: { code: 'Not Found', description: 'No data found' },
          },
        });
      }
      if (url.includes('/v7/finance/download/TALO')) {
        return new Response(
          'Date,Open,High,Low,Close,Adj Close,Volume\n2024-01-02,1,2,3,9.5,9.5,10\n',
          { status: 200 },
        );
      }
      return new Response('nope ' + url, { status: 500 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const rows = await fetchYahooHistory('TALO', 1, 2);
    expect(rows).toEqual([{ date: '2024-01-02', eod: 9.5 }]);
  });

  it('does not hit CSV download when chart fails without a login cookie', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('fc.yahoo.com'))
        return new Response('', { status: 404 });
      if (url.includes('getcrumb')) return new Response('c', { status: 200 });
      return jsonResponse({
        chart: {
          result: null,
          error: {
            code: 'Not Found',
            description: 'No data found, symbol may be delisted',
          },
        },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchYahooHistory('TEF', 1, 2)).rejects.toThrow(
      /No data found/,
    );
    const csvCalls = fetchMock.mock.calls.filter(([url]) =>
      String(url).includes('/v7/finance/download/'),
    );
    expect(csvCalls).toHaveLength(0);
  });
});
