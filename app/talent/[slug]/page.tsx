import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomeContent from "@/app/HomeContent";
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
    if (!talent) return { title: "Talent · BlankCo" };
    return {
      title: talent.name ? `${talent.name} · BlankCo` : "Talent · BlankCo",
      description: talent.bio?.slice(0, 160) || undefined,
    };
  } catch {
    return { title: "Talent · BlankCo" };
  }
}

/** Shareable talent URL — same page as `/`, opened on the Talent section. */
export default async function TalentPage({ params }: PageProps) {
  const { slug } = await params;
  const talent = await getTalentBySlug(slug).catch(() => null);
  if (!talent) notFound();

  return <HomeContent talentSlug={slug} />;
}
