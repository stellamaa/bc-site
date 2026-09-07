"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import WorkExpand from "@/app/components/WorkExpand";
import { getWorksForTalent } from "@/lib/order";
import { workPath } from "@/lib/sharePaths";
import { getWorkOverlayLabel } from "@/lib/workMedia";
import type { Talent } from "@/types/talent";
import type { Work } from "@/types/work";

type TalentDetailClientProps = {
  talent: Talent;
  works: Work[];
};

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

export default function TalentDetailClient({
  talent,
  works,
}: TalentDetailClientProps) {
  const talentWorks = useMemo(
    () => getWorksForTalent(works, talent),
    [works, talent],
  );
  const [openWorkId, setOpenWorkId] = useState<string | null>(null);
  const openWork =
    talentWorks.find((work) => work._id === openWorkId) ?? null;

  return (
    <div className="px-4 pt-4 pb-16 md:px-8 md:pt-8 md:pr-8 md:pb-24 md:pl-16 lg:pl-24">
      <p className="mb-4 text-[10px] font-medium tracking-wide uppercase text-neutral-400 md:mb-6 md:text-xs">
        <Link href="/#talent" className="hover:text-black">
          (Talent)
        </Link>
      </p>

      <div className="flex flex-col gap-6 md:max-w-3xl">
        <div className="flex flex-row items-start gap-4 md:gap-8">
          <div className="relative size-[7rem] shrink-0 overflow-hidden bg-neutral-100 sm:size-24 md:size-[8.5rem] lg:size-36">
            {talent.image ? (
              <Image
                src={talent.image}
                alt={talent.imageAlt || talent.name || "Talent"}
                fill
                className="object-cover"
                sizes="144px"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            {talent.name ? (
              <h1 className="mb-1.5 text-sm font-medium tracking-tight uppercase md:text-xl lg:text-2xl">
                ({talent.name})
              </h1>
            ) : null}
            {talent.bio ? (
              <p className="whitespace-pre-line text-xs leading-[1.2] font-normal md:text-base">
                {talent.bio}
              </p>
            ) : null}
          </div>
        </div>

        {openWork ? (
          <WorkExpand
            work={openWork}
            onClose={() => setOpenWorkId(null)}
          />
        ) : null}

        {talentWorks.length > 0 ? (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 md:gap-x-8 md:gap-y-10 lg:grid-cols-4">
            {talentWorks.map((work, index) => {
              const n = formatIndex(index);
              const overlayLabel = getWorkOverlayLabel(work);
              const href = work.slug ? workPath(work.slug) : undefined;

              const card = (
                <>
                  <span className="text-xs font-medium tabular-nums text-black md:text-lg">
                    ({n})
                  </span>
                  <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
                    {work.thumbnail ? (
                      <Image
                        src={work.thumbnail}
                        alt={work.thumbnailAlt || work.title || "Work"}
                        fill
                        className="object-cover"
                        sizes="25vw"
                      />
                    ) : null}
                    {overlayLabel ? (
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-sm font-bold tracking-wide text-white uppercase drop-shadow">
                        {overlayLabel}
                      </span>
                    ) : null}
                  </div>
                  {work.title ? (
                    <p className="line-clamp-2 text-[10px] font-medium leading-snug md:text-xs">
                      {work.title}
                    </p>
                  ) : null}
                </>
              );

              return (
                <li key={work._id} className="min-w-0">
                  {href ? (
                    <Link
                      href={href}
                      className="flex w-full flex-col gap-2 text-left"
                    >
                      {card}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setOpenWorkId((prev) =>
                          prev === work._id ? null : work._id,
                        )
                      }
                      className="flex w-full flex-col gap-2 text-left"
                    >
                      {card}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
