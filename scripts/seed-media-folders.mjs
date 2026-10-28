/**
 * Creates root Media plugin folders: Images + Videos.
 *
 * Usage:
 *   SANITY_AUTH_TOKEN=<editor-token> node scripts/seed-media-folders.mjs
 *
 * Create a token with Editor rights at https://www.sanity.io/manage
 */
import { createClient } from "@sanity/client";

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  "w5usu9hl";
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_DATASET ||
  "production";

const FOLDERS = [
  { _id: "media.folder.images", name: "Images" },
  { _id: "media.folder.videos", name: "Videos" },
];

const token = process.env.SANITY_AUTH_TOKEN || process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "Missing SANITY_AUTH_TOKEN (or SANITY_API_WRITE_TOKEN).\n" +
      "Create a token with Editor rights in manage.sanity.io, then:\n" +
      "  SANITY_AUTH_TOKEN=... node scripts/seed-media-folders.mjs",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2025-08-15",
  useCdn: false,
  token,
});

const existing = await client.fetch(`*[_type == "media.folder"]{_id, name}`);

const mutations = [];
for (const folder of FOLDERS) {
  const already = existing.find(
    (item) => item._id === folder._id || item.name === folder.name,
  );
  if (already) {
    console.log(`Skip ${folder.name} (exists as ${already._id})`);
    continue;
  }
  mutations.push({
    createIfNotExists: {
      _id: folder._id,
      _type: "media.folder",
      name: folder.name,
    },
  });
}

if (mutations.length === 0) {
  console.log("Images and Videos folders already exist.");
  process.exit(0);
}

const result = await client.mutate(mutations, { returnDocuments: true });
console.log(
  "Created:",
  result.map((doc) => `${doc.name} (${doc._id})`).join(", "),
);
