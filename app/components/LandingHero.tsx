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
        <ul className="flex flex-col items-center gap-1 text-center md:gap-5">
          {categories.map((category) => (
            <li key={category._id}>
              <Link
                href={
                  category.slug
                    ? `/?category=${category.slug}#work`
                    : "/#work"
                }
                className="group text-3xl md:text-7xl lg:text-8xl xl:text-8xl font-medium uppercase tracking-tight text-neutral-400 transition-colors hover:text-black"
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
          className="mt-16 md:w-2/3 lg:w-1/2 text-center text-sm md:text-lg font-normal leading-[1.1] text-black [&_p]:leading-[inherit] [&_p]:mb-2"
        />
      ) : null}
    </div>
  );
}
