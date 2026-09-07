import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TalentDetailClient from "@/app/talent/[slug]/TalentDetailClient";
import {
  getTalentBySlug,
  getTalents,
  getWorks,
} from "@/sanity/sanity-utils";

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

export default async function TalentPage({ params }: PageProps) {
  const { slug } = await params;
  const [talent, works] = await Promise.all([
    getTalentBySlug(slug).catch(() => null),
    getWorks().catch(() => [] as Awaited<ReturnType<typeof getWorks>>),
  ]);
  if (!talent) notFound();

  return (
    <main className="flex flex-col bg-white text-black">
      <TalentDetailClient talent={talent} works={works} />
    </main>
  );
}
