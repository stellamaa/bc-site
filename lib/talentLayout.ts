export type TalentLayoutMode = "default" | "overlay";

/**
 * Env default: NEXT_PUBLIC_TALENT_LAYOUT=overlay|default
 * On the experiment branch, page.tsx falls back to "overlay" when unset.
 */
export function getTalentLayoutFromEnv(): TalentLayoutMode {
  const value = process.env.NEXT_PUBLIC_TALENT_LAYOUT?.toLowerCase();
  if (value === "overlay") return "overlay";
  if (value === "default") return "default";
  return "default";
}

/** Query override: /?talentLayout=overlay#talent */
export function parseTalentLayoutParam(
  value: string | null | undefined,
): TalentLayoutMode | null {
  if (!value) return null;
  const v = value.toLowerCase();
  if (v === "overlay") return "overlay";
  if (v === "default") return "default";
  return null;
}
