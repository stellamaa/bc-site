import type { Work, WorkGalleryImage } from "@/types/work";

export type WorkMediaKind = "video" | "gallery" | "none";

export type ParsedVideo =
  | { kind: "youtube"; embedUrl: string; watchUrl: string }
  | { kind: "file"; src: string };

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

function isDirectVideoUrl(url: string) {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return /\.(mp4|mov|webm|m4v|ogg)(\?|$)/.test(path);
  } catch {
    return /\.(mp4|mov|webm|m4v|ogg)(\?|$)/i.test(url);
  }
}

export function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!YOUTUBE_HOSTS.has(parsed.hostname)) return null;

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }

    const v = parsed.searchParams.get("v");
    if (v) return v;

    const parts = parsed.pathname.split("/").filter(Boolean);
    const embedIndex = parts.indexOf("embed");
    if (embedIndex >= 0 && parts[embedIndex + 1]) return parts[embedIndex + 1];
    const shortsIndex = parts.indexOf("shorts");
    if (shortsIndex >= 0 && parts[shortsIndex + 1]) return parts[shortsIndex + 1];

    return null;
  } catch {
    return null;
  }
}

export function parseVideoSource(
  videoUrl?: string,
  videoFileUrl?: string,
): ParsedVideo | null {
  if (videoFileUrl) {
    return { kind: "file", src: videoFileUrl };
  }

  if (!videoUrl) return null;

  const youtubeId = getYouTubeId(videoUrl);
  if (youtubeId) {
    return {
      kind: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`,
      watchUrl: videoUrl,
    };
  }

  if (isDirectVideoUrl(videoUrl)) {
    return { kind: "file", src: videoUrl };
  }

  // Fallback: try as file source (CDN URLs without extension, etc.)
  return { kind: "file", src: videoUrl };
}

export function getWorkMediaKind(work: Work): WorkMediaKind {
  if (work.videoUrl || work.videoFileUrl) return "video";
  const gallery = (work.gallery ?? []).filter((img): img is WorkGalleryImage & { url: string } =>
    Boolean(img.url),
  );
  if (gallery.length > 0) return "gallery";
  return "none";
}

export function getGalleryImages(work: Work): WorkGalleryImage[] {
  return (work.gallery ?? []).filter((img) => Boolean(img.url));
}
