import type { Work } from "@/types/work";

export type WorkCredit = {
  name: string;
  /** Set for people with a Talent profile, so the name can link to it. */
  slug?: string;
};

/** Talent (linkable) + one-off credit names, in display order. */
export function getWorkCredits(work: Work): WorkCredit[] {
  const fromTalent = (work.talent ?? [])
    .map((person) => ({
      name: person.name?.trim() ?? "",
      slug: person.slug ?? undefined,
    }))
    .filter((credit) => Boolean(credit.name));
  const extras = (work.additionalCredits ?? [])
    .map((name) => ({ name: name.trim() }))
    .filter((credit) => Boolean(credit.name));
  return [...fromTalent, ...extras];
}

/** Talent + one-off credit names for work cards / project expand. */
export function getWorkCreditNames(work: Work): string[] {
  const fromTalent = (work.talent ?? [])
    .map((person) => person.name?.trim())
    .filter((name): name is string => Boolean(name));
  const extras = (work.additionalCredits ?? [])
    .map((name) => name.trim())
    .filter(Boolean);
  return [...fromTalent, ...extras];
}

export function getWorkCreditLine(work: Work): string | null {
  const names = getWorkCreditNames(work);
  return names.length > 0 ? names.join(", ") : null;
}

/** Read `category` query values from the live URL (works with pushState). */
export function getCategorySlugsFromLocation(): string[] {
  if (typeof window === "undefined") return [];
  return new URLSearchParams(window.location.search).getAll("category");
}
