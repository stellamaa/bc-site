/**
 * Mark all Work → Talent references as weak so talents can be deleted
 * without unlinking every work first.
 *
 *   npx sanity exec scripts/weaken-talent-refs.mjs --with-user-token
 */

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const works = await client.fetch(
  `*[_type == "work" && count(talent[defined(_ref) && !(_weak == true)]) > 0]{
    _id,
    talent
  }`,
);

console.log(`Found ${works.length} works with strong talent refs`);

if (works.length === 0) {
  console.log("Nothing to update.");
  process.exit(0);
}

const BATCH = 50;
for (let i = 0; i < works.length; i += BATCH) {
  const slice = works.slice(i, i + BATCH);
  let tx = client.transaction();
  for (const work of slice) {
    const nextTalent = (work.talent || []).map((ref) =>
      ref?._ref
        ? {
            _type: "reference",
            _ref: ref._ref,
            _key: ref._key,
            _weak: true,
          }
        : ref,
    );
    tx = tx.patch(work._id, (p) => p.set({ talent: nextTalent }));
  }
  await tx.commit({ visibility: "async" });
  console.log(`Patched ${Math.min(i + BATCH, works.length)} / ${works.length}`);
}

console.log("Done. You can delete talents even while works still list them.");
