import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WorkDetailClient from "@/app/work/[slug]/WorkDetailClient";
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
    if (!work) return { title: "Work · BlankCo" };
    return {
      title: work.title ? `${work.title} · BlankCo` : "Work · BlankCo",
      description: work.description?.slice(0, 160) || undefined,
    };
  } catch {
    return { title: "Work · BlankCo" };
  }
}

export default async function WorkPage({ params }: PageProps) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug).catch(() => null);
  if (!work) notFound();

  return (
    <main className="flex flex-col bg-white text-black">
      <WorkDetailClient work={work} />
    </main>
  );
}
