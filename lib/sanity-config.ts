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

/**
 * Studio route basePath (hash history). Keep as `/admin` even on GitHub Pages —
 * Next.js already serves the app under `/bc-site`, and hash routing does not use
 * the browser pathname for workspace matching.
 */
export const studioBasePath = "/admin";
