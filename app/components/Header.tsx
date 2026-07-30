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
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        // Prefer contact when it's in view (nested inside about)
        const contactEntry = visible.find((e) => e.target.id === "contact");
        if (contactEntry && contactEntry.intersectionRatio > 0.4) {
          setActiveSection("contact");
          return;
        }

        const top = visible.find((e) => e.target.id !== "contact") ?? visible[0];
        if (top?.target.id) {
          setActiveSection(top.target.id as SectionId);
        }
      },
      { rootMargin: "-20% 0px -40% 0px", threshold: [0.1, 0.25, 0.4, 0.5] },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
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
    if (item.isLogo) return false;
    if (pathname === "/") {
      return item.section === activeSection;
    }
    return false;
  };

  return (
    <header
      className={`w-full px-4 md:px-8 py-4 md:py-6 bg-white ${className}`}
    >
      <nav className="flex items-center justify-between gap-2 md:gap-4 text-[11px] sm:text-xs md:text-base tracking-[0.08em] uppercase font-medium text-black">
        {navItems.map((item) => {
          const active = isActive(item);
          const label = item.isLogo
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
                item.isLogo
                  ? "font-medium text-base md:text-3xl lg:text-4xl tracking-normal"
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
