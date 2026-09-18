"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ScrollTrack from "@/app/components/ScrollTrack";
import WorkExpand from "@/app/components/WorkExpand";
import { pushAppPath, replaceAppPath } from "@/lib/documentUrl";
import { workThumbnailUrl } from "@/lib/mediaUrl";
import { getWorksForTalent, sortByNameAsc } from "@/lib/order";
import { talentPath, workPath } from "@/lib/sharePaths";
import {
  TALENT_SELECT_EVENT,
  type TalentSelectDetail,
} from "@/lib/talentNav";
import {
  TALENT_ROLES,
  defaultRoleForTalent,
  isPhotographyWork,
  talentInRole,
  type TalentRole,
} from "@/lib/talentRoles";
import { useWheelScrollX } from "@/lib/useWheelScrollX";
import { getWorkOverlayLabel } from "@/lib/workMedia";
import type { Talent } from "@/types/talent";
import type { Work } from "@/types/work";

type TalentSectionProps = {
  talents: Talent[];
  works: Work[];
  /** Talent highlighted on load, from a `/talent/<slug>` URL. */
  initialSlug?: string;
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

export default function TalentSection({
  talents,
  works,
  initialSlug,
}: TalentSectionProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    initialSlug ?? null,
  );
  const [openRole, setOpenRole] = useState<TalentRole | null>(null);
  const [viewRole, setViewRole] = useState<TalentRole>(() =>
    defaultRoleForTalent(
      talents.find((talent) => talent.slug === initialSlug) ?? null,
    ),
  );
  const [bioExpanded, setBioExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isXlDesktop, setIsXlDesktop] = useState(false);
  const [openWorkId, setOpenWorkId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const namesListRef = useRef<HTMLUListElement>(null);
  const worksAnchorRef = useRef<HTMLDivElement>(null);
  const expandAnchorRef = useRef<HTMLDivElement>(null);
  const [namesMaxHeight, setNamesMaxHeight] = useState<number | null>(null);

  const sortedTalents = useMemo(() => sortByNameAsc(talents), [talents]);
  const namedTalents = useMemo(
    () => sortedTalents.filter((t) => Boolean(t.slug)),
    [sortedTalents],
  );
  const roleTalents = useMemo(
    () =>
      openRole
        ? namedTalents.filter((talent) => talentInRole(talent, openRole))
        : [],
    [namedTalents, openRole],
  );
  const namesScroll = roleTalents.length > 11;

  const selected = useMemo(
    () => sortedTalents.find((t) => t.slug === selectedSlug) ?? null,
    [sortedTalents, selectedSlug],
  );

  const talentWorks = useMemo(() => {
    const linked = getWorksForTalent(works, selected);
    if (viewRole !== "photographer") return linked;
    return linked.filter(isPhotographyWork);
  }, [works, selected, viewRole]);

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
    const mq = window.matchMedia("(min-width: 1280px)");
    const update = () => setIsXlDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isDesktop || !openRole || roleTalents.length === 0) {
      setNamesMaxHeight(null);
      return;
    }

    const measure = () => {
      const list = namesListRef.current;
      if (!list) return;
      const items = list.querySelectorAll<HTMLElement>(":scope > li");
      if (items.length === 0) {
        setNamesMaxHeight(null);
        return;
      }

      const first = items[0];
      const gap = Number.parseFloat(getComputedStyle(list).rowGap) || 0;
      // Always the height of 11 names so photographer profiles match director.
      if (items.length > 11) {
        const previousScrollTop = list.scrollTop;
        list.scrollTop = 0;
        const next = items[11];
        setNamesMaxHeight(
          Math.round(
            next.getBoundingClientRect().top -
              first.getBoundingClientRect().top,
          ),
        );
        list.scrollTop = previousScrollTop;
        return;
      }

      setNamesMaxHeight(
        Math.round(first.getBoundingClientRect().height * 11 + gap * 10),
      );
    };

    const id = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    const list = namesListRef.current;
    const ro = list ? new ResizeObserver(measure) : null;
    if (list && ro) ro.observe(list);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
  }, [isDesktop, roleTalents.length, openRole]);

  useEffect(() => {
    setBioExpanded(false);
    setOpenWorkId(null);
  }, [selectedSlug]);

  // Leave Talent (nav or desktop pager): collapse names and clear the profile.
  useEffect(() => {
    const clearTalentView = () => {
      setSelectedSlug(null);
      setOpenRole(null);
      setOpenWorkId(null);
      setBioExpanded(false);
    };

    if (!initialSlug && window.location.hash !== "#talent") {
      clearTalentView();
    }

    const onSection = (event: Event) => {
      const section = (event as CustomEvent<{ section?: string }>).detail
        ?.section;
      if (section && section !== "talent") {
        clearTalentView();
      }
    };
    const onTalent = (event: Event) => {
      const slug = (event as CustomEvent<TalentSelectDetail>).detail?.slug;
      if (!slug) return;
      setOpenWorkId(null);
      setBioExpanded(false);
      setSelectedSlug(slug);
      const talent = talents.find((item) => item.slug === slug) ?? null;
      setViewRole(defaultRoleForTalent(talent));
    };
    window.addEventListener("bc:section", onSection);
    window.addEventListener(TALENT_SELECT_EVENT, onTalent);

    const sectionEl = sectionRef.current;
    const syncFromPager = () => {
      if (sectionEl?.getAttribute("data-active") === "false") {
        clearTalentView();
      }
    };
    syncFromPager();
    const observer = sectionEl
      ? new MutationObserver(syncFromPager)
      : null;
    if (sectionEl && observer) {
      observer.observe(sectionEl, {
        attributes: true,
        attributeFilter: ["data-active"],
      });
    }

    return () => {
      window.removeEventListener("bc:section", onSection);
      window.removeEventListener(TALENT_SELECT_EVENT, onTalent);
      observer?.disconnect();
    };
  }, [initialSlug, talents]);

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

  const closeWork = useCallback(() => {
    setOpenWorkId(null);
    if (selectedSlug) {
      pushAppPath(talentPath(selectedSlug));
    } else {
      replaceAppPath("/", undefined, "talent");
    }
  }, [selectedSlug]);

  const selectWork = (workId: string) => {
    setOpenWorkId((prev) => {
      const next = prev === workId ? null : workId;
      if (!next) {
        if (selectedSlug) pushAppPath(talentPath(selectedSlug));
        else replaceAppPath("/", undefined, "talent");
        return null;
      }
      const work = talentWorks.find((item) => item._id === workId);
      if (work?.slug) {
        pushAppPath(workPath(work.slug));
      }
      return next;
    });
  };

  /** Desktop: same single-row strip as under expanded work */
  const stripLayout = isDesktop;
  // Mobile: 2×2 pages · Desktop: continuous strip
  const pageSize = stripLayout ? talentWorks.length || 1 : 4;
  const workPages = stripLayout
    ? [talentWorks]
    : chunkItems(talentWorks, pageSize);
  const showScrollTrack = stripLayout && talentWorks.length > 5;

  // Wheel anywhere in the section scrolls this talent's works sideways
  useWheelScrollX({
    areaRef: sectionRef,
    scrollRef,
    enabled: stripLayout && talentWorks.length > 0,
  });

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
      ref={sectionRef}
      className="min-h-dvh scroll-mt-12 px-3 pt-3 pb-16 [--work-pt:clamp(1.25rem,calc(14dvh_-_48px),4.5rem)] md:scroll-mt-20 md:px-6 md:pt-[var(--work-pt)] md:pr-6 md:pb-10 md:pl-10 lg:px-8 lg:pr-8 lg:pb-16 lg:pl-16 xl:pb-24 xl:pl-24"
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-0 md:gap-x-8 lg:gap-x-16 xl:gap-x-24">
        <aside
          className={`col-start-1 flex w-[42%] max-w-[11rem] shrink-0 flex-col items-center md:w-56 md:max-w-none md:items-start ${
            openWork ? "md:row-start-1 md:row-span-2" : "row-start-1"
          }`}
        >
          <p className="mb-5 w-full text-center text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-400 md:w-56 md:text-xs">
            Talent
          </p>
          <ul className="flex w-full max-w-full flex-col gap-3 md:w-56 md:gap-4">
            {TALENT_ROLES.map((role) => {
              const open = openRole === role.id;
              return (
                <li key={role.id} className="w-full">
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => {
                      if (selectedSlug) {
                        setSelectedSlug(null);
                        setOpenWorkId(null);
                        setBioExpanded(false);
                        replaceAppPath("/", undefined, "talent");
                        setOpenRole(role.id);
                        return;
                      }
                      setOpenRole((prev) =>
                        prev === role.id ? null : role.id,
                      );
                    }}
                    className={`box-border w-full whitespace-nowrap rounded-full border border-black px-2.5 py-1.5 text-center text-[10px] font-medium uppercase leading-tight tracking-wide transition-colors md:px-5 md:py-2 md:text-base ${
                      open
                        ? "bg-black text-white"
                        : "bg-white text-black hover:bg-neutral-100"
                    }`}
                  >
                    {role.plural}
                  </button>
                </li>
              );
            })}
          </ul>
          {openRole ? (
            <div
              className={`relative mt-3 w-full md:mt-12 md:w-56 ${
                namesScroll ? "shrink-0" : "flex-1"
              }`}
            >
              <ul
                ref={namesListRef}
                className={`flex w-full flex-col gap-3 md:gap-4 ${
                  namesScroll
                    ? "talent-names-scroll md:overflow-y-auto"
                    : ""
                }`}
                style={
                  namesMaxHeight && namesScroll
                    ? {
                        height: namesMaxHeight,
                        maxHeight: namesMaxHeight,
                      }
                    : undefined
                }
              >
                {roleTalents.map((talent) => {
                  const active = selectedSlug === talent.slug;
                  return (
                    <li key={talent._id} className="w-full">
                      <button
                        type="button"
                        onClick={() => {
                          const next =
                            selectedSlug === talent.slug
                              ? null
                              : talent.slug!;
                          setSelectedSlug(next);
                          if (next) {
                            setViewRole(openRole);
                            pushAppPath(talentPath(next));
                          } else {
                            replaceAppPath("/", undefined, "talent");
                          }
                        }}
                        className={`box-border w-full overflow-hidden whitespace-nowrap rounded-full border border-black px-2.5 py-1.5 text-center text-[10px] font-medium uppercase leading-tight tracking-normal transition-colors md:px-4 md:py-2 md:text-base ${
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
              <div className="absolute top-0 bottom-0 left-full">
                <ScrollTrack
                  scrollRef={namesListRef}
                  visible={isDesktop && namesScroll}
                  itemCount={roleTalents.length}
                  orientation="vertical"
                />
              </div>
            </div>
          ) : null}
        </aside>

        <div className="col-start-2 flex min-h-0 min-w-0 flex-1 flex-col md:ml-15">
          {!selected ? (
            <div className="min-h-[40vh] md:min-h-0 md:flex-1" aria-hidden />
          ) : openWork ? (
            <div
              ref={expandAnchorRef}
              className="scroll-mt-12 md:scroll-mt-20"
            >
              <WorkExpand work={openWork} onClose={closeWork} />
              {talentWorks.length > 0 ? (
                <div ref={worksAnchorRef} className="md:mt-0 md:ml-8 lg:ml-12">
                  <div className="md:max-w-[calc(5*8rem+4*1.25rem)] lg:max-w-[calc(5*9rem+4*2rem)] xl:max-w-[calc(5*9.5rem+4*2.5rem)]">
                    <div
                      ref={scrollRef}
                      className="talent-works-scroll flex w-full gap-x-5 overflow-x-auto lg:gap-x-8 xl:gap-x-10"
                    >
                      <ul className="flex w-max flex-nowrap gap-x-5 lg:gap-x-8 xl:gap-x-10">
                        {talentWorks.map((work, index) => {
                          const n = formatIndex(index);
                          const isOpen = openWorkId === work._id;
                          const overlayLabel = getWorkOverlayLabel(work);

                          return (
                            <li
                              key={work._id}
                              data-work-id={work._id}
                              className="group w-[8rem] shrink-0 lg:w-[9rem] xl:w-[9.5rem]"
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
                                      src={workThumbnailUrl(work.thumbnail)!}
                                      alt={
                                        work.thumbnailAlt ||
                                        work.title ||
                                        "Work"
                                      }
                                      fill
                                      className="object-cover object-top"
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
                    </div>
                    <ScrollTrack
                      scrollRef={scrollRef}
                      visible={showScrollTrack}
                      itemCount={talentWorks.length}
                      width="full"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <div ref={expandAnchorRef} className="sr-only" aria-hidden />
              <div
                className="flex min-h-0 flex-col md:justify-start xl:justify-between"
                style={
                  namesMaxHeight && isXlDesktop
                    ? namesScroll
                      ? {
                          height: namesMaxHeight,
                          minHeight: namesMaxHeight,
                          maxHeight: namesMaxHeight,
                        }
                      : { minHeight: namesMaxHeight }
                    : undefined
                }
              >
                {/* Profile */}
                <div className="flex min-h-0 flex-row items-start gap-3 overflow-hidden md:gap-5 lg:gap-8">
                  <div className="relative size-[7rem] shrink-0 overflow-hidden bg-neutral-100 pr-3 sm:size-24 md:size-[7rem] lg:size-[8.5rem] xl:size-36">
                    {selected.image ? (
                      <Image
                        src={selected.image}
                        alt={selected.imageAlt || selected.name || "Talent"}
                        fill
                        className="object-contain object-top"
                        sizes="144px"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 max-w-lg flex-1 overflow-hidden md:ml-10">
                    <h2 className="mb-1.5 text-sm font-medium tracking-tight uppercase md:mb-2 md:text-xl lg:text-2xl">
                      <span className="md:hidden">{selected.name}</span>
                      <span className="hidden md:inline">
                        ({selected.name})
                      </span>
                    </h2>
                    {selected.bio ? (
                      <div className="flex flex-col items-start text-xs leading-[1.2] font-normal text-black md:text-base">
                        <p
                          className={`w-full whitespace-pre-line ${
                            bioExpanded
                              ? "talent-bio-scroll max-h-40 overflow-y-auto overscroll-contain md:max-h-52"
                              : "line-clamp-6"
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
                    className="mt-4 shrink-0 md:mt-4 lg:mt-6 xl:mt-auto"
                  >
                    <div className="md:max-w-[calc(5*8rem+4*1.25rem)] lg:max-w-[calc(5*9rem+4*2rem)] xl:max-w-[calc(5*9.5rem+4*2.5rem)]">
                      <div
                        ref={scrollRef}
                        className={
                          stripLayout
                            ? "talent-works-scroll flex w-full gap-x-5 overflow-x-auto lg:gap-x-8 xl:gap-x-10"
                            : "talent-works-scroll flex w-full snap-x snap-mandatory overflow-x-auto"
                        }
                      >
                        {stripLayout ? (
                          <ul className="flex w-max flex-nowrap gap-x-5 lg:gap-x-8 xl:gap-x-10">
                            {talentWorks.map((work, index) => {
                              const n = formatIndex(index);
                              const isOpen = openWorkId === work._id;
                              const overlayLabel = getWorkOverlayLabel(work);

                              return (
                                <li
                                  key={work._id}
                                  data-work-id={work._id}
                                  className="group relative w-[8rem] shrink-0 lg:w-[9rem] xl:w-[9.5rem]"
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
                                          src={workThumbnailUrl(work.thumbnail)!}
                                          alt={
                                            work.thumbnailAlt ||
                                            work.title ||
                                            "Work"
                                          }
                                          fill
                                          className="object-cover object-top"
                                          sizes="160px"
                                        />
                                      ) : null}
                                      {overlayLabel ? (
                                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-sm font-bold tracking-wide text-white uppercase drop-shadow md:text-xl">
                                          {overlayLabel}
                                        </span>
                                      ) : null}
                                    </div>
                                  </button>
                                  {work.title ? (
                                    <p className="pointer-events-none absolute top-full left-0 mt-2 line-clamp-2 w-full text-xs font-medium leading-snug">
                                      {work.title}
                                    </p>
                                  ) : null}
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          workPages.map((page, pageIndex) => (
                            <ul
                              key={page[0]?._id ?? pageIndex}
                              className="grid w-full shrink-0 snap-start grid-cols-2 gap-x-3 gap-y-5"
                            >
                              {page.map((work, indexInPage) => {
                                const index =
                                  pageIndex * pageSize + indexInPage;
                                const n = formatIndex(index);
                                const isOpen = openWorkId === work._id;
                                const overlayLabel = getWorkOverlayLabel(work);

                                return (
                                  <li key={work._id} className="group min-w-0">
                                    <button
                                      type="button"
                                      onClick={() => selectWork(work._id)}
                                      aria-expanded={isOpen}
                                      className="flex w-full flex-col gap-2 text-left"
                                    >
                                      <span className="text-xs font-medium tabular-nums text-black">
                                        ({n})
                                      </span>
                                      <div className="relative aspect-square size-[7rem] overflow-hidden bg-neutral-100">
                                        {work.thumbnail ? (
                                          <Image
                                            src={workThumbnailUrl(work.thumbnail)!}
                                            alt={
                                              work.thumbnailAlt ||
                                              work.title ||
                                              "Work"
                                            }
                                            fill
                                            className="object-cover object-top"
                                            sizes="40vw"
                                          />
                                        ) : null}
                                        {overlayLabel ? (
                                          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-sm font-bold tracking-wide text-white uppercase drop-shadow">
                                            {overlayLabel}
                                          </span>
                                        ) : null}
                                      </div>
                                      {work.description ? (
                                        <div className="text-[10px] leading-snug font-normal text-black">
                                          <p className="line-clamp-3">
                                            {work.description}
                                          </p>
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
                      {stripLayout ? (
                        <ScrollTrack
                          scrollRef={scrollRef}
                          visible={showScrollTrack}
                          itemCount={talentWorks.length}
                          width="full"
                        />
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
