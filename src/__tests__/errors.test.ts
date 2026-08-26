import { describe, it, expect } from 'vitest';
import { formatUnknownError, formatBackfillFailure } from '../../lib/errors';

describe('formatUnknownError', () => {
  it('uses Error.message for generic Error', () => {
    expect(formatUnknownError(new Error('Yahoo HTTP 429'))).toBe('Yahoo HTTP 429');
  });

  it('includes the error name when it is not Error', () => {
    const err = new Error('The operation was aborted due to timeout');
    err.name = 'TimeoutError';
    expect(formatUnknownError(err)).toBe(
      'TimeoutError: The operation was aborted due to timeout'
    );
  });

  it('appends a nested cause', () => {
    const err = new Error('fetch failed');
    err.cause = new Error('socket hang up');
    expect(formatUnknownError(err)).toBe('fetch failed (cause: socket hang up)');
  });

  it('stringifies non-Error values', () => {
    expect(formatUnknownError('nope')).toBe('nope');
    expect(formatUnknownError(404)).toBe('404');
  });
});

describe('formatBackfillFailure', () => {
  it('includes symbol and reason', () => {
    expect(formatBackfillFailure('FOO', 'Yahoo returned no history')).toBe(
      'Backfill failed for FOO: Yahoo returned no history'
    );
  });
});
