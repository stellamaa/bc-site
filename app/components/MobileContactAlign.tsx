"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/**
 * Extra px past the leading edge of the word CONTACT.
 * Kept as a named constant so it doesn’t get lost in layout math.
 */
export const CONTACT_ALIGN_NUDGE_PX = 19;

type Props = {
  children: ReactNode;
  className?: string;
};

/** Width of inactive “CONTACT” label using the nav link’s computed font. */
function measureContactLabelWidth(contact: HTMLElement): number {
  const styles = window.getComputedStyle(contact);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return 58;
  ctx.font = [
    styles.fontWeight,
    styles.fontSize,
    styles.fontFamily,
  ].join(" ");
  const tracking = Number.parseFloat(styles.letterSpacing) || 0;
  const base = ctx.measureText("CONTACT").width;
  // tracking-[0.08em] applies between letters (6 gaps for 7 chars)
  return base + tracking * 6;
}

/**
 * On mobile, constrains width so content ends at CONTACT in the nav.
 * Uses CONTACT’s right edge (stable) so active “(ABOUT US)” doesn’t shrink the copy.
 * Desktop: no constraint.
 */
export default function MobileContactAlign({ children, className }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    const update = () => {
      if (window.matchMedia("(min-width: 768px)").matches) {
        setMaxWidth(undefined);
        return;
      }
      const contact = document.querySelector<HTMLElement>(
        '[data-nav-section="contact"]',
      );
      const track = trackRef.current;
      if (!contact || !track) return;

      const trackLeft = track.getBoundingClientRect().left;
      // Right edge stays put with justify-between; left edge moves when active.
      const contactRight = contact.getBoundingClientRect().right;
      const labelWidth = measureContactLabelWidth(contact);
      const contactStart = contactRight - labelWidth;

      setMaxWidth(
        Math.max(
          0,
          Math.round(contactStart - trackLeft + CONTACT_ALIGN_NUDGE_PX),
        ),
      );
    };

    update();
    window.addEventListener("resize", update);
    const contact = document.querySelector<HTMLElement>(
      '[data-nav-section="contact"]',
    );
    const ro = contact ? new ResizeObserver(update) : null;
    if (contact) ro?.observe(contact);
    return () => {
      window.removeEventListener("resize", update);
      ro?.disconnect();
    };
  }, []);

  const style: CSSProperties | undefined =
    maxWidth != null ? { maxWidth } : undefined;

  return (
    <div ref={trackRef} className={className} style={style}>
      {children}
    </div>
  );
}
