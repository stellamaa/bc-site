/**
 * Mark cross-links between Work and Talent as weak, so either document can be
 * deleted without unlinking the other side first.
 *
 *   Work → Talent      work.talent[]
 *   Talent → Work      talent.workOrder[]   (display order only)
 *
 *   npx sanity exec scripts/weaken-refs.mjs --with-user-token
 */

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const TARGETS = [
  { type: "work", field: "talent" },
  { type: "talent", field: "workOrder" },
];

const BATCH = 50;

function weaken(refs) {
  return (refs || []).map((ref) =>
    ref?._ref
      ? { _type: "reference", _ref: ref._ref, _key: ref._key, _weak: true }
      : ref,
  );
}

for (const { type, field } of TARGETS) {
  const docs = await client.fetch(
    `*[_type == $type && count(${field}[defined(_ref) && !(_weak == true)]) > 0]{
      _id,
      "refs": ${field}
    }`,
    { type },
  );

  console.log(`${type}.${field}: ${docs.length} document(s) with strong refs`);

  for (let i = 0; i < docs.length; i += BATCH) {
    const slice = docs.slice(i, i + BATCH);
    let tx = client.transaction();
    for (const doc of slice) {
      tx = tx.patch(doc._id, (p) => p.set({ [field]: weaken(doc.refs) }));
    }
    await tx.commit({ visibility: "async" });
    console.log(`  patched ${Math.min(i + BATCH, docs.length)} / ${docs.length}`);
  }
}

console.log("Done. Works and talents can now be deleted from either side.");
