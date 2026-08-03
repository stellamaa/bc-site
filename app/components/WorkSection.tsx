"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ScrollTrack from "@/app/components/ScrollTrack";
import type { Category } from "@/types/category";
import type { Work } from "@/types/work";

type WorkSectionProps = {
  categories: Category[];
  works: Work[];
};

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

function chunkWorks<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
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
  const [isDesktop, setIsDesktop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedSlugs(categoryKey ? categoryKey.split(",") : []);
  }, [categoryKey]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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

  const canScroll = filteredWorks.length > 6;
  const scrollLayout = canScroll && isDesktop;
  const workPages = scrollLayout
    ? chunkWorks(filteredWorks, 6)
    : [filteredWorks];

  return (
    <section
      id="work"
      className="min-h-dvh scroll-mt-20 md:scroll-mt-24 px-4 pt-4 pb-16 md:pt-18 md:pr-8 md:pb-24 md:pl-16 lg:pl-24"
    >
      <div className="flex items-start gap-4 md:gap-16 lg:gap-24">
        <aside className="flex w-[42%] max-w-[11rem] shrink-0 flex-col items-center md:w-56 md:max-w-none">
          <p className="mb-5 w-full text-center text-[10px] font-medium uppercase tracking-[0.12em] md:text-xs">
            Work Menu
          </p>
          <ul className="flex w-full flex-col gap-4">
            {categories.map((category) => {
              if (!category.slug) return null;
              const selected = selectedSlugs.includes(category.slug);
              return (
                <li key={category._id}>
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.slug!)}
                    className={`w-full rounded-full border border-black px-5 py-2 text-center text-[10px] font-medium uppercase leading-tight tracking-wide transition-colors md:text-base ${
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

        <div className="min-w-0 flex-1">
          {filteredWorks.length === 0 ? (
            <div className="min-h-[40vh]" aria-hidden />
          ) : (
            <>
              <div
                ref={scrollLayout ? scrollRef : undefined}
                className={
                  scrollLayout
                    ? "work-works-scroll flex w-full snap-x snap-mandatory overflow-x-auto"
                    : undefined
                }
              >
                {workPages.map((page, pageIndex) => (
                  <ul
                    key={page[0]?._id ?? pageIndex}
                    className={
                      scrollLayout
                        ? "grid w-full shrink-0 snap-start grid-cols-3 gap-x-12 gap-y-14"
                        : "grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:gap-x-12 md:gap-y-14 lg:grid-cols-3"
                    }
                  >
                    {page.map((work, indexInPage) => {
                      const index = pageIndex * 6 + indexInPage;
                      const n = formatIndex(index);
                      return (
                        <li key={work._id} className="group min-w-0">
                          <div className="flex w-full flex-col gap-2 md:max-w-[9rem] lg:max-w-[9.5rem]">
                            <span className="text-sm font-light tabular-nums text-neutral-400 transition-colors md:text-lg md:group-hover:text-black lg:text-3xl">
                              <span className="hidden md:group-hover:inline">
                                (
                              </span>
                              {n}
                              <span className="hidden md:group-hover:inline">
                                )
                              </span>
                            </span>
                            {work.thumbnail ? (
                              <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
                                <Image
                                  src={work.thumbnail}
                                  alt={work.thumbnailAlt || work.title || "Work"}
                                  fill
                                  className="object-cover"
                                  sizes="160px"
                                />
                              </div>
                            ) : (
                              <div className="aspect-square w-full bg-neutral-100" />
                            )}
                            {work.description ? (
                              <div className="text-xs font-normal leading-snug text-black md:text-sm">
                                <p className="line-clamp-5">{work.description}</p>
                                <span className="font-medium">Read More</span>
                              </div>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ))}
              </div>
              <ScrollTrack
                scrollRef={scrollRef}
                visible={scrollLayout}
                itemCount={filteredWorks.length}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
