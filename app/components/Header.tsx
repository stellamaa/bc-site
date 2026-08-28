"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  SECTION_IDS,
  type SectionId,
} from "@/app/components/SectionPager";
import { replaceDocumentUrl } from "@/lib/documentUrl";

const navItems = [
  { href: "/#about", label: "ABOUT US", section: "about" as const },
  { href: "/#work", label: "WORK", section: "work" as const },
  { href: "/#landing", label: "BC", isLogo: true, section: "landing" as const },
  { href: "/#talent", label: "TALENT", section: "talent" as const },
  { href: "/#contact", label: "CONTACT", section: "contact" as const },
] as const;

function scrollToId(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

type HeaderProps = {
  className?: string;
};

export default function Header({ className = "" }: HeaderProps) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection(null);
      return;
    }

    const hash = window.location.hash.replace(/^#/, "");
    if ((SECTION_IDS as readonly string[]).includes(hash)) {
      setActiveSection(hash as SectionId);
    } else {
      setActiveSection(isDesktop ? "landing" : "work");
    }

    const onSection = (event: Event) => {
      const section = (event as CustomEvent<{ section?: string }>).detail
        ?.section;
      if (section && (SECTION_IDS as readonly string[]).includes(section)) {
        setActiveSection(section as SectionId);
      }
    };
    window.addEventListener("bc:section", onSection);

    if (isDesktop) {
      return () => window.removeEventListener("bc:section", onSection);
    }

    const updateActive = () => {
      const marker = window.innerHeight * 0.35;
      let current: SectionId = "work";

      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= marker) {
          current = id;
        }
      }

      setActiveSection(current);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("bc:section", onSection);
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [pathname, isDesktop]);

  const onSectionClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, section: SectionId) => {
      if (pathname !== "/") {
        return;
      }
      e.preventDefault();
      replaceDocumentUrl("", section);
      setActiveSection(section);
      window.dispatchEvent(
        new CustomEvent("bc:section", { detail: { section } }),
      );
      // Desktop pager swaps panels; mobile still scrolls the long page.
      if (!window.matchMedia("(min-width: 768px)").matches) {
        scrollToId(section);
      }
    },
    [pathname],
  );

  if (pathname?.startsWith("/admin")) return null;

  const isActive = (item: (typeof navItems)[number]) => {
    if ("isLogo" in item && item.isLogo) return false;
    if (pathname === "/") {
      return item.section === activeSection;
    }
    return false;
  };

  return (
    <header
      className={`w-full px-4 py-4 md:px-16 md:py-6 lg:px-24 bg-white ${className}`}
    >
      <nav className="flex items-center justify-between gap-2 md:gap-4 text-[11px] sm:text-xs md:text-2xl tracking-[0.08em] uppercase font-bold text-black">
        {navItems.map((item) => {
          const isLogo = "isLogo" in item && item.isLogo;
          const active = isActive(item);
          const label = isLogo
            ? `(${item.label})`
            : active
              ? `(${item.label})`
              : item.label;

          return (
            <Link
              key={item.label}
              href={item.href}
              data-nav-section={item.section}
              onClick={(e) => onSectionClick(e, item.section)}
              className={
                isLogo
                  ? "font-medium text-base md:text-4xl lg:text-5xl tracking-normal"
                  : "hover:opacity-70 transition-opacity"
              }
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
