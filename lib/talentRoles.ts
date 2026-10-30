import type { Talent } from "@/types/talent";
import type { Work } from "@/types/work";

export type TalentRole = "director" | "photographer" | "emerging";

export const TALENT_ROLES: { id: TalentRole; label: string; plural: string }[] =
  [
    { id: "director", label: "Director", plural: "Directors" },
    { id: "photographer", label: "Photographer", plural: "Photographers" },
    { id: "emerging", label: "Emerging Talent", plural: "Emerging Talent" },
  ];

/** Existing talents without the field stay in Director. */
export function isDirectorTalent(talent: Talent): boolean {
  return talent.isDirector !== false;
}

export function isPhotographerTalent(talent: Talent): boolean {
  return talent.isPhotographer === true;
}

export function isEmergingTalent(talent: Talent): boolean {
  return talent.isEmergingTalent === true;
}

export function talentInRole(talent: Talent, role: TalentRole): boolean {
  if (role === "director") return isDirectorTalent(talent);
  if (role === "photographer") return isPhotographerTalent(talent);
  return isEmergingTalent(talent);
}

export function defaultRoleForTalent(talent: Talent | null): TalentRole {
  if (!talent) return "director";
  if (isDirectorTalent(talent)) return "director";
  if (isPhotographerTalent(talent)) return "photographer";
  if (isEmergingTalent(talent)) return "emerging";
  return "director";
}

export function isPhotographyWork(work: Work): boolean {
  return (work.categories ?? []).some((category) => {
    const slug = category.slug?.toLowerCase() ?? "";
    const title = category.title?.toLowerCase() ?? "";
    return slug.includes("photograph") || title.includes("photograph");
  });
}
