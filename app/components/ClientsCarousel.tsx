"use client";

import { useEffect, useRef, useState } from "react";
import type { Logo } from "@/types/logo";

type ClientsCarouselProps = {
  logos: Logo[];
  className?: string;
};

/** Enough copies that the strip always spans wide screens without gaps. */
const MIN_TRACK_ITEMS = 12;
/** Seconds each logo takes to travel one full track length. */
const SECONDS_PER_ITEM = 4;

function shuffle<T>(list: T[]): T[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export default function ClientsCarousel({
  logos,
  className = "",
}: ClientsCarouselProps) {
  const withTitles = logos.filter((logo) => Boolean(logo.title?.trim()));
  const [items, setItems] = useState(withTitles);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setItems(shuffle(withTitles));
  }, [logos]);

  // WebKit often freezes a CSS marquee that started while the strip was
  // off-screen (the mobile list sits at the bottom of Contact). Restart once
  // it is in view so the -50% translate resolves against the real width.
  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track || items.length === 0) return;

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      track.style.animationName = "none";
      void track.offsetWidth;
      track.style.animationName = "";
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
      },
      { threshold: 0 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const repeats = Math.max(1, Math.ceil(MIN_TRACK_ITEMS / items.length));
  const base = Array.from({ length: repeats }, () => items).flat();
  // Duplicate the whole base set for a seamless CSS loop (translateX -50%).
  const loop = [...base, ...base];

  return (
    // Padding matches the header, so the strip lines up with the nav:
    // it starts at ABOUT US and ends at CONTACT.
    <div
      className={`w-full min-w-0 max-w-full shrink-0 px-4 py-4 md:px-16 md:py-5 lg:px-24 ${className}`}
    >
      <div
        ref={rootRef}
        className="clients-marquee relative w-full min-w-0 overflow-hidden"
      >
        <ul
          ref={trackRef}
          className="clients-marquee-track flex w-max flex-nowrap items-center gap-8 whitespace-nowrap md:gap-12"
          style={{ animationDuration: `${base.length * SECONDS_PER_ITEM}s` }}
          aria-label="clients"
        >
          {loop.map((logo, index) => (
            <li
              key={`${logo._id}-${index}`}
              className="shrink-0 text-[10px] font-normal tracking-[0.08em] text-neutral-500 md:text-xs"
              aria-hidden={index >= items.length}
            >
              {logo.title}
            </li>
          ))}
        </ul>

        <p className="pointer-events-none absolute inset-y-0 left-0 flex items-center bg-white pr-6 text-[10px] font-medium tracking-[0.12em] text-neutral-400 uppercase md:pr-10 md:text-xs">
           Clients
        </p>
      </div>
    </div>
  );
}
