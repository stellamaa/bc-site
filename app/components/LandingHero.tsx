"use client";

import Link from "next/link";
import type { PortableTextBlock } from "sanity";
import PortableText from "@/app/components/PortableText";
import { pushDocumentUrl } from "@/lib/documentUrl";
import type { Category } from "@/types/category";

type LandingHeroProps = {
  description?: PortableTextBlock[] | null;
  categories: Category[];
};

export default function LandingHero({
  description,
  categories,
}: LandingHeroProps) {
  return (
    <div className="hidden md:flex flex-1 flex-col items-center justify-center px-8 min-h-0">
      {categories.length > 0 ? (
        <ul className="flex flex-col items-center gap-1 text-center md:gap-[clamp(0.25rem,1.4vh,1.25rem)]">
          {categories.map((category) => (
            <li key={category._id}>
              <Link
                href={
                  category.slug
                    ? `/?category=${category.slug}#work`
                    : "/#work"
                }
                // Scales with the shorter of viewport height/width so the
                // links, copy and logo strip all fit on smaller laptops.
                className="group text-3xl md:text-[clamp(2.5rem,min(9.5vh,9.5vw),6rem)] md:leading-[1.05] font-medium uppercase tracking-tight text-neutral-400 transition-colors hover:text-black"
                onClick={(e) => {
                  if (!category.slug) return;
                  e.preventDefault();
                  // history + pathname keeps basePath; router.push same-path
                  // query updates are unreliable on static export (GitHub Pages).
                  pushDocumentUrl(
                    `category=${encodeURIComponent(category.slug)}`,
                    "work",
                  );
                  window.dispatchEvent(
                    new CustomEvent("bc:section", {
                      detail: { section: "work" },
                    }),
                  );
                  if (!window.matchMedia("(min-width: 768px)").matches) {
                    requestAnimationFrame(() => {
                      document
                        .getElementById("work")
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                    });
                  }
                }}
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                  (
                </span>
                {category.title}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                  )
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {description && description.length > 0 ? (
        <PortableText
          value={description}
          className="mt-8 md:mt-[clamp(1rem,3vh,2.5rem)] md:w-[62ch] lg:w-[75ch] text-center text-sm md:text-[clamp(0.875rem,1.9vh,1.125rem)] font-normal leading-[1.1] text-black [&_p]:leading-[inherit] [&_p]:mb-2"
        />
      ) : null}
    </div>
  );
}
