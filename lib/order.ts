/** Fisher–Yates shuffle (returns a new array). */
export function shuffleArray<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = next[i]!;
    next[i] = next[j]!;
    next[j] = tmp;
  }
  return next;
}

/** Sort by display name, A–Z (trimmed, case-insensitive). */
export function sortByNameAsc<T extends { name?: string | null }>(
  items: readonly T[],
): T[] {
  return [...items].sort((a, b) =>
    (a.name ?? "").trim().localeCompare((b.name ?? "").trim(), undefined, {
      sensitivity: "base",
      numeric: true,
    }),
  );
}

/**
 * Works shown under a talent profile.
 * Uses Talent.workOrder when set (Studio drag order of reverse-linked works),
 * then appends any other works that still reference this talent.
 */
export function getWorksForTalent<
  TWork extends { _id: string; talent?: { slug?: string | null }[] | null },
>(
  allWorks: readonly TWork[],
  talent: {
    slug?: string | null;
    workOrder?: { _id: string }[] | null;
  } | null,
): TWork[] {
  if (!talent?.slug) return [];

  const linked = allWorks.filter((work) =>
    (work.talent ?? []).some((t) => t.slug === talent.slug),
  );
  const order = (talent.workOrder ?? []).filter((ref) => Boolean(ref?._id));
  if (order.length === 0) return linked;

  const byId = new Map(allWorks.map((work) => [work._id, work]));
  const ordered: TWork[] = [];
  const used = new Set<string>();

  for (const ref of order) {
    const work = byId.get(ref._id);
    if (work) {
      ordered.push(work);
      used.add(work._id);
    }
  }

  for (const work of linked) {
    if (!used.has(work._id)) ordered.push(work);
  }

  return ordered;
}
