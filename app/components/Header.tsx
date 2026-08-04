"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type SectionId = "landing" | "work" | "talent" | "about" | "contact";

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

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection(null);
      return;
    }

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    setActiveSection(isMobile ? "work" : "landing");

    const sectionIds: SectionId[] = [
      "landing",
      "work",
      "talent",
      "about",
      "contact",
    ];

    const updateActive = () => {
      const marker = window.innerHeight * 0.35;
      let current: SectionId = isMobile ? "work" : "landing";

      for (const id of sectionIds) {
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
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [pathname]);

  const onSectionClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, section: SectionId) => {
      if (pathname !== "/") {
        // Let the link navigate to /#section
        return;
      }
      e.preventDefault();
      window.history.replaceState(null, "", `/#${section}`);
      scrollToId(section);
      setActiveSection(section);
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
