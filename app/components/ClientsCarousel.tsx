"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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
  const withImages = logos.filter((logo) => Boolean(logo.image));
  const [items, setItems] = useState(withImages);

  useEffect(() => {
    setItems(shuffle(withImages));
  }, [logos]);

  if (items.length === 0) return null;

  const repeats = Math.max(1, Math.ceil(MIN_TRACK_ITEMS / items.length));
  const base = Array.from({ length: repeats }, () => items).flat();
  // Duplicate the whole base set for a seamless CSS loop (translateX -50%).
  const loop = [...base, ...base];

  return (
    // Padding matches the header, so the strip lines up with the nav:
    // it starts at ABOUT US and ends at CONTACT.
    <div
      className={`w-full shrink-0 px-4 py-4 md:px-16 md:py-5 lg:px-24 ${className}`}
    >
      <div className="clients-marquee relative overflow-hidden">
        <ul
          className="clients-marquee-track flex w-max items-center gap-12 md:gap-16"
          style={{ animationDuration: `${base.length * SECONDS_PER_ITEM}s` }}
          aria-label="Previous clients"
        >
          {loop.map((logo, index) => (
            <li
              key={`${logo._id}-${index}`}
              className="relative h-[1.6rem] w-[4.8rem] shrink-0 md:h-8 md:w-[6.4rem]"
              aria-hidden={index >= items.length}
            >
              <Image
                src={logo.image!}
                alt={
                  index >= items.length
                    ? ""
                    : logo.imageAlt || logo.title || "Client logo"
                }
                fill
                className="object-contain object-center"
                sizes="128px"
              />
            </li>
          ))}
        </ul>

        <p className="pointer-events-none absolute inset-y-0 left-0 flex items-center bg-white pr-6 text-[10px] font-medium tracking-[0.12em] text-neutral-400 uppercase md:pr-10 md:text-xs">
          Previous Clients
        </p>
      </div>
    </div>
  );
}
