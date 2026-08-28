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
  /** Horizontal: below content (default) or overlaid mid */
  placement?: "below" | "mid";
  /**
   * Horizontal: fixed inset so the track starts at the end of the first
   * thumbnail and ends at the start of the last (does not move with paging).
   */
  insetEnds?: boolean;
};

/** Grey track with black thumb synced to scroll position. */
export default function ScrollTrack({
  scrollRef,
  visible,
  itemCount,
  width = "half",
  orientation = "horizontal",
  placement = "below",
  insetEnds = false,
}: ScrollTrackProps) {
  const isVertical = orientation === "vertical";
  const [thumb, setThumb] = useState({ offset: 0, size: 100 });
  const [ends, setEnds] = useState({ left: 0, right: 0 });

  // Thumb position follows scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !visible) return;

    const updateThumb = () => {
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

    updateThumb();
    el.addEventListener("scroll", updateThumb, { passive: true });
    const ro = new ResizeObserver(updateThumb);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateThumb);
      ro.disconnect();
    };
  }, [scrollRef, visible, itemCount, isVertical]);

  // Insets are layout-fixed from the first page — not tied to the active page
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !visible || !insetEnds || isVertical) return;

    const updateEnds = () => {
      const page = el.querySelector<HTMLElement>(":scope > ul");
      const items = page?.querySelectorAll<HTMLElement>(":scope > li");
      if (!page || !items || items.length < 2) {
        setEnds({ left: 0, right: 0 });
        return;
      }

      const firstEl =
        items[0]!.querySelector<HTMLElement>("button") ?? items[0]!;
      const lastEl =
        items[items.length - 1]!.querySelector<HTMLElement>("button") ??
        items[items.length - 1]!;

      // Relative to the page box so values stay stable while paging
      const pageRect = page.getBoundingClientRect();
      const first = firstEl.getBoundingClientRect();
      const last = lastEl.getBoundingClientRect();
      setEnds({
        left: Math.max(0, first.right - pageRect.left),
        right: Math.max(0, pageRect.right - last.left),
      });
    };

    updateEnds();
    const ro = new ResizeObserver(updateEnds);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scrollRef, visible, itemCount, insetEnds, isVertical]);

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
        className="hidden h-full shrink-0 items-center justify-center md:flex"
        aria-hidden
      >
        <div
          className="relative h-3/5 w-[2px] cursor-pointer bg-neutral-300"
          onClick={(e) => seek(e.clientY, e.currentTarget)}
        >
          <div
            className="absolute left-0 w-[2px] bg-black transition-[top,height] duration-75"
            style={{ top: `${thumb.offset}%`, height: `${thumb.size}%` }}
          />
        </div>
      </div>
    );
  }

  const track = (
    <div
      className="relative h-px w-full cursor-pointer bg-neutral-300"
      onClick={(e) => seek(e.clientX, e.currentTarget)}
    >
      <div
        className="absolute top-0 h-px bg-black transition-[left,width] duration-75"
        style={{ left: `${thumb.offset}%`, width: `${thumb.size}%` }}
      />
    </div>
  );

  const insetPad =
    insetEnds && ends.left + ends.right > 0
      ? { paddingLeft: ends.left, paddingRight: ends.right }
      : undefined;

  if (placement === "mid") {
    return (
      <div
        className="pointer-events-none absolute inset-0 z-10 hidden items-center md:flex"
        style={insetPad}
        aria-hidden
      >
        <div className="pointer-events-auto w-full">{track}</div>
      </div>
    );
  }

  return (
    <div
      className={`mt-8 hidden w-full md:flex ${
        width === "half" && !insetEnds ? "justify-center" : ""
      }`}
      style={insetPad}
      aria-hidden
    >
      {width === "half" && !insetEnds ? (
        <div className="w-1/2">{track}</div>
      ) : (
        track
      )}
    </div>
  );
}
