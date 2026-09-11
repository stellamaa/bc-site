"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SECTION_IDS } from "@/app/components/SectionPager";
import { slugFromPathname } from "@/lib/sharePaths";

/** Home with no section hash and no /talent or /work share URL. */
export function shouldStartAtTop(): boolean {
  const hash = window.location.hash.replace(/^#/, "");
  if (
    hash &&
    hash !== "landing" &&
    (SECTION_IDS as readonly string[]).includes(hash)
  ) {
    return false;
  }
  const path = window.location.pathname;
  if (slugFromPathname(path, "talent") || slugFromPathname(path, "work")) {
    return false;
  }
  return true;
}

export function scrollWindowToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/**
 * Opening `/` should always land at the top. Browsers (especially mobile)
 * otherwise restore the last scroll position under the intro overlay.
 * Share URLs (`/#contact`, `/talent/<slug>`, `/work/<slug>`) still jump.
 */
export default function StartAtTop() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
      }
    } catch {
      // ignore
    }

    const goTop = () => {
      if (shouldStartAtTop()) scrollWindowToTop();
    };

    goTop();
    const raf = window.requestAnimationFrame(goTop);
    const t0 = window.setTimeout(goTop, 0);
    const t1 = window.setTimeout(goTop, 100);
    window.addEventListener("load", goTop);
    window.addEventListener("pageshow", goTop);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.removeEventListener("load", goTop);
      window.removeEventListener("pageshow", goTop);
    };
  }, [pathname]);

  return null;
}
