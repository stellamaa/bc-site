"use client";

import { useEffect, useState, type RefObject } from "react";

type ScrollTrackProps = {
  scrollRef: RefObject<HTMLElement | null>;
  visible: boolean;
  /** Recompute when list length changes */
  itemCount?: number;
  /** Track width relative to the content area (horizontal only) */
  width?: "half" | "full";
  orientation?: "horizontal" | "vertical";
};

/** Grey track with black thumb synced to scroll position. */
export default function ScrollTrack({
  scrollRef,
  visible,
  itemCount,
  width = "half",
  orientation = "horizontal",
}: ScrollTrackProps) {
  const isVertical = orientation === "vertical";
  const [thumb, setThumb] = useState({ offset: 0, size: 100 });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !visible) return;

    const update = () => {
      if (isVertical) {
        const { scrollTop, scrollHeight, clientHeight } = el;
        const max = scrollHeight - clientHeight;
        if (max <= 0 || scrollHeight <= 0) {
          setThumb({ offset: 0, size: 100 });
          return;
        }
        const size = (clientHeight / scrollHeight) * 100;
        const offset = (scrollTop / max) * (100 - size);
        setThumb({ offset, size });
        return;
      }

      const { scrollLeft, scrollWidth, clientWidth } = el;
      const max = scrollWidth - clientWidth;
      if (max <= 0 || scrollWidth <= 0) {
        setThumb({ offset: 0, size: 100 });
        return;
      }
      const size = (clientWidth / scrollWidth) * 100;
      const offset = (scrollLeft / max) * (100 - size);
      setThumb({ offset, size });
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [scrollRef, visible, itemCount, isVertical]);

  if (!visible) return null;

  const seek = (clientPos: number, target: HTMLElement) => {
    const el = scrollRef.current;
    if (!el) return;
    const rect = target.getBoundingClientRect();
    if (isVertical) {
      const ratio = Math.min(
        1,
        Math.max(0, (clientPos - rect.top) / rect.height),
      );
      const max = el.scrollHeight - el.clientHeight;
      el.scrollTo({ top: ratio * max, behavior: "smooth" });
      return;
    }
    const ratio = Math.min(
      1,
      Math.max(0, (clientPos - rect.left) / rect.width),
    );
    const max = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: ratio * max, behavior: "smooth" });
  };

  if (isVertical) {
    return (
      <div
        className="hidden h-full shrink-0 items-center md:flex"
        aria-hidden
      >
        <div
          className="relative h-1/3 w-px cursor-pointer bg-neutral-300"
          onClick={(e) => seek(e.clientY, e.currentTarget)}
        >
          <div
            className="absolute left-0 w-px bg-black transition-[top,height] duration-75"
            style={{ top: `${thumb.offset}%`, height: `${thumb.size}%` }}
          />
        </div>
      </div>
    );
  }

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
          style={{ left: `${thumb.offset}%`, width: `${thumb.size}%` }}
        />
      </div>
    </div>
  );
}
