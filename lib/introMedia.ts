import type { Work } from "@/types/work";
import type { IntroMediaItem } from "@/app/components/IntroLoader";
import { sizedImageUrl } from "@/lib/mediaUrl";

/** Cap intro flicker set — enough variety without flooding the network. */
const INTRO_SLIDE_LIMIT = 16;

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
