import type { Work } from "@/types/work";

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
