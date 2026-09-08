"use client";

import { Suspense } from "react";
import WorkSection from "@/app/components/WorkSection";
import WorkSectionAlt from "@/app/components/WorkSectionAlt";
import type { Category } from "@/types/category";
import type { Work } from "@/types/work";

type Props = {
  categories: Category[];
  works: Work[];
  /** Experiment: mobile category overlay */
  overlayEnabled?: boolean;
  /** Project expanded on load, from a `/work/<slug>` URL. */
  initialSlug?: string;
};

export default function WorkSectionSwitch({
  categories,
  works,
  overlayEnabled = true,
  initialSlug,
}: Props) {
  return (
    <Suspense
      fallback={
        <WorkSection
          categories={categories}
          works={works}
          initialSlug={initialSlug}
        />
      }
    >
      <WorkSectionAlt
        categories={categories}
        works={works}
        enabled={overlayEnabled}
        initialSlug={initialSlug}
      />
    </Suspense>
  );
}
