import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { getTalents, getWorks } from "@/sanity/sanity-utils";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [works, talents] = await Promise.all([
    getWorks().catch(() => []),
    getTalents().catch(() => []),
  ]);

  const workEntries: MetadataRoute.Sitemap = works
    .filter((work) => Boolean(work.slug))
    .map((work) => ({
      url: absoluteUrl(`/work/${work.slug}`),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  const talentEntries: MetadataRoute.Sitemap = talents
    .filter((talent) => Boolean(talent.slug))
    .map((talent) => ({
      url: absoluteUrl(`/talent/${talent.slug}`),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...workEntries,
    ...talentEntries,
  ];
}
