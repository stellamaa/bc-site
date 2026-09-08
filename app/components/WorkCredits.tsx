"use client";

import Link from "next/link";
import { Fragment } from "react";
import { talentPath } from "@/lib/sharePaths";
import { openTalentSection } from "@/lib/talentNav";
import { getWorkCredits } from "@/lib/workCredits";
import type { Work } from "@/types/work";

type WorkCreditsProps = {
  work: Work;
  className?: string;
};

/**
 * Credit line where names with a Talent profile open the Talent section with
 * that talent highlighted. The href stays a real `/talent/<slug>` URL so
 * middle-click / share still work.
 */
export default function WorkCredits({ work, className = "" }: WorkCreditsProps) {
  const credits = getWorkCredits(work);
  if (credits.length === 0) return null;

  return (
    <p className={className}>
      {credits.map((credit, index) => (
        <Fragment key={`${credit.name}-${index}`}>
          {index > 0 ? ", " : null}
          {credit.slug ? (
            <Link
              href={talentPath(credit.slug)}
              className="underline-offset-2 transition-colors hover:text-black hover:underline"
              onClick={(event) => {
                event.stopPropagation();
                if (event.metaKey || event.ctrlKey || event.shiftKey) return;
                event.preventDefault();
                openTalentSection(credit.slug!);
              }}
            >
              {credit.name}
            </Link>
          ) : (
            credit.name
          )}
        </Fragment>
      ))}
    </p>
  );
}
