"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { preloadImages } from "@/lib/introMedia";
import Logo from "@/app/BLANK_CO.svg";

export type IntroMediaItem = {
  type: "image" | "video";
  src: string;
};

type IntroPhase = "cycle" | "collapse" | "hold" | "fade" | "done";

const DESIGN_STATIC = false;

const SESSION_KEY = "bc-intro-seen";
const SLIDE_MS = 280;
/** Fixed flicker duration — does not wait for full site load */
const CYCLE_MS = 4000;
const COLLAPSE_MS = 800;
const HOLD_MS = 350;
const FADE_MS = 900;

type IntroLoaderProps = {
  media: IntroMediaItem[];
  /** Critical first-screen images to warm in the background during the intro */
  preloadUrls?: string[];
};

export default function IntroLoader({
  media,
  preloadUrls = [],
}: IntroLoaderProps) {
  const slides = useMemo(
    () => media.filter((item) => item.type === "image" && Boolean(item.src)),
    [media],
  );
  const [phase, setPhase] = useState<IntroPhase | "boot">("boot");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!DESIGN_STATIC) {
      try {
        if (sessionStorage.getItem(SESSION_KEY)) {
          setPhase("done");
          return;
        }
      } catch {
        // sessionStorage may be blocked
      }

      if (slides.length === 0) {
        setPhase("done");
        return;
      }
    }

    setPhase("cycle");
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [slides.length]);

  // Flicker through thumbnails for a fixed window
  useEffect(() => {
    if (DESIGN_STATIC || phase !== "cycle" || slides.length === 0) return;

    const slideTimer = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_MS);

    const endTimer = window.setTimeout(() => {
      setPhase("collapse");
    }, CYCLE_MS);

    return () => {
      window.clearInterval(slideTimer);
      window.clearTimeout(endTimer);
    };
  }, [phase, slides.length]);

  // Warm critical first-screen images in the background (non-blocking)
  useEffect(() => {
    if (DESIGN_STATIC || phase !== "cycle") return;

    const urls = [
      ...new Set([
        ...slides.map((s) => s.src),
        ...preloadUrls.filter(Boolean),
      ]),
    ];
    void preloadImages(urls);
  }, [phase, slides, preloadUrls]);

  useEffect(() => {
    if (DESIGN_STATIC) return;

    if (phase === "collapse") {
      const t = window.setTimeout(() => setPhase("hold"), COLLAPSE_MS);
      return () => window.clearTimeout(t);
    }
    if (phase === "hold") {
      const t = window.setTimeout(() => setPhase("fade"), HOLD_MS);
      return () => window.clearTimeout(t);
    }
    if (phase === "fade") {
      const t = window.setTimeout(() => {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          // ignore
        }
        document.body.style.overflow = "";
        setPhase("done");
      }, FADE_MS);
      return () => window.clearTimeout(t);
    }
  }, [phase]);

  if (phase === "boot" || phase === "done") return null;

  const current = slides[index] ?? slides[0];
  const mediaOpen = phase === "cycle";
  const overlayFading = phase === "fade";

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-white px-3 transition-opacity ease-out md:px-4 ${
        overlayFading
          ? "opacity-0 duration-[900ms]"
          : "opacity-100 duration-150"
      }`}
      aria-hidden
    >
      <div className="flex max-w-full flex-col items-center gap-[0.2em] font-medium tracking-tight text-black uppercase text-[clamp(1.15rem,10.2vw,3.6rem)] md:text-[clamp(2.25rem,30vw,10rem)]">
        <Image
          src={Logo}
          alt="BlankCo Logo"
          width={808}
          height={139}
          unoptimized
          className="h-[1.15em] w-auto md:h-[1em]"
          priority
        />

        <div className="flex items-center font-normal text-[clamp(0.8rem,30vw,10.5rem)] md:text-[clamp(1.5rem,20vw,20rem)]">
          <span className="select-none leading-none">(</span>

          <div
            className={`relative mx-[0.06em] overflow-hidden bg-neutral-100 transition-[width,opacity,margin] duration-[800ms] ease-in-out ${
              mediaOpen ? "opacity-100" : "mx-0 w-0 opacity-0"
            }`}
            style={
              mediaOpen
                ? {
                    height: "0.75em",
                    width: "calc(0.75em * 16 / 9)",
                    transform: "translateY(0.08em)",
                  }
                : {
                    height: "0.75em",
                    width: 0,
                    transform: "translateY(0.08em)",
                  }
            }
          >
            {current?.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={current.src}
                src={current.src}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                decoding="async"
              />
            ) : null}
          </div>

          <span className="select-none leading-none">)</span>
        </div>
      </div>
    </div>
  );
}
