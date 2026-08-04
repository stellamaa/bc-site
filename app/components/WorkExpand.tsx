"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  getGalleryImages,
  getWorkMediaKind,
  parseVideoSource,
} from "@/lib/workMedia";
import type { Work } from "@/types/work";

type WorkExpandProps = {
  work: Work;
  onClose: () => void;
};

export default function WorkExpand({ work, onClose }: WorkExpandProps) {
  const mediaKind = getWorkMediaKind(work);
  const video = parseVideoSource(work.videoUrl, work.videoFileUrl);
  const gallery = getGalleryImages(work);

  const [playing, setPlaying] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setPlaying(false);
    setGalleryIndex(0);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [work._id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const poster = work.thumbnail;
  const currentImage = gallery[galleryIndex];
  const canPrev = galleryIndex > 0;
  const canNext = galleryIndex < gallery.length - 1;

  const handlePlay = async () => {
    setPlaying(true);
    if (video?.kind === "file" && videoRef.current) {
      try {
        await videoRef.current.play();
      } catch {
        // Autoplay may still be blocked; controls remain available.
      }
    }
  };

  return (
    <div className="work-expand mb-8 animate-[workExpandIn_320ms_ease-out] md:mb-10">
      <div className="relative aspect-video w-[55%] max-w-xl overflow-hidden bg-neutral-200 [container-type:size] md:w-1/2 md:max-w-none">
        {mediaKind === "video" && video ? (
          <>
            {video.kind === "youtube" && playing ? (
              <iframe
                title={work.title || "Project video"}
                src={video.embedUrl}
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : null}

            {video.kind === "file" ? (
              <video
                ref={videoRef}
                src={video.src}
                poster={poster}
                className={`absolute inset-0 h-full w-full object-cover ${playing ? "" : "pointer-events-none"}`}
                playsInline
                controls={playing}
                onEnded={() => setPlaying(false)}
              />
            ) : null}

            {!playing && video.kind === "youtube" && poster ? (
              <Image
                src={poster}
                alt={work.thumbnailAlt || work.title || "Project"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 70vw"
                priority
              />
            ) : null}

            {!playing ? (
              <button
                type="button"
                onClick={handlePlay}
                className="absolute inset-0 z-10 flex items-center justify-center font-medium tracking-wide text-white drop-shadow transition-opacity hover:opacity-80 text-[80cqh] leading-none"
                aria-label="Play video"
              >
                {"(>)"}
              </button>
            ) : null}
          </>
        ) : null}

        {mediaKind === "gallery" && currentImage?.url ? (
          <Image
            src={currentImage.url}
            alt={currentImage.alt || work.title || "Gallery image"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 70vw"
            priority
          />
        ) : null}

        {mediaKind === "none" && poster ? (
          <Image
            src={poster}
            alt={work.thumbnailAlt || work.title || "Project"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 70vw"
            priority
          />
        ) : null}

        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 text-3xl font-medium tracking-wide text-white drop-shadow transition-opacity hover:opacity-80 md:top-5 md:right-5 md:text-5xl"
          aria-label="Close project"
        >
          (X)
        </button>
      </div>

      {mediaKind === "gallery" && gallery.length > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-6 text-sm font-medium tracking-wide md:text-base">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => setGalleryIndex((i) => Math.max(0, i - 1))}
            className={`group transition-opacity ${canPrev ? "hover:opacity-60" : "opacity-30"}`}
            aria-label="Previous image"
          >
            <span className="invisible group-hover:visible group-focus-visible:visible group-active:visible">
              (
            </span>
            PREV
            <span className="invisible group-hover:visible group-focus-visible:visible group-active:visible">
              )
            </span>
          </button>
          <span className="tabular-nums text-neutral-400">
            {galleryIndex + 1}/{gallery.length}
          </span>
          <button
            type="button"
            disabled={!canNext}
            onClick={() =>
              setGalleryIndex((i) => Math.min(gallery.length - 1, i + 1))
            }
            className={`group transition-opacity ${canNext ? "hover:opacity-60" : "opacity-30"}`}
            aria-label="Next image"
          >
            <span className="invisible group-hover:visible group-focus-visible:visible group-active:visible">
              (
            </span>
            NEXT
            <span className="invisible group-hover:visible group-focus-visible:visible group-active:visible">
              )
            </span>
          </button>
        </div>
      ) : null}

      {work.description ? (
        <p className="mt-5 max-w-3xl text-sm font-normal leading-snug whitespace-pre-line md:mt-6 md:text-base md:leading-normal">
          {work.description}
        </p>
      ) : null}
    </div>
  );
}
