"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ScrollTrack from "@/app/components/ScrollTrack";
import WorkExpand from "@/app/components/WorkExpand";
import { sortByNameAsc } from "@/lib/order";
import { getWorkMediaKind } from "@/lib/workMedia";
import type { Talent } from "@/types/talent";
import type { Work } from "@/types/work";

type TalentSectionProps = {
  talents: Talent[];
  works: Work[];
};

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

function chunkItems<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

export default function TalentSection({ talents, works }: TalentSectionProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [openWorkId, setOpenWorkId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const worksAnchorRef = useRef<HTMLDivElement>(null);
  const expandAnchorRef = useRef<HTMLDivElement>(null);

  const sortedTalents = useMemo(() => sortByNameAsc(talents), [talents]);

  const selected = useMemo(
    () => sortedTalents.find((t) => t.slug === selectedSlug) ?? null,
    [sortedTalents, selectedSlug],
  );

  const talentWorks = useMemo(() => {
    if (!selectedSlug) return [];
    return works.filter((work) =>
      (work.talent ?? []).some((t) => t.slug === selectedSlug),
    );
  }, [works, selectedSlug]);

  const openWork = useMemo(
    () => talentWorks.find((work) => work._id === openWorkId) ?? null,
    [talentWorks, openWorkId],
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    setBioExpanded(false);
    setOpenWorkId(null);
  }, [selectedSlug]);

  // Clear selection when navigating away (e.g. BC) or on non-talent loads
  useEffect(() => {
    const clearSelection = () => {
      setSelectedSlug(null);
      setOpenWorkId(null);
      setBioExpanded(false);
    };

    if (window.location.hash !== "#talent") {
      clearSelection();
    }

    const onSection = (event: Event) => {
      const section = (event as CustomEvent<{ section?: string }>).detail
        ?.section;
      if (section && section !== "talent") {
        clearSelection();
      }
    };
    window.addEventListener("bc:section", onSection);
    return () => window.removeEventListener("bc:section", onSection);
  }, []);

  useEffect(() => {
    if (openWorkId && !talentWorks.some((work) => work._id === openWorkId)) {
      setOpenWorkId(null);
    }
  }, [talentWorks, openWorkId]);

  useEffect(() => {
    if (!openWork) return;
    if (isDesktop) {
      document.getElementById("talent")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }
    expandAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [openWork?._id, isDesktop]);

  const closeWork = useCallback(() => setOpenWorkId(null), []);

  const selectWork = (workId: string) => {
    setOpenWorkId((prev) => (prev === workId ? null : workId));
  };

  /** Desktop + expanded: single-row strip under the media */
  const stripLayout = Boolean(openWork) && isDesktop;
  // Mobile: 2×2 pages · Desktop closed: 1×3 pages
  const pageSize = stripLayout ? talentWorks.length || 1 : isDesktop ? 3 : 4;
  const workPages = stripLayout
    ? [talentWorks]
    : chunkItems(talentWorks, pageSize);
  const showScrollTrack =
    (stripLayout && talentWorks.length > 3) ||
    (!stripLayout && isDesktop && talentWorks.length > 3);

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

  const scrollToWorks = () => {
    worksAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };

  return (
    <section
      id="talent"
      className="min-h-dvh scroll-mt-14 px-3 pt-3 pb-16 md:scroll-mt-24 md:px-8 md:pt-8 md:pr-8 md:pb-24 md:pl-16 lg:pl-24"
    >
      <div className="flex items-start gap-4 md:gap-16 lg:gap-24">
        <aside className="flex w-[42%] max-w-[11rem] shrink-0 flex-col items-center md:w-56 md:max-w-none">
          <p className="mb-5 w-full text-center text-[10px] font-medium tracking-[0.12em] uppercase md:text-xs">
            Talent
          </p>
          <ul className="flex w-full flex-col gap-4">
            {sortedTalents.map((talent) => {
              if (!talent.slug) return null;
              const active = selectedSlug === talent.slug;
              return (
                <li key={talent._id}>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedSlug((prev) =>
                        prev === talent.slug ? null : talent.slug!,
                      )
                    }
                    className={`w-full rounded-full border border-black px-5 py-2 text-center text-[10px] font-medium leading-tight  uppercase transition-colors md:text-base ${
                      active
                        ? "bg-black text-white"
                        : "bg-white text-black hover:bg-neutral-100"
                    }`}
                  >
                    {talent.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col md:min-h-[calc(100dvh-8.5rem)] md:ml-15 md:pb-10">
          {!selected ? (
            <div className="min-h-[40vh]" aria-hidden />
          ) : (
            <>
              {openWork ? (
                <div
                  ref={expandAnchorRef}
                  className="scroll-mt-14 md:-mt-6 md:scroll-mt-24 lg:-mt-10"
                >
                  <WorkExpand work={openWork} onClose={closeWork} />
                </div>
              ) : (
                <div ref={expandAnchorRef} className="sr-only" aria-hidden />
              )}

              {/* Profile — hide on desktop while a project is expanded */}
              <div
                className={`flex flex-row items-start gap-4 md:mt-15 md:gap-8 ${
                  openWork ? "md:hidden" : ""
                }`}
              >
                <div className="relative size-[7rem] shrink-0 overflow-hidden bg-neutral-100 pr-3 sm:size-24 md:size-[8.5rem] lg:size-36">
                  {selected.image ? (
                    <Image
                      src={selected.image}
                      alt={selected.imageAlt || selected.name || "Talent"}
                      fill
                      className="object-cover"
                      sizes="144px"
                    />
                  ) : null}
                </div>

                <div className="min-w-0 max-w-lg flex-1 md:ml-10">
                  <h2 className="mb-1.5 text-sm font-medium tracking-tight uppercase md:mb-2 md:text-xl lg:text-2xl">
                    <span className="md:hidden">{selected.name}</span>
                    <span className="hidden md:inline">({selected.name})</span>
                  </h2>
                  {selected.bio ? (
                    <div className="text-xs leading-[1.2] font-normal text-black md:text-base">
                      <p
                        className={`whitespace-pre-line ${
                          bioExpanded ? "" : "line-clamp-6"
                        }`}
                      >
                        {selected.bio}
                      </p>
                      {selected.bio.length > 140 ? (
                        <button
                          type="button"
                          onClick={() => setBioExpanded((open) => !open)}
                          className="mt-1 font-medium"
                        >
                          {bioExpanded ? "Read less" : "Read more"}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                  {talentWorks.length > 0 ? (
                    <button
                      type="button"
                      onClick={scrollToWorks}
                      className="mt-2 text-[10px] font-medium tracking-wide uppercase md:hidden"
                    >
                      (WORK BELOW)
                    </button>
                  ) : null}
                </div>
              </div>

              {talentWorks.length > 0 ? (
                <div
                  ref={worksAnchorRef}
                  className={`mt-4 md:pt-0 ${
                    openWork
                      ? "md:mt-0 md:pl-12"
                      : "md:mt-auto md:mb-10 lg:mb-14"
                  }`}
                >
                  <div
                    ref={scrollRef}
                    className={
                      stripLayout
                        ? "talent-works-scroll flex w-full gap-x-10 overflow-x-auto"
                        : "talent-works-scroll flex w-full snap-x snap-mandatory overflow-x-auto"
                    }
                  >
                    {stripLayout ? (
                      <ul className="flex w-max flex-nowrap gap-x-10">
                        {talentWorks.map((work, index) => {
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
                                      isOpen
                                        ? "inline"
                                        : "hidden group-hover:inline"
                                    }
                                  >
                                    (
                                  </span>
                                  {n}
                                  <span
                                    className={
                                      isOpen
                                        ? "inline"
                                        : "hidden group-hover:inline"
                                    }
                                  >
                                    )
                                  </span>
                                </span>
                                <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
                                  {work.thumbnail ? (
                                    <Image
                                      src={work.thumbnail}
                                      alt={
                                        work.thumbnailAlt ||
                                        work.title ||
                                        "Work"
                                      }
                                      fill
                                      className="object-cover"
                                      sizes="160px"
                                    />
                                  ) : null}
                                  {overlayLabel ? (
                                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-sm font-bold tracking-wide text-white uppercase drop-shadow md:text-xl">
                                      {overlayLabel}
                                    </span>
                                  ) : null}
                                </div>
                                {work.title ? (
                                  <p className="line-clamp-2 text-xs font-medium leading-snug">
                                    {work.title}
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
                            isDesktop
                              ? "grid w-full shrink-0 snap-start grid-cols-3 gap-x-12"
                              : "grid w-full shrink-0 snap-start grid-cols-2 gap-x-3 gap-y-5"
                          }
                        >
                          {page.map((work, indexInPage) => {
                            const index = pageIndex * pageSize + indexInPage;
                            const n = formatIndex(index);
                            const isOpen = openWorkId === work._id;
                            const mediaKind = getWorkMediaKind(work);
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
                                  className="flex w-full flex-col gap-2 text-left md:max-w-[9rem]"
                                >
                                  <span
                                    className={`text-xs font-medium tabular-nums transition-colors md:text-2xl md:font-light lg:text-3xl ${
                                      isOpen
                                        ? "text-black"
                                        : "text-black md:text-neutral-400 md:group-hover:text-black"
                                    }`}
                                  >
                                    <span className="md:hidden">({n})</span>
                                    <span className="hidden md:inline">
                                      <span
                                        className={
                                          isOpen
                                            ? "inline"
                                            : "hidden group-hover:inline"
                                        }
                                      >
                                        (
                                      </span>
                                      {n}
                                      <span
                                        className={
                                          isOpen
                                            ? "inline"
                                            : "hidden group-hover:inline"
                                        }
                                      >
                                        )
                                      </span>
                                    </span>
                                  </span>
                                  <div className="relative aspect-square size-[7rem] overflow-hidden bg-neutral-100 md:w-full">
                                    {work.thumbnail ? (
                                      <Image
                                        src={work.thumbnail}
                                        alt={
                                          work.thumbnailAlt ||
                                          work.title ||
                                          "Work"
                                        }
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 40vw, 144px"
                                      />
                                    ) : null}
                                    {overlayLabel ? (
                                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-sm font-bold tracking-wide text-white uppercase drop-shadow md:text-xl">
                                        {overlayLabel}
                                      </span>
                                    ) : null}
                                  </div>
                                  {work.title ? (
                                    <h3 className="hidden text-xs leading-snug font-medium md:block">
                                      {work.title}
                                    </h3>
                                  ) : null}
                                  {work.description ? (
                                    <div className="text-[10px] leading-snug font-normal text-black md:text-xs">
                                      <p className="line-clamp-3 md:line-clamp-5">
                                        {work.description}
                                      </p>
                                      <span className="hidden font-medium md:inline">
                                        Read More
                                      </span>
                                    </div>
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
                    visible={showScrollTrack}
                    itemCount={talentWorks.length}
                    width="half"
                  />
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
