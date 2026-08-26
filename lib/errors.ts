/** Human-readable detail for logs, emails, and API error payloads. */
export function formatUnknownError(err: unknown): string {
  if (err instanceof Error) {
    const head =
      err.name && err.name !== 'Error' ? `${err.name}: ${err.message}` : err.message;
    if (err.cause !== undefined) {
      return `${head} (cause: ${formatUnknownError(err.cause)})`;
    }
    return head;
  }
  return String(err);
}

export function formatBackfillFailure(symbol: string, reason: string): string {
  return `Backfill failed for ${symbol}: ${reason}`;
}
