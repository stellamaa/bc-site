import { toPlainText } from "@portabletext/toolkit";
import type { PortableTextBlock } from "sanity";

/** Primary public site — Netlify. Used for canonical, sitemap, and OG URLs. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://blank-co.uk"
).replace(/\/$/, "");

export const SITE_NAME = "BlankCo";

/** Fallback if Sanity landing copy can’t be fetched at build time. */
export const SITE_DESCRIPTION_FALLBACK =
  "BlankCo represents exceptional Film Directors, Creative Directors, and AI Creatives.";

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return `${SITE_URL}/`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function plainTextFromPortable(
  value?: PortableTextBlock[] | null,
): string {
  if (!value || value.length === 0) return "";
  try {
    return toPlainText(value).replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
}

/** Meta descriptions stay short; avoid mid-word cuts when possible. */
export function truncateMeta(text: string, max = 160): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  const slice = cleaned.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${cut}…`;
}

export const DEFAULT_OG_IMAGE = {
  url: absoluteUrl("/og-logo.png"),
  width: 1032,
  height: 143,
  alt: SITE_NAME,
};
