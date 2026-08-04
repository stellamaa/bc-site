"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ScrollTrack from "@/app/components/ScrollTrack";
import WorkExpand from "@/app/components/WorkExpand";
import { getWorkMediaKind } from "@/lib/workMedia";
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
  const [openWorkId, setOpenWorkId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const expandAnchorRef = useRef<HTMLDivElement>(null);

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
    setOpenWorkId(null);
  };

  const filteredWorks = useMemo(() => {
    if (selectedSlugs.length === 0) return [];
    return works.filter((work) =>
      (work.categories ?? []).some(
        (cat) => cat.slug && selectedSlugs.includes(cat.slug),
      ),
    );
  }, [works, selectedSlugs]);

  const openWork = useMemo(
    () => filteredWorks.find((work) => work._id === openWorkId) ?? null,
    [filteredWorks, openWorkId],
  );

  useEffect(() => {
    if (openWorkId && !filteredWorks.some((work) => work._id === openWorkId)) {
      setOpenWorkId(null);
    }
  }, [filteredWorks, openWorkId]);

  useEffect(() => {
    if (!openWork) return;
    expandAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [openWork?._id]);

  const closeWork = useCallback(() => setOpenWorkId(null), []);

  const selectWork = (workId: string) => {
    setOpenWorkId((prev) => (prev === workId ? null : workId));
  };

  const canScroll = filteredWorks.length > 6;
  /** Desktop + expanded: single-row strip so other projects stay reachable */
  const stripLayout = Boolean(openWork) && isDesktop;
  /** Desktop + closed: existing 3×2 paged scroll when there are enough works */
  const pageScrollLayout = !stripLayout && canScroll && isDesktop;
  const horizontalScroll = stripLayout || pageScrollLayout;
  const workPages = pageScrollLayout
    ? chunkWorks(filteredWorks, 6)
    : [filteredWorks];

  useEffect(() => {
    if (!stripLayout || !openWorkId) return;
    const root = scrollRef.current;
    if (!root) return;
    const card = root.querySelector<HTMLElement>(
      `[data-work-id="${openWorkId}"]`,
    );
    card?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [stripLayout, openWorkId]);

  return (
    <section
      id="work"
      className="min-h-dvh scroll-mt-14 px-4 pt-4 pb-16 md:scroll-mt-24 md:pt-18 md:pr-8 md:pb-24 md:pl-16 lg:pl-24"
    >
      {/*
        Mobile: expand spans full width above filters + grid.
        Desktop: expand sits in the content column above the grid (filters stay left).
      */}
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-0 md:gap-x-16 lg:gap-x-24">
        {openWork ? (
          <div
            ref={expandAnchorRef}
            className="col-span-2 row-start-1 scroll-mt-14 md:col-span-1 md:col-start-2 md:scroll-mt-24"
          >
            <WorkExpand work={openWork} onClose={closeWork} />
          </div>
        ) : (
          <div ref={expandAnchorRef} className="sr-only" aria-hidden />
        )}

        <aside
          className={`col-start-1 flex w-[42vw] max-w-[11rem] shrink-0 flex-col items-center md:w-56 md:max-w-none ${
            openWork
              ? "row-start-2 md:row-span-2 md:row-start-1"
              : "row-start-1"
          }`}
        >
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

        <div
          className={`col-start-2 min-w-0 ${openWork ? "row-start-2" : "row-start-1"}`}
        >
          {filteredWorks.length === 0 ? (
            <div className="min-h-[40vh]" aria-hidden />
          ) : (
            <>
              <div
                ref={horizontalScroll ? scrollRef : undefined}
                className={
                  stripLayout
                    ? "work-works-scroll flex w-full gap-x-10 overflow-x-auto"
                    : pageScrollLayout
                      ? "work-works-scroll flex w-full snap-x snap-mandatory overflow-x-auto"
                      : undefined
                }
              >
                {stripLayout ? (
                  <ul className="flex w-max flex-nowrap gap-x-10">
                    {filteredWorks.map((work, index) => {
                      const n = formatIndex(index);
                      const mediaKind = getWorkMediaKind(work);
                      const isOpen = openWorkId === work._id;
                      const overlayLabel =
                        mediaKind === "video"
                          ? "(PLAY)"
                          : mediaKind === "gallery"
                            ? "(VIEW MORE)"
                            : null;

                      return (
                        <li
                          key={work._id}
                          data-work-id={work._id}
                          className="group w-[9rem] shrink-0 lg:w-[9.5rem]"
                        >
                          <button
                            type="button"
                            onClick={() => selectWork(work._id)}
                            aria-expanded={isOpen}
                            className="flex w-full flex-col gap-2 text-left"
                          >
                            <span
                              className={`text-lg font-light tabular-nums transition-colors lg:text-3xl ${
                                isOpen
                                  ? "text-black"
                                  : "text-neutral-400 group-hover:text-black"
                              }`}
                            >
                              <span
                                className={
                                  isOpen ? "inline" : "hidden group-hover:inline"
                                }
                              >
                                (
                              </span>
                              {n}
                              <span
                                className={
                                  isOpen ? "inline" : "hidden group-hover:inline"
                                }
                              >
                                )
                              </span>
                            </span>
                            {work.thumbnail ? (
                              <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
                                <Image
                                  src={work.thumbnail}
                                  alt={
                                    work.thumbnailAlt || work.title || "Work"
                                  }
                                  fill
                                  className="object-cover"
                                  sizes="160px"
                                />
                                {overlayLabel ? (
                                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xl font-bold tracking-wide text-white uppercase drop-shadow">
                                    {overlayLabel}
                                  </span>
                                ) : null}
                              </div>
                            ) : (
                              <div className="aspect-square w-full bg-neutral-100" />
                            )}
                            {work.title ? (
                              <p className="line-clamp-2 text-xs font-medium leading-snug">
                                {work.title}
                              </p>
                            ) : work.description ? (
                              <p className="line-clamp-2 text-xs font-normal leading-snug">
                                {work.description}
                              </p>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  workPages.map((page, pageIndex) => (
                    <ul
                      key={page[0]?._id ?? pageIndex}
                      className={
                        pageScrollLayout
                          ? "grid w-full shrink-0 snap-start grid-cols-3 gap-x-12 gap-y-14"
                          : "grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:gap-x-12 md:gap-y-14 lg:grid-cols-3"
                      }
                    >
                      {page.map((work, indexInPage) => {
                        const index = pageIndex * 6 + indexInPage;
                        const n = formatIndex(index);
                        const mediaKind = getWorkMediaKind(work);
                        const isOpen = openWorkId === work._id;
                        const overlayLabel =
                          mediaKind === "video"
                            ? "(PLAY)"
                            : mediaKind === "gallery"
                              ? "(VIEW MORE)"
                              : null;

                        return (
                          <li key={work._id} className="group min-w-0">
                            <button
                              type="button"
                              onClick={() => selectWork(work._id)}
                              aria-expanded={isOpen}
                              className="flex w-full flex-col gap-2 text-left md:max-w-[9rem] lg:max-w-[9.5rem]"
                            >
                              <span
                                className={`text-sm font-light tabular-nums transition-colors md:text-lg lg:text-3xl ${
                                  isOpen
                                    ? "text-black"
                                    : "text-neutral-400 md:group-hover:text-black"
                                }`}
                              >
                                <span
                                  className={
                                    isOpen
                                      ? "inline"
                                      : "hidden md:group-hover:inline"
                                  }
                                >
                                  (
                                </span>
                                {n}
                                <span
                                  className={
                                    isOpen
                                      ? "inline"
                                      : "hidden md:group-hover:inline"
                                  }
                                >
                                  )
                                </span>
                              </span>
                              {work.thumbnail ? (
                                <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
                                  <Image
                                    src={work.thumbnail}
                                    alt={
                                      work.thumbnailAlt || work.title || "Work"
                                    }
                                    fill
                                    className="object-cover"
                                    sizes="160px"
                                  />
                                  {overlayLabel ? (
                                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xl font-bold tracking-wide text-white uppercase drop-shadow">
                                      {overlayLabel}
                                    </span>
                                  ) : null}
                                </div>
                              ) : (
                                <div className="aspect-square w-full bg-neutral-100" />
                              )}
                              {work.description ? (
                                <p className="line-clamp-5 text-xs font-normal leading-snug text-black md:text-sm">
                                  {work.description}
                                </p>
                              ) : null}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ))
                )}
              </div>
              <ScrollTrack
                scrollRef={scrollRef}
                visible={horizontalScroll}
                itemCount={filteredWorks.length}
                width={stripLayout ? "full" : "half"}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
