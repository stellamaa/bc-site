import type { About } from "@/types/about";
import type { Talent } from "@/types/talent";
import type { Work } from "@/types/work";
import type { IntroMediaItem } from "@/app/components/IntroLoader";

/** Intro slideshow: thumbnails + gallery stills (skip videos for a fast flicker). */
export function collectIntroMedia(works: Work[]): IntroMediaItem[] {
  const items: IntroMediaItem[] = [];
  const seen = new Set<string>();

  const push = (src?: string) => {
    if (!src || seen.has(src)) return;
    seen.add(src);
    items.push({ type: "image", src });
  };

  for (const work of works) {
    push(work.thumbnail);
    for (const image of work.gallery ?? []) {
      push(image.url);
    }
  }

  return items;
}

/** Site images to warm in cache while the intro runs. */
export function collectSiteImageUrls(
  works: Work[],
  talents: Talent[],
  about: About | null,
): string[] {
  const urls = new Set<string>();

  for (const work of works) {
    if (work.thumbnail) urls.add(work.thumbnail);
    for (const image of work.gallery ?? []) {
      if (image.url) urls.add(image.url);
    }
  }

  for (const talent of talents) {
    if (talent.image) urls.add(talent.image);
  }

  if (about?.featuredImage) urls.add(about.featuredImage);
  for (const profile of about?.profiles ?? []) {
    if (profile.image) urls.add(profile.image);
  }

  return [...urls];
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
