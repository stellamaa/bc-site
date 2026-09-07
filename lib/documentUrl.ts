import { absoluteAppPath } from "@/lib/sharePaths";

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
  url: string,
) {
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

function withSearchHash(path: string, search = "", hash = "") {
  const q = search
    ? search.startsWith("?")
      ? search
      : `?${search}`
    : "";
  const h = hash ? (hash.startsWith("#") ? hash : `#${hash}`) : "";
  return `${path}${q}${h}`;
}

export function replaceDocumentUrl(search: string, hash = "") {
  safeHistoryWrite("replaceState", documentUrl(search, hash));
}

export function pushDocumentUrl(search: string, hash = "") {
  safeHistoryWrite("pushState", documentUrl(search, hash));
}

/** Address bar → app path (e.g. `/work/slug`) without a full navigation. */
export function pushAppPath(path: string, search = "", hash = "") {
  safeHistoryWrite(
    "pushState",
    withSearchHash(absoluteAppPath(path), search, hash),
  );
}

export function replaceAppPath(path: string, search = "", hash = "") {
  safeHistoryWrite(
    "replaceState",
    withSearchHash(absoluteAppPath(path), search, hash),
  );
}
