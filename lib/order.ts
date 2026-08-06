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
