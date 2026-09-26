import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TiingoRateLimitError } from '../../lib/errors';
import {
  fetchTiingoHistory,
  parseTiingoPrices,
  resolveTiingoSymbol,
} from '../../lib/tiingo';

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { 'content-type': 'application/json', ...init.headers },
  });
}

describe('parseTiingoPrices', () => {
  it('prefers adjClose and falls back to close', () => {
    expect(
      parseTiingoPrices([
        { date: '2024-01-02T00:00:00.000Z', adjClose: 12.5, close: 10 },
        { date: '2024-01-03T00:00:00.000Z', close: 11 },
      ]),
    ).toEqual([
      { date: '2024-01-02', eod: 12.5 },
      { date: '2024-01-03', eod: 11 },
    ]);
  });

  it('throws when the payload is not a price array', () => {
    expect(() => parseTiingoPrices({ detail: 'Not found.' })).toThrow(
      /not a price array/,
    );
  });
});

describe('resolveTiingoSymbol', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('maps SGH to PENG', () => {
    expect(resolveTiingoSymbol('sgh')).toEqual({
      sheetSymbol: 'SGH',
      tiingoSymbol: 'PENG',
    });
  });

  it('honors TIINGO_SYMBOL_ALIASES', () => {
    vi.stubEnv('TIINGO_SYMBOL_ALIASES', 'TEF:TEF.MC');
    expect(resolveTiingoSymbol('TEF')).toEqual({
      sheetSymbol: 'TEF',
      tiingoSymbol: 'TEF.MC',
    });
  });
});

describe('fetchTiingoHistory', () => {
  beforeEach(() => {
    vi.stubEnv('TIINGO_API_TOKEN', 'test-token');
    vi.stubEnv('TIINGO_SYMBOL_ALIASES', '');
    vi.stubEnv('YAHOO_SYMBOL_ALIASES', '');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('loads history with the Token header', async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        expect(url).toContain('/tiingo/daily/CORT/prices');
        expect(url).toContain('startDate=');
        expect(new Headers(init?.headers).get('Authorization')).toBe(
          'Token test-token',
        );
        return jsonResponse([
          { date: '2024-01-02T00:00:00.000Z', adjClose: 32.1 },
          { date: '2024-01-03T00:00:00.000Z', adjClose: 33.4 },
        ]);
      },
    );
    vi.stubGlobal('fetch', fetchMock);

    const rows = await fetchTiingoHistory('CORT', '2024-01-01', '2024-01-31');
    expect(rows).toEqual([
      { date: '2024-01-02', eod: 32.1 },
      { date: '2024-01-03', eod: 33.4 },
    ]);
  });

  it('requests PENG history for sheet symbol SGH', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      expect(url).toContain('/tiingo/daily/PENG/prices');
      return jsonResponse([{ date: '2024-01-02T00:00:00.000Z', adjClose: 20 }]);
    });
    vi.stubGlobal('fetch', fetchMock);

    const rows = await fetchTiingoHistory('SGH', '2024-01-01', '2024-01-31');
    expect(rows).toEqual([{ date: '2024-01-02', eod: 20 }]);
  });

  it('throws TiingoRateLimitError on 429', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('Too Many Requests', { status: 429 })),
    );

    await expect(
      fetchTiingoHistory('INTC', '2024-01-01', '2024-01-31'),
    ).rejects.toBeInstanceOf(TiingoRateLimitError);
  });

  it('requires TIINGO_API_TOKEN', async () => {
    vi.stubEnv('TIINGO_API_TOKEN', '');
    await expect(fetchTiingoHistory('AAPL')).rejects.toThrow(
      /TIINGO_API_TOKEN is not set/,
    );
  });
});
