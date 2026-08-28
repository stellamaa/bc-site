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
  const [isPaused, setIsPaused] = useState(true);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setPlaying(false);
    setIsPaused(true);
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

  const showPlayOverlay =
    mediaKind === "video" &&
    video &&
    (!playing || (video.kind === "file" && isPaused));

  const showPauseHitTarget =
    mediaKind === "video" &&
    video?.kind === "file" &&
    playing &&
    !isPaused;

  const handlePlay = async () => {
    setPlaying(true);
    if (video?.kind === "file" && videoRef.current) {
      try {
        await videoRef.current.play();
      } catch {
        // Autoplay may still be blocked.
      }
    }
  };

  const handlePause = () => {
    videoRef.current?.pause();
  };

  return (
    <div className="work-expand mb-2 animate-[workExpandIn_320ms_ease-out] md:mb-1 md:ml-12">
      <div className="group relative aspect-video w-full overflow-hidden bg-neutral-200 [container-type:size] md:mt-0 md:w-[48%] md:max-w-[46rem] lg:w-[82%] lg:max-w-[62rem]">
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
                controls={false}
                onPlay={() => setIsPaused(false)}
                onPause={() => setIsPaused(true)}
                onEnded={() => {
                  setPlaying(false);
                  setIsPaused(true);
                }}
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

            {showPlayOverlay ? (
              <button
                type="button"
                onClick={handlePlay}
                className="absolute inset-0 z-10 flex items-center justify-center pb-2 font-normal tracking-wide text-white transition-opacity hover:opacity-80 text-[50cqh] leading-none md:pb-6"
                aria-label="Play video"
              >
                {/* Mobile: (||) only after a real pause; before start use (>).
                    Desktop: (||) when paused mid-play; (>) before first play. */}
                <span>{playing && isPaused ? "(||)" : "(>)"}</span>
              </button>
            ) : null}

            {/* Playing: mobile invisible hit target; desktop shows (||) on hover */}
            {showPauseHitTarget ? (
              <button
                type="button"
                onClick={handlePause}
                className="absolute inset-0 z-10 flex items-center justify-center pb-10 font-normal tracking-wide text-white transition-opacity text-[50cqh] leading-none md:pb-6"
                aria-label="Pause video"
              >
                <span className="opacity-0 md:group-hover:opacity-100">
                  (||)
                </span>
              </button>
            ) : null}
          </>
        ) : null}

        {mediaKind === "gallery" && currentImage?.url ? (
          <Image
            src={currentImage.url}
            alt={currentImage.alt || work.title || "Gallery image"}
            fill
            className="object-contain"
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
          className="absolute top-1.2 right-2 z-20 text-[1.62rem] font-medium tracking-wide text-white drop-shadow transition-opacity hover:opacity-80 md:top-0 md:right-3 md:text-4xl"
          aria-label="Close project"
        >
          (X)
        </button>
      </div>

      {mediaKind === "gallery" && gallery.length > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-6 text-sm font-medium tracking-wide md:justify-start md:text-base">
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
        <p className="mt-3 max-w-2xl text-sm font-normal leading-snug whitespace-pre-line md:mt-2 md:w-[48%] md:max-w-[46rem] md:text-left md:leading-tight md:line-clamp-4 md:text-sm lg:w-[82%] lg:max-w-[62rem]">
          {work.description}
        </p>
      ) : null}
    </div>
  );
}
