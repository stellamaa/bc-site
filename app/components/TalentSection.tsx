"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import ScrollTrack from "@/app/components/ScrollTrack";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const worksAnchorRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => talents.find((t) => t.slug === selectedSlug) ?? null,
    [talents, selectedSlug],
  );

  const talentWorks = useMemo(() => {
    if (!selectedSlug) return [];
    return works.filter((work) =>
      (work.talent ?? []).some((t) => t.slug === selectedSlug),
    );
  }, [works, selectedSlug]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    setBioExpanded(false);
  }, [selectedSlug]);

  // Mobile: 2×2 pages · Desktop: 1×3 pages
  const pageSize = isDesktop ? 3 : 4;
  const workPages = chunkItems(talentWorks, pageSize);
  const showScrollTrack = isDesktop && talentWorks.length > pageSize;

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
            Talent Menu
          </p>
          <ul className="flex w-full flex-col gap-4">
            {talents.map((talent) => {
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
                    className={`w-full rounded-full border border-black px-5 py-2 text-center text-[10px] font-medium leading-tight tracking-wide uppercase transition-colors md:text-base ${
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
              {/* Profile: image + name/bio (+ WORK BELOW on mobile) */}
              <div className="flex flex-row items-start gap-4 md:gap-8">
                <div className="relative pr-3 size-[7rem] shrink-0 overflow-hidden bg-neutral-100 sm:size-24 md:size-[8.5rem] lg:size-36">
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
                    <div className="text-[10px] leading-[1.2] font-normal text-black md:text-base">
                      <p
                        className={`whitespace-pre-line ${
                          bioExpanded
                            ? ""
                            : "line-clamp-4 md:line-clamp-none"
                        }`}
                      >
                        {selected.bio}
                      </p>
                      {selected.bio.length > 140 ? (
                        <button
                          type="button"
                          onClick={() => setBioExpanded((open) => !open)}
                          className="mt-1 font-medium md:hidden"
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
                <div ref={worksAnchorRef} className="mt-4 md:mt-auto md:pt-0">
                  <div
                    ref={scrollRef}
                    className="talent-works-scroll flex w-full snap-x snap-mandatory overflow-x-auto"
                  >
                    {workPages.map((page, pageIndex) => (
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
                          return (
                            <li key={work._id} className="min-w-0">
                              <article className="flex w-full flex-col gap-2 md:max-w-[9rem] md:gap-2">
                                <span className="text-xs font-medium tabular-nums text-black md:text-2xl md:font-light md:text-neutral-400 lg:text-3xl">
                                  <span className="md:hidden">({n})</span>
                                  <span className="hidden md:inline">{n}</span>
                                </span>
                                <div className="relative aspect-square size-[7rem] overflow-hidden bg-neutral-100">
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
                                  {/* Mobile play affordance */}
                                  <div className="absolute inset-0 flex items-center justify-center md:hidden">
                                    <span className="text-xl font-bold tracking-wide text-white uppercase drop-shadow">
                                      (PLAY)
                                    </span>
                                  </div>
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
                              </article>
                            </li>
                          );
                        })}
                      </ul>
                    ))}
                  </div>
                  <ScrollTrack
                    scrollRef={scrollRef}
                    visible={showScrollTrack}
                    itemCount={talentWorks.length}
                    width="full"
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
