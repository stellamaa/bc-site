"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
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

  return (
    <section
      id="talent"
      className="min-h-dvh scroll-mt-20 md:scroll-mt-24 px-4 md:px-8 pb-16 md:pb-24 pt-4 md:pt-8"
    >
      <div className="flex gap-4 md:gap-10 lg:gap-14 items-start">
        <aside className="shrink-0 w-[42%] max-w-[11rem] md:w-44 md:max-w-none">
          <p className="text-[10px] md:text-xs font-medium uppercase tracking-[0.12em] mb-3">
            Talent Menu
          </p>
          <ul className="flex flex-col gap-2">
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
                    className={`w-full rounded-full border border-black px-3 py-2 text-[10px] md:text-xs uppercase tracking-wide text-left leading-tight font-medium transition-colors ${
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

        <div className="flex-1 min-w-0">
          {!selected ? (
            <div className="min-h-[40vh]" aria-hidden />
          ) : (
            <div className="flex flex-col gap-10 md:gap-14">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">
                {selected.image ? (
                  <div className="relative aspect-square w-full max-w-md overflow-hidden bg-neutral-100">
                    <Image
                      src={selected.image}
                      alt={selected.imageAlt || selected.name || "Talent"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 90vw, 40vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-square w-full max-w-md bg-neutral-100" />
                )}

                <div>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-medium uppercase tracking-tight mb-4 md:mb-6">
                    ({selected.name})
                  </h2>
                  {selected.bio ? (
                    <p className="text-sm md:text-base font-normal leading-relaxed whitespace-pre-line">
                      {selected.bio}
                    </p>
                  ) : null}
                </div>
              </div>

              {talentWorks.length > 0 ? (
                <div
                  className="
                    flex flex-col gap-8
                    md:flex-row md:gap-10 md:overflow-x-auto md:pb-4
                    talent-works-scroll
                  "
                >
                  {talentWorks.map((work, index) => (
                    <article
                      key={work._id}
                      className="flex flex-col gap-2 w-full md:w-[280px] lg:w-[320px] md:shrink-0"
                    >
                      <span className="text-xs md:text-sm font-medium tabular-nums text-neutral-400">
                        {formatIndex(index)}
                      </span>
                      {work.thumbnail ? (
                        <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
                          <Image
                            src={work.thumbnail}
                            alt={work.thumbnailAlt || work.title || "Work"}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 90vw, 320px"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square w-full bg-neutral-100" />
                      )}
                      {work.title ? (
                        <h3 className="text-sm font-medium uppercase leading-snug">
                          {work.title}
                        </h3>
                      ) : null}
                      {work.description ? (
                        <p className="text-xs md:text-sm font-normal leading-snug text-black">
                          {work.description.length > 140
                            ? `${work.description.slice(0, 140).trimEnd()}… `
                            : `${work.description} `}
                          <span className="font-medium">Read More</span>
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
