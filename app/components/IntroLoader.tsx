"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export type IntroMediaItem = {
  type: "image" | "video";
  src: string;
};

type IntroPhase = "cycle" | "collapse" | "hold" | "fade" | "done";

const DESIGN_STATIC = false;

const SESSION_KEY = "bc-intro-seen";
const SLIDE_MS = 420;
const CYCLE_MS = 3600;
const COLLAPSE_MS = 800;
const HOLD_MS = 350;
const FADE_MS = 900;

type IntroLoaderProps = {
  media: IntroMediaItem[];
};

export default function IntroLoader({ media }: IntroLoaderProps) {
  const slides = useMemo(
    () => media.filter((item) => Boolean(item.src)),
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

  useEffect(() => {
    if (DESIGN_STATIC || phase !== "cycle" || slides.length === 0) return;

    const slideTimer = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_MS);

    const endCycle = window.setTimeout(() => {
      window.clearInterval(slideTimer);
      setPhase("collapse");
    }, CYCLE_MS);

    return () => {
      window.clearInterval(slideTimer);
      window.clearTimeout(endCycle);
    };
  }, [phase, slides.length]);

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
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-white px-4 transition-opacity ease-out ${
        overlayFading
          ? "opacity-0 duration-[900ms]"
          : "opacity-100 duration-150"
      }`}
      aria-hidden
    >
      {/* Single wordmark: BLANK C( media ) — media replaces the number in the logo */}
      <div
        className="flex items-center font-medium tracking-tight text-black uppercase"
        style={{ fontSize: "clamp(2.25rem, 19vw, 10rem)" }}
      >
        <span>BLANK&nbsp;C</span>

        <span className="select-none leading-none">(</span>

        <div
          className={`relative mx-[0.06em] overflow-hidden bg-neutral-100 transition-[width,opacity,margin] duration-[800ms] ease-in-out ${
            mediaOpen ? "opacity-100" : "mx-0 w-0 opacity-0"
          }`}
          style={
            mediaOpen
              ? {
                  height: "0.8em",
                  width: "calc(0.8em * 16 / 9)",
                  transform: "translateY(0.08em)",
                }
              : {
                  height: "0.8em",
                  width: 0,
                  transform: "translateY(0.08em)",
                }
          }
        >
          {current?.type === "video" ? (
            <video
              key={current.src}
              src={current.src}
              className="absolute inset-0 h-full w-full object-cover"
              muted
              playsInline
              autoPlay
              loop
            />
          ) : current?.src ? (
            <Image
              key={current.src}
              src={current.src}
              alt=""
              fill
              className="object-cover"
              sizes="200px"
              priority
              unoptimized
            />
          ) : null}
        </div>

        <span className="select-none leading-none">)</span>
      </div>
    </div>
  );
}
