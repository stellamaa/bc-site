"use client";

import { useEffect, useState, type RefObject } from "react";

type ScrollTrackProps = {
  scrollRef: RefObject<HTMLElement | null>;
  visible: boolean;
  /** Recompute when list length changes */
  itemCount?: number;
  /** Track width relative to the content area */
  width?: "half" | "full";
};

/** Grey track with black thumb synced to horizontal scroll. */
export default function ScrollTrack({
  scrollRef,
  visible,
  itemCount,
  width = "half",
}: ScrollTrackProps) {
  const [thumb, setThumb] = useState({ left: 0, width: 100 });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !visible) return;

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const max = scrollWidth - clientWidth;
      if (max <= 0 || scrollWidth <= 0) {
        setThumb({ left: 0, width: 100 });
        return;
      }
      const thumbWidth = (clientWidth / scrollWidth) * 100;
      const left = (scrollLeft / max) * (100 - thumbWidth);
      setThumb({ left, width: thumbWidth });
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [scrollRef, visible, itemCount]);

  if (!visible) return null;

  const seek = (clientX: number, target: HTMLElement) => {
    const el = scrollRef.current;
    if (!el) return;
    const rect = target.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const max = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: ratio * max, behavior: "smooth" });
  };

  return (
    <div
      className={`mt-8 hidden w-full md:flex ${width === "half" ? "justify-center" : ""}`}
      aria-hidden
    >
      <div
        className={`relative h-px cursor-pointer bg-neutral-300 ${
          width === "half" ? "w-1/2" : "w-full"
        }`}
        onClick={(e) => seek(e.clientX, e.currentTarget)}
      >
        <div
          className="absolute top-0 h-px bg-black transition-[left,width] duration-75"
          style={{ left: `${thumb.left}%`, width: `${thumb.width}%` }}
        />
      </div>
    </div>
  );
}
