"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
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
/** Keep flickering at least this long so the intro reads clearly */
const MIN_CYCLE_MS = 2200;
/** Don't block forever if a CDN image hangs */
const MAX_WAIT_MS = 12000;
const COLLAPSE_MS = 800;
const HOLD_MS = 350;
const FADE_MS = 900;

type IntroLoaderProps = {
  media: IntroMediaItem[];
  /** Site images to warm while the intro flickers */
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
  const startedAt = useRef(0);

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
    startedAt.current = performance.now();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [slides.length]);

  // Flicker through thumbnails for the whole loading wait
  useEffect(() => {
    if (DESIGN_STATIC || phase !== "cycle" || slides.length === 0) return;

    const slideTimer = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_MS);

    return () => window.clearInterval(slideTimer);
  }, [phase, slides.length]);

  // Prefetch site (+ intro) images; end cycle when ready (after a minimum time)
  useEffect(() => {
    if (DESIGN_STATIC || phase !== "cycle" || slides.length === 0) return;

    let cancelled = false;
    let finished = false;
    const urls = [
      ...new Set([
        ...slides.map((s) => s.src),
        ...preloadUrls.filter(Boolean),
      ]),
    ];

    const finish = async () => {
      if (cancelled || finished) return;
      finished = true;
      const elapsed = performance.now() - startedAt.current;
      const remaining = Math.max(0, MIN_CYCLE_MS - elapsed);
      if (remaining > 0) {
        await new Promise((r) => window.setTimeout(r, remaining));
      }
      if (!cancelled) setPhase("collapse");
    };

    const timeout = window.setTimeout(() => {
      void finish();
    }, MAX_WAIT_MS);

    void preloadImages(urls).then(() => {
      window.clearTimeout(timeout);
      void finish();
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
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
      {/* Hidden preload layer — warms cache for next/image on the page */}
      <div className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0">
        {preloadUrls.slice(0, 40).map((src) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={src} alt="" />
        ))}
      </div>

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
            {current?.src ? (
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
    </div>
  );
}
