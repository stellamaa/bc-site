/** Sanity CDN resize — smaller source bytes before next/image (or raw <img>). */
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

/**
 * Work/talent grid thumbs (~160–400 CSS px, up to 2× DPR).
 * Asking Sanity for 640px avoids shipping 2–4k originals into tiny cards.
 */
export function workThumbnailUrl(src?: string | null): string | undefined {
  if (!src) return undefined;
  return sizedImageUrl(src, 640);
}

/** Expand poster / still behind the play control. */
export function workPosterUrl(src?: string | null): string | undefined {
  if (!src) return undefined;
  return sizedImageUrl(src, 1280);
}

/** Full-bleed gallery stills in the expand. */
export function workGalleryUrl(src?: string | null): string | undefined {
  if (!src) return undefined;
  return sizedImageUrl(src, 1600);
}
