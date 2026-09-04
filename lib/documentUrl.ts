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

/**
 * Same-document history update that tolerates Next App Router not being ready
 * yet (`Router action dispatched before initialization`).
 */
function notifyLocationChange() {
  // history.push/replaceState does not update Next useSearchParams on static export.
  window.dispatchEvent(new Event("bc:location"));
}

function safeHistoryWrite(
  method: "pushState" | "replaceState",
  search: string,
  hash = "",
) {
  const url = documentUrl(search, hash);
  const write = () => {
    try {
      window.history[method](window.history.state, "", url);
      notifyLocationChange();
    } catch {
      // App Router history patch can throw before initialization / during HMR.
    }
  };
  // Defer so App Router can finish wiring dispatch on first paint.
  queueMicrotask(write);
}

export function replaceDocumentUrl(search: string, hash = "") {
  safeHistoryWrite("replaceState", search, hash);
}

export function pushDocumentUrl(search: string, hash = "") {
  safeHistoryWrite("pushState", search, hash);
}
