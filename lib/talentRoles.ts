import type { Talent } from "@/types/talent";
import type { Work } from "@/types/work";

export type TalentRole = "director" | "photographer";

export const TALENT_ROLES: { id: TalentRole; label: string; plural: string }[] =
  [
    { id: "director", label: "Director", plural: "Directors" },
    { id: "photographer", label: "Photographer", plural: "Photographers" },
  ];

/** Existing talents without the field stay in Director. */
export function isDirectorTalent(talent: Talent): boolean {
  return talent.isDirector !== false;
}

export function isPhotographerTalent(talent: Talent): boolean {
  return talent.isPhotographer === true;
}

export function talentInRole(talent: Talent, role: TalentRole): boolean {
  return role === "director"
    ? isDirectorTalent(talent)
    : isPhotographerTalent(talent);
}

export function defaultRoleForTalent(talent: Talent | null): TalentRole {
  if (talent && isPhotographerTalent(talent) && !isDirectorTalent(talent)) {
    return "photographer";
  }
  return "director";
}

export function isPhotographyWork(work: Work): boolean {
  return (work.categories ?? []).some((category) => {
    const slug = category.slug?.toLowerCase() ?? "";
    const title = category.title?.toLowerCase() ?? "";
    return slug.includes("photograph") || title.includes("photograph");
  });
}
