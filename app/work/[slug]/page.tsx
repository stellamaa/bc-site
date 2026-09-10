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
import { getWorkBySlug, getWorks } from "@/sanity/sanity-utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const works = await getWorks();
    return works
      .map((work) => work.slug)
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
    const work = await getWorkBySlug(slug);
    if (!work) {
      return {
        title: "Work",
        alternates: { canonical: absoluteUrl(`/work/${slug}`) },
      };
    }

    const title = work.title?.trim() || "Work";
    const description = truncateMeta(
      work.description?.trim() || SITE_DESCRIPTION_FALLBACK,
    );
    const url = absoluteUrl(`/work/${slug}`);
    const image = work.thumbnail
      ? {
          url: work.thumbnail,
          alt: work.thumbnailAlt || title,
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
    return { title: "Work" };
  }
}

/** Shareable work URL — same page as `/`, opened on the expanded project. */
export default async function WorkPage({ params }: PageProps) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug).catch(() => null);
  if (!work) notFound();

  return (
    <>
      <SiteJsonLd />
      <HomeContent workSlug={slug} />
    </>
  );
}
