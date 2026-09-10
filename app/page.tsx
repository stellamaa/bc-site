import type { Metadata } from "next";
import HomeContent from "@/app/HomeContent";
import SiteJsonLd from "@/app/components/SiteJsonLd";
import { buildHomeMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildHomeMetadata();
}

export default function Home() {
  return (
    <>
      <SiteJsonLd />
      <HomeContent />
    </>
  );
}
