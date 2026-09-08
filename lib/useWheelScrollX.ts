"use client";

import { useEffect, type RefObject } from "react";

type WheelScrollXOptions = {
  /** Region the gesture is picked up in — usually the whole section. */
  areaRef: RefObject<HTMLElement | null>;
  /** The horizontally scrolling element. */
  scrollRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  /** Snap container: glide a page at a time, the way the browser does. */
  paged?: boolean;
};

/** A trackpad flick keeps firing while it coasts; treat the whole run as one. */
const GESTURE_END_MS = 200;
/** Backstop for a gap in the event stream, so one flick can't slip through twice. */
const MIN_PAGE_GAP_MS = 250;
/** Ignore the specks of delta a flick trails off with. */
const PAGE_THRESHOLD_PX = 12;

/**
 * A vertical list under the pointer (e.g. the talent names) keeps the gesture,
 * as long as it still has room to move that way.
 */
function hasVerticalScroll(
  target: EventTarget | null,
  stop: HTMLElement,
  delta: number,
) {
  let node = target instanceof Element ? target : null;

  while (node && node !== stop) {
    const overflowY = getComputedStyle(node).overflowY;
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      const room =
        delta < 0
          ? node.scrollTop > 0
          : node.scrollTop < node.scrollHeight - node.clientHeight - 1;
      if (room) return true;
    }
    node = node.parentElement;
  }

  return false;
}

/**
 * Desktop: let a wheel or trackpad gesture anywhere in the section drive the
 * horizontal list, matching what the pointer does over the list itself — a
 * free strip follows the gesture, a snap grid glides one page.
 */
export function useWheelScrollX({
  areaRef,
  scrollRef,
  enabled,
  paged = false,
}: WheelScrollXOptions) {
  useEffect(() => {
    if (!enabled) return;
    const area = areaRef.current;
    if (!area) return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    // One page per gesture: a flick coasts for a while after the fingers
    // lift, and those trailing events must not turn a second page.
    let armed = true;
    let lastPageAt = 0;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const onWheel = (event: WheelEvent) => {
      // Pinch-zoom arrives as a ctrl-wheel; leave it to the browser.
      if (event.ctrlKey) return;

      const scroller = scrollRef.current;
      if (!scroller) return;
      const max = scroller.scrollWidth - scroller.clientWidth;
      if (max <= 1) return;

      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      // A sideways gesture over the list already scrolls it natively.
      if (horizontal && scroller.contains(event.target as Node)) return;

      const delta = horizontal ? event.deltaX : event.deltaY;
      if (delta === 0) return;
      if (!horizontal && hasVerticalScroll(event.target, area, delta)) return;

      // At either end, hand the gesture back so the page can still move.
      if (delta < 0 && scroller.scrollLeft <= 0) return;
      if (delta > 0 && scroller.scrollLeft >= max - 1) return;

      event.preventDefault();

      if (!paged) {
        scroller.scrollLeft += delta;
        return;
      }

      // Snap is mandatory here, so the list can only sit on a page: aim at the
      // next one and let the browser glide there, exactly as it does natively.
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        armed = true;
      }, GESTURE_END_MS);

      const now = performance.now();
      if (!armed || Math.abs(delta) < PAGE_THRESHOLD_PX) return;
      if (now - lastPageAt < MIN_PAGE_GAP_MS) return;
      armed = false;
      lastPageAt = now;

      const page = scroller.clientWidth;
      const current = Math.round(scroller.scrollLeft / page);
      const to = Math.max(
        0,
        Math.min(max, (current + Math.sign(delta)) * page),
      );
      scroller.scrollTo({ left: to, behavior: "smooth" });
    };

    area.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      area.removeEventListener("wheel", onWheel);
      clearTimeout(idleTimer);
    };
  }, [areaRef, scrollRef, enabled, paged]);
}
