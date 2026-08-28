"use client";

import { useEffect, useRef, useState } from "react";
import PortableText from "@/app/components/PortableText";
import type { PortableTextBlock } from "sanity";

type Props = {
  description: PortableTextBlock[];
};

type Bounds = { marginLeft: number; maxWidth: number };

/**
 * Mobile landing copy — spans from the end of ABOUT US to the start of CONTACT
 * in the header nav.
 */
export default function LandingMobileCopy({ description }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<Bounds | undefined>(undefined);

  useEffect(() => {
    const update = () => {
      const about = document.querySelector<HTMLElement>(
        '[data-nav-section="about"]',
      );
      const contact = document.querySelector<HTMLElement>(
        '[data-nav-section="contact"]',
      );
      const track = trackRef.current;
      if (!about || !contact || !track) return;

      const trackLeft = track.getBoundingClientRect().left;
      const aboutRight = about.getBoundingClientRect().right;
      const contactLeft = contact.getBoundingClientRect().left;

      setBounds({
        marginLeft: Math.max(0, Math.round(aboutRight - trackLeft)),
        maxWidth: Math.max(0, Math.round(contactLeft - aboutRight)),
      });
    };

    update();
    window.addEventListener("resize", update);
    const about = document.querySelector<HTMLElement>(
      '[data-nav-section="about"]',
    );
    const contact = document.querySelector<HTMLElement>(
      '[data-nav-section="contact"]',
    );
    const ro = new ResizeObserver(update);
    if (about) ro.observe(about);
    if (contact) ro.observe(contact);
    return () => {
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={trackRef} className="mb-2 w-full">
      <div
        style={
          bounds
            ? { marginLeft: bounds.marginLeft, maxWidth: bounds.maxWidth }
            : undefined
        }
      >
        <PortableText
          value={description}
          className="text-center text-sm font-normal leading-relaxed text-black"
        />
      </div>
    </div>
  );
}
