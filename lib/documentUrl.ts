/**
 * Build a same-document URL for `history.pushState` / `replaceState`.
 *
 * Uses `window.location.pathname` so Next.js `basePath` (e.g. `/bc-site` on
 * GitHub Pages) is preserved. Root-absolute strings like `/#work` resolve to
 * the host root and drop basePath; prefer this helper instead.
 */
export function documentUrl(search: string, hash = ""): string {
  const q = search
    ? search.startsWith("?")
      ? search
      : `?${search}`
    : "";
  const h = hash ? (hash.startsWith("#") ? hash : `#${hash}`) : "";
  return `${window.location.pathname}${q}${h}`;
}
