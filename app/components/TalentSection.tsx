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

export default function TalentSection({ talents, works }: TalentSectionProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const showScrollTrack = isDesktop && talentWorks.length > 3;

  return (
    <section
      id="talent"
      className="min-h-dvh scroll-mt-20 md:scroll-mt-24 px-4 pt-4 pb-16 md:pt-8 md:pr-8 md:pb-24 md:pl-16 lg:pl-24"
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

        <div className="flex min-h-0 min-w-0 flex-1 flex-col md:min-h-[calc(100dvh-8.5rem)] md:pb-10 md:ml-15">
          {!selected ? (
            <div className="min-h-[40vh]" aria-hidden />
          ) : (
            <>
              {/* Profile: small square + name/bio */}
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:gap-6 md:gap-8">
                <div className="relative size-[7.5rem] shrink-0 overflow-hidden bg-neutral-100 md:size-[8.5rem] lg:size-36">
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

                <div className="min-w-0 md:ml-10 max-w-lg flex-1">
                  <h2 className="mb-3 text-lg font-medium tracking-tight uppercase md:mb-2 md:text-xl lg:text-2xl">
                    ({selected.name})
                  </h2>
                  {selected.bio ? (
                    <p className="text-[11px] leading-[1.55] font-normal whitespace-pre-line text-black md:text-base md:min-w-[100%]">
                      {selected.bio}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Works + scrollbar pinned toward bottom of the viewport */}
              {talentWorks.length > 0 ? (
                <div className="mt-5 md:mt-auto md:pt-0">
                  <div
                    ref={isDesktop ? scrollRef : undefined}
                    className={
                      isDesktop
                        ? "talent-works-scroll w-full overflow-x-auto [container-type:inline-size]"
                        : undefined
                    }
                  >
                    <ul
                      className={
                        isDesktop
                          ? "flex gap-x-12"
                          : "grid grid-cols-1 gap-8 sm:grid-cols-2"
                      }
                    >
                      {talentWorks.map((work, index) => (
                        <li
                          key={work._id}
                          className={
                            isDesktop ? "min-w-0 shrink-0" : "min-w-0"
                          }
                          style={
                            isDesktop
                              ? { width: "calc((100cqw - 6rem) / 3)" }
                              : undefined
                          }
                        >
                          <article className="flex w-full max-w-[8.5rem] flex-col gap-2 md:max-w-[9rem]">
                            <span className="text-xl font-light tabular-nums text-neutral-400 md:text-2xl lg:text-3xl">
                              {formatIndex(index)}
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
                                  sizes="144px"
                                />
                              </div>
                            ) : (
                              <div className="aspect-square w-full bg-neutral-100" />
                            )}
                            {work.title ? (
                              <h3 className="text-[11px] leading-snug font-medium md:text-xs">
                                {work.title}
                              </h3>
                            ) : null}
                            {work.description ? (
                              <div className="text-[11px] leading-snug font-normal text-black md:text-xs">
                                <p className="line-clamp-5">{work.description}</p>
                                <span className="font-medium">Read More</span>
                              </div>
                            ) : null}
                          </article>
                        </li>
                      ))}
                    </ul>
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
