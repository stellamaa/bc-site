import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomeContent from "@/app/HomeContent";
import SiteJsonLd from "@/app/components/SiteJsonLd";
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION_FALLBACK,
  SITE_NAME,
  absoluteUrl,
  truncateMeta,
} from "@/lib/site";
import { getTalentBySlug, getTalents } from "@/sanity/sanity-utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const talents = await getTalents();
    return talents
      .map((talent) => talent.slug)
      .filter((slug): slug is string => Boolean(slug))
      .map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const talent = await getTalentBySlug(slug);
    if (!talent) {
      return {
        title: "Talent",
        alternates: { canonical: absoluteUrl(`/talent/${slug}`) },
      };
    }

    const title = talent.name?.trim() || "Talent";
    const description = truncateMeta(
      talent.bio?.trim() || SITE_DESCRIPTION_FALLBACK,
    );
    const url = absoluteUrl(`/talent/${slug}`);
    const image = talent.image
      ? {
          url: talent.image,
          alt: talent.imageAlt || title,
        }
      : DEFAULT_OG_IMAGE;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title: `${title} · ${SITE_NAME}`,
        description,
        url,
        siteName: SITE_NAME,
        locale: "en_GB",
        type: "website",
        images: [image],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} · ${SITE_NAME}`,
        description,
        images: [image.url],
      },
    };
  } catch {
    return { title: "Talent" };
  }
}

/** Shareable talent URL — same page as `/`, opened on the Talent section. */
export default async function TalentPage({ params }: PageProps) {
  const { slug } = await params;
  const talent = await getTalentBySlug(slug).catch(() => null);
  if (!talent) notFound();

  return (
    <>
      <SiteJsonLd />
      <HomeContent talentSlug={slug} />
    </>
  );
}
