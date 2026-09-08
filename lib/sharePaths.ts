/**
 * Path helpers for shareable work/talent URLs.
 * Preserves GitHub Pages `basePath` (/bc-site) when updating history.
 */

const APP_ROOTS = new Set(["work", "talent", "admin"]);

function currentBasePath(): string {
  if (typeof window === "undefined") return "";
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "";
  if (APP_ROOTS.has(parts[0]!)) return "";
  return `/${parts[0]}`;
}

function withTrailingSlash(path: string): string {
  if (typeof window === "undefined") return path.endsWith("/") ? path : `${path}/`;
  const wantsSlash =
    window.location.pathname.endsWith("/") ||
    path.endsWith("/") ||
    Boolean(document.querySelector("html")?.dataset.trailingSlash);
  if (!wantsSlash) return path.replace(/\/$/, "") || "/";
  if (path === "") return "/";
  return path.endsWith("/") ? path : `${path}/`;
}

/** Absolute-from-site path, e.g. `/work/my-project`. */
export function workPath(slug: string): string {
  return `/work/${encodeURIComponent(slug)}`;
}

export function talentPath(slug: string): string {
  return `/talent/${encodeURIComponent(slug)}`;
}

/** `/work/<slug>` or `/talent/<slug>` (with basePath / trailing slash) → slug. */
export function slugFromPathname(
  pathname: string,
  root: "work" | "talent",
): string | null {
  const parts = pathname.split("/").filter(Boolean);
  const index = parts.lastIndexOf(root);
  if (index === -1 || index === parts.length - 1) return null;
  return decodeURIComponent(parts[index + 1]!);
}

/** Full browser path including optional basePath + trailing slash. */
export function absoluteAppPath(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return withTrailingSlash(`${currentBasePath()}${clean}`);
}
