/**
 * Resolve a ticker from a Next.js catch-all slug (`[[...slug]]`).
 * `useParams()` may yield a string or string[]; page `params` should not be
 * read as a sync object in the App Router (it is a Promise).
 */
export function resolveSymbolFromSlug(
  slug: string | string[] | undefined | null,
  fallback = 'INTU'
): string {
  const raw = Array.isArray(slug) ? slug[0] : slug;
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim().toUpperCase();
  }
  return fallback;
}
