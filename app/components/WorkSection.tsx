"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/types/category";
import type { Work } from "@/types/work";

type WorkSectionProps = {
  categories: Category[];
  works: Work[];
};

function formatIndex(index: number, active: boolean) {
  const n = String(index + 1).padStart(2, "0");
  return active ? `(${n})` : n;
}

export default function WorkSection({ categories, works }: WorkSectionProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const categoryParams = searchParams.getAll("category");
  const categoryKey = categoryParams.join(",");

  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(
    () => categoryParams,
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedSlugs(categoryKey ? categoryKey.split(",") : []);
  }, [categoryKey]);

  const updateCategoryParam = useCallback(
    (slugs: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("category");
      for (const slug of slugs) params.append("category", slug);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}#work` : `${pathname}#work`, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const toggleCategory = (slug: string) => {
    setSelectedSlugs((prev) => {
      const next = prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug];
      updateCategoryParam(next);
      return next;
    });
  };

  const filteredWorks = useMemo(() => {
    if (selectedSlugs.length === 0) return [];
    return works.filter((work) =>
      (work.categories ?? []).some(
        (cat) => cat.slug && selectedSlugs.includes(cat.slug),
      ),
    );
  }, [works, selectedSlugs]);

  return (
    <section
      id="work"
      className="min-h-dvh scroll-mt-20 md:scroll-mt-24 px-4 md:px-8 pb-16 md:pb-24 pt-4 md:pt-8"
    >
      <div className="flex gap-4 md:gap-10 lg:gap-14 items-start">
        <aside className="shrink-0 w-[42%] max-w-[11rem] md:w-44 md:max-w-none">
          <p className="text-[10px] md:text-xs font-medium uppercase tracking-[0.12em] mb-3">
            Work Menu
          </p>
          <ul className="flex flex-col gap-2">
            {categories.map((category) => {
              if (!category.slug) return null;
              const selected = selectedSlugs.includes(category.slug);
              return (
                <li key={category._id}>
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.slug!)}
                    className={`w-full rounded-full border border-black px-3 py-2 text-[10px] md:text-xs uppercase tracking-wide text-left leading-tight font-medium transition-colors ${
                      selected
                        ? "bg-black text-white"
                        : "bg-white text-black hover:bg-neutral-100"
                    }`}
                  >
                    {category.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="flex-1 min-w-0">
          {filteredWorks.length === 0 ? (
            <div className="min-h-[40vh]" aria-hidden />
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {filteredWorks.map((work, index) => {
                const active =
                  hoveredId === work._id ||
                  (hoveredId === null && index === 0);
                return (
                  <li
                    key={work._id}
                    className="flex flex-col gap-2"
                    onMouseEnter={() => setHoveredId(work._id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <span
                      className={`text-xs md:text-sm font-medium tabular-nums ${
                        active ? "text-black" : "text-neutral-400"
                      }`}
                    >
                      {formatIndex(index, active)}
                    </span>
                    {work.thumbnail ? (
                      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
                        <Image
                          src={work.thumbnail}
                          alt={work.thumbnailAlt || work.title || "Work"}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square w-full bg-neutral-100" />
                    )}
                    {work.description ? (
                      <p className="text-xs md:text-sm font-normal leading-snug text-black">
                        {work.description}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
