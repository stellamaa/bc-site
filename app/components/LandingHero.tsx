"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PortableTextBlock } from "sanity";
import PortableText from "@/app/components/PortableText";
import type { Category } from "@/types/category";

type LandingHeroProps = {
  description?: PortableTextBlock[] | null;
  categories: Category[];
};

export default function LandingHero({
  description,
  categories,
}: LandingHeroProps) {
  const router = useRouter();

  return (
    <section className="hidden md:flex flex-1 flex-col items-center justify-center px-8 pb-16 pt-10 min-h-[80vh]">
      {categories.length > 0 ? (
        <ul className="flex flex-col items-center gap-1 md:gap-5 text-center">
          {categories.map((category) => (
            <li key={category._id}>
              <Link
                href={
                  category.slug
                    ? `/?category=${category.slug}#work`
                    : "/#work"
                }
                className="group text-3xl lg:text-5xl xl:text-7xl font-medium uppercase tracking-tight text-neutral-400 transition-colors hover:text-black"
                onClick={(e) => {
                  if (!category.slug) return;
                  e.preventDefault();
                  router.push(`/?category=${category.slug}#work`, {
                    scroll: false,
                  });
                  requestAnimationFrame(() => {
                    document
                      .getElementById("work")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  });
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
          className="mt-16 w-full text-center text-sm md:text-base font-normal leading-[1.25] text-black [&_p]:leading-[inherit] [&_p]:mb-2"
        />
      ) : null}
    </section>
  );
}
