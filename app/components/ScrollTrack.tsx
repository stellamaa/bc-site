"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from "react";

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
   * Horizontal: track spans the thumbnail block — from the start of the
   * first thumb to the end of the last (fixed; does not move with paging).
   */
  insetEnds?: boolean;
  /** Horizontal + below: sit right under the thumbnails instead of a full gap */
  tight?: boolean;
};

/** Where along the track the pointer sits, 0–1. */
function trackRatio(clientPos: number, rect: DOMRect, isVertical: boolean) {
  const start = isVertical ? rect.top : rect.left;
  const length = isVertical ? rect.height : rect.width;
  if (length <= 0) return 0;
  return Math.min(1, Math.max(0, (clientPos - start) / length));
}

/** Grey track with black thumb synced to scroll position. */
export default function ScrollTrack({
  scrollRef,
  visible,
  itemCount,
  width = "half",
  orientation = "horizontal",
  placement = "below",
  insetEnds = false,
  tight = false,
}: ScrollTrackProps) {
  const isVertical = orientation === "vertical";
  const [thumb, setThumb] = useState({ offset: 0, size: 100 });
  const [ends, setEnds] = useState({ left: 0, right: 0 });
  const [dragging, setDragging] = useState(false);
  const dragCleanup = useRef<(() => void) | null>(null);

  // A drag can outlive the track (a filter change hides it mid-gesture).
  useEffect(() => () => dragCleanup.current?.(), []);

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

      // Outer edges of first → last thumbnail (stable while paging)
      const pageRect = page.getBoundingClientRect();
      const first = firstEl.getBoundingClientRect();
      const last = lastEl.getBoundingClientRect();
      setEnds({
        left: Math.max(0, first.left - pageRect.left),
        right: Math.max(0, pageRect.right - last.right),
      });
    };

    updateEnds();
    const ro = new ResizeObserver(updateEnds);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scrollRef, visible, itemCount, insetEnds, isVertical]);

  if (!visible) return null;

  /**
   * Grab the thumb and the content follows the pointer; press anywhere else on
   * the track and it glides there first, then follows.
   */
  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el || event.button !== 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const view = isVertical ? el.clientHeight : el.clientWidth;
    const content = isVertical ? el.scrollHeight : el.scrollWidth;
    const max = content - view;
    const size = view / content;
    // How much of the track the thumb can travel over.
    const travel = 1 - size;
    if (max <= 0 || travel <= 0) return;

    const pointer = (e: { clientX: number; clientY: number }) =>
      isVertical ? e.clientY : e.clientX;
    const scrolled = () => (isVertical ? el.scrollTop : el.scrollLeft);

    const ratio = trackRatio(pointer(event), rect, isVertical);
    const thumbStart = (scrolled() / max) * travel;
    const onThumb = ratio >= thumbStart && ratio <= thumbStart + size;
    // Off the thumb, the press centres it under the pointer.
    const grab = onThumb ? ratio - thumbStart : size / 2;

    const offsetFor = (clientPos: number) => {
      const start = trackRatio(clientPos, rect, isVertical) - grab;
      return Math.min(1, Math.max(0, start / travel)) * max;
    };

    // Snap would yank the list back mid-drag; let it settle on release instead.
    const snapped = getComputedStyle(el).scrollSnapType !== "none";
    if (snapped) el.style.scrollSnapType = "none";

    if (!onThumb) {
      const to = offsetFor(pointer(event));
      el.scrollTo(
        isVertical
          ? { top: to, behavior: "smooth" }
          : { left: to, behavior: "smooth" },
      );
    }

    const onMove = (e: globalThis.PointerEvent) => {
      const to = offsetFor(pointer(e));
      if (isVertical) el.scrollTop = to;
      else el.scrollLeft = to;
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      dragCleanup.current = null;
      setDragging(false);
      if (!snapped) return;
      el.style.scrollSnapType = "";
      const page = view;
      const to = Math.min(max, Math.max(0, Math.round(scrolled() / page) * page));
      el.scrollTo(
        isVertical
          ? { top: to, behavior: "smooth" }
          : { left: to, behavior: "smooth" },
      );
    };

    event.preventDefault();
    setDragging(true);
    dragCleanup.current = onUp;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const grabCursor = dragging ? "cursor-grabbing" : "cursor-grab";
  // The bar is 2px; the pointer gets a band either side of it to aim at.
  const hitArea = (
    <span
      className={`absolute ${
        // Leaner above, where the thumbnails sit, than in the space below.
        isVertical ? "inset-y-0 -left-2.5 -right-2.5" : "inset-x-0 -top-2 -bottom-3"
      }`}
    />
  );

  if (isVertical) {
    return (
      <div
        className="hidden h-full shrink-0 items-stretch pl-2 md:flex"
        aria-hidden
      >
        <div
          className={`relative h-full w-[2px] touch-none select-none bg-neutral-300 ${grabCursor}`}
          onPointerDown={startDrag}
        >
          {hitArea}
          <div
            className={`absolute left-0 w-[2px] bg-black ${
              dragging ? "" : "transition-[top,height] duration-75"
            }`}
            style={{ top: `${thumb.offset}%`, height: `${thumb.size}%` }}
          />
        </div>
      </div>
    );
  }

  const track = (
    <div
      className={`relative h-[2px] w-full touch-none select-none bg-neutral-300 ${grabCursor}`}
      onPointerDown={startDrag}
    >
      {hitArea}
      <div
        className={`absolute top-0 h-[2px] bg-black ${
          dragging ? "" : "transition-[left,width] duration-75"
        }`}
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
      // Gap tightens on short windows so the track stays on screen
      className={`${
        tight ? "mt-[clamp(0.5rem,1.4dvh,0.875rem)]" : "mt-[clamp(0.5rem,3.7dvh,2rem)]"
      } hidden w-full md:flex ${
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
