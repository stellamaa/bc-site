import type { NextConfig } from "next";

/** Set in the GitHub Pages workflow only — keeps local /admin Studio working. */
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(isGithubPages
    ? {
        output: "export" as const,
        // Project site: https://stellamaa.github.io/bc-site/
        basePath: "/bc-site",
        assetPrefix: "/bc-site",
        // Emits admin/index.html so /bc-site/admin/ resolves on GitHub Pages
        trailingSlash: true,
      }
    : {}),
  // Baked into the client bundle so Sanity Studio basePath matches Next basePath
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubPages ? "/bc-site" : "",
  },
  images: {
    unoptimized: isGithubPages,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
