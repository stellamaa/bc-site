"use client";

import { useEffect, useState, type ReactNode } from "react";

export const SECTION_IDS = [
  "landing",
  "work",
  "talent",
  "about",
  "contact",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

function isSectionId(value: string): value is SectionId {
  return (SECTION_IDS as readonly string[]).includes(value);
}

type SectionPagerProps = {
  children: ReactNode;
};

/**
 * Desktop: one 100vh panel at a time, nav swaps panels (no page scroll).
 * Mobile: normal long-scroll document.
 */
export default function SectionPager({ children }: SectionPagerProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [active, setActive] = useState<SectionId>("landing");

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (isSectionId(hash)) setActive(hash);
  }, []);

  useEffect(() => {
    const onSection = (event: Event) => {
      const section = (event as CustomEvent<{ section?: string }>).detail
        ?.section;
      if (section && isSectionId(section)) setActive(section);
    };
    window.addEventListener("bc:section", onSection);
    return () => window.removeEventListener("bc:section", onSection);
  }, []);

  useEffect(() => {
    if (!isDesktop) {
      document.documentElement.classList.remove("desktop-section-pager");
      document.body.classList.remove("desktop-section-pager");
      return;
    }
    document.documentElement.classList.add("desktop-section-pager");
    document.body.classList.add("desktop-section-pager");
    return () => {
      document.documentElement.classList.remove("desktop-section-pager");
      document.body.classList.remove("desktop-section-pager");
    };
  }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop) return;

    const apply = () => {
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const on = id === active;
        el.dataset.active = on ? "true" : "false";
        el.setAttribute("aria-hidden", on ? "false" : "true");
      }
    };

    apply();
    const root = document.querySelector(".desktop-section-pager-root");
    if (!root) return;
    const mo = new MutationObserver(apply);
    mo.observe(root, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [active, isDesktop]);

  // Mobile: when leaving desktop pager, jump to the active section in the scroll doc
  useEffect(() => {
    if (isDesktop) return;
    const el = document.getElementById(active);
    if (!el) return;
    // Only adjust if hash matches active (avoid fighting first paint)
    const hash = window.location.hash.replace(/^#/, "");
    if (hash === active) {
      el.scrollIntoView({ block: "start" });
    }
  }, [isDesktop, active]);

  return (
    <div
      className={
        isDesktop
          ? "desktop-section-pager-root relative h-[calc(100dvh-6.5rem)] overflow-hidden"
          : undefined
      }
    >
      {children}
    </div>
  );
}
