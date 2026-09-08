"use client";

import { Suspense } from "react";
import TalentSection from "@/app/components/TalentSection";
import TalentSectionAlt from "@/app/components/TalentSectionAlt";
import type { TalentLayoutMode } from "@/lib/talentLayout";
import type { Talent } from "@/types/talent";
import type { Work } from "@/types/work";

type Props = {
  talents: Talent[];
  works: Work[];
  defaultLayout: TalentLayoutMode;
  /** Talent highlighted on load, from a `/talent/<slug>` URL. */
  initialSlug?: string;
};

/**
 * Keeps the original TalentSection intact and routes to the experimental
 * mobile overlay when enabled via env or ?talentLayout=overlay.
 */
export default function TalentSectionSwitch({
  talents,
  works,
  defaultLayout,
  initialSlug,
}: Props) {
  return (
    <Suspense
      fallback={
        <TalentSection
          talents={talents}
          works={works}
          initialSlug={initialSlug}
        />
      }
    >
      <TalentSectionAlt
        talents={talents}
        works={works}
        defaultLayout={defaultLayout}
        initialSlug={initialSlug}
      />
    </Suspense>
  );
}
