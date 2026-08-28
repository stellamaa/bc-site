import type { About } from "@/types/about";
import type { Talent } from "@/types/talent";
import type { Work } from "@/types/work";
import type { IntroMediaItem } from "@/app/components/IntroLoader";

/** Cap intro flicker set — enough variety without flooding the network. */
const INTRO_SLIDE_LIMIT = 16;
/** First-screen thumbs to warm during the intro (mobile 4 + desktop row). */
const CRITICAL_PRELOAD_LIMIT = 8;

/** Sanity CDN resize — keeps intro/preload payloads small. */
export function sizedImageUrl(src: string, width: number): string {
  if (!src) return src;
  try {
    const url = new URL(src);
    if (!url.hostname.includes("cdn.sanity.io")) return src;
    url.searchParams.set("w", String(width));
    url.searchParams.set("auto", "format");
    url.searchParams.set("q", "70");
    return url.toString();
  } catch {
    return src;
  }
}

/** Intro slideshow: work thumbnails only (skip galleries/videos). */
export function collectIntroMedia(works: Work[]): IntroMediaItem[] {
  const items: IntroMediaItem[] = [];
  const seen = new Set<string>();

  for (const work of works) {
    if (!work.thumbnail || seen.has(work.thumbnail)) continue;
    seen.add(work.thumbnail);
    items.push({
      type: "image",
      src: sizedImageUrl(work.thumbnail, 480),
    });
    if (items.length >= INTRO_SLIDE_LIMIT) break;
  }

  return items;
}

/**
 * Critical above-the-fold images only — enough to cover the first work grid
 * while the 4s intro runs. Everything else lazy-loads on demand.
 */
export function collectCriticalImageUrls(works: Work[]): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  for (const work of works) {
    if (!work.thumbnail || seen.has(work.thumbnail)) continue;
    seen.add(work.thumbnail);
    urls.push(sizedImageUrl(work.thumbnail, 640));
    if (urls.length >= CRITICAL_PRELOAD_LIMIT) break;
  }

  return urls;
}

/** @deprecated Prefer collectCriticalImageUrls — kept for call-site clarity. */
export function collectSiteImageUrls(
  works: Work[],
  _talents?: Talent[],
  _about?: About | null,
): string[] {
  return collectCriticalImageUrls(works);
}

/** Prefetch images into the browser cache. Resolves when all settle (or fail). */
export function preloadImages(urls: string[]): Promise<void> {
  if (urls.length === 0) return Promise.resolve();

  return Promise.all(
    urls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new window.Image();
          img.decoding = "async";
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = src;
        }),
    ),
  ).then(() => undefined);
}
