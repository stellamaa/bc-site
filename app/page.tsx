import type { Metadata } from "next";
import { Suspense } from "react";
import AboutSection from "@/app/components/AboutSection";
import Header from "@/app/components/Header";
import LandingHero from "@/app/components/LandingHero";
import PortableText from "@/app/components/PortableText";
import TalentSection from "@/app/components/TalentSection";
import WorkSection from "@/app/components/WorkSection";
import {
  getAbout,
  getCategories,
  getLandingPage,
  getTalents,
  getWorks,
} from "@/sanity/sanity-utils";

export const metadata: Metadata = {
  title: "BlankCo",
  description:
    "BlankCo represents exceptional Film Directors, Creative Directors, and AI Creatives.",
};

export default async function Home() {
  const [landing, landingCategories, workCategories, works, talents, about] =
    await Promise.all([
      getLandingPage(),
      getCategories({ forLanding: true }),
      getCategories({ forWork: true }),
      getWorks(),
      getTalents(),
      getAbout(),
    ]);

  const description = landing?.description ?? null;

  return (
    <main className="flex flex-col bg-white text-black">
      <section id="landing" className="scroll-mt-20 md:scroll-mt-24">
        <div className="md:hidden px-4 pt-6 pb-2">
          <h1 className="text-center text-3xl font-medium tracking-tight uppercase mb-6">
            BLANK C()
          </h1>
          {description && description.length > 0 ? (
            <PortableText
              value={description}
              className="mx-auto max-w-md text-center text-sm font-normal leading-relaxed text-black mb-2"
            />
          ) : null}
        </div>

        <div className="md:hidden sticky top-0 z-50 bg-white">
          <Header />
        </div>

        <LandingHero description={description} categories={landingCategories} />
      </section>

      <Suspense fallback={<div id="work" className="min-h-dvh" />}>
        <WorkSection categories={workCategories} works={works} />
      </Suspense>

      <TalentSection talents={talents} works={works} />

      <AboutSection about={about} />
    </main>
  );
}
