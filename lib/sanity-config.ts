export const sanityProjectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  "w5usu9hl";

/** Local dev may override the dataset; production builds always use production. */
export const sanityDataset =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_SANITY_DATASET ||
      process.env.SANITY_DATASET ||
      "production"
    : "production";

export const sanityApiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ||
  process.env.SANITY_API_VERSION ||
  "2026-07-27";

/** Next.js basePath on GitHub Pages (e.g. `/bc-site`). Empty in local dev. */
export const nextBasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** Full Studio mount path — must include Next basePath on project Pages. */
export const studioBasePath = `${nextBasePath}/admin`.replace(/\/{2,}/g, "/");
