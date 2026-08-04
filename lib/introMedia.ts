import type { Work } from "@/types/work";
import type { IntroMediaItem } from "@/app/components/IntroLoader";

/** Collect work thumbnails, gallery images, and uploaded video files for the intro. */
export function collectIntroMedia(works: Work[]): IntroMediaItem[] {
  const items: IntroMediaItem[] = [];

  for (const work of works) {
    if (work.videoFileUrl) {
      items.push({ type: "video", src: work.videoFileUrl });
    }
    if (work.thumbnail) {
      items.push({ type: "image", src: work.thumbnail });
    }
    for (const image of work.gallery ?? []) {
      if (image.url) {
        items.push({ type: "image", src: image.url });
      }
    }
  }

  return items;
}
