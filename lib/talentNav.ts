import { pushAppPath } from "@/lib/documentUrl";
import { talentPath } from "@/lib/sharePaths";

/** Fired with the slug to highlight in the Talent section. */
export const TALENT_SELECT_EVENT = "bc:talent";

export type TalentSelectDetail = { slug: string };

/**
 * Open a talent from anywhere on the page (e.g. a work credit) without a route
 * change: switch to the Talent section and highlight the talent.
 */
export function openTalentSection(slug: string) {
  pushAppPath(talentPath(slug), undefined, "");
  window.dispatchEvent(
    new CustomEvent("bc:section", { detail: { section: "talent" } }),
  );
  window.dispatchEvent(
    new CustomEvent<TalentSelectDetail>(TALENT_SELECT_EVENT, {
      detail: { slug },
    }),
  );
  if (!window.matchMedia("(min-width: 768px)").matches) {
    document
      .getElementById("talent")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
