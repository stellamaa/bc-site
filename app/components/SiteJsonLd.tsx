import { buildOrganizationJsonLd } from "@/lib/seo";

/** Invisible to the design — Organization data for search engines only. */
export default async function SiteJsonLd() {
  const data = await buildOrganizationJsonLd();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
