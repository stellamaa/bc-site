import type { Metadata } from "next";
import { Suspense } from "react";
import AboutSection from "@/app/components/AboutSection";
import IntroLoader from "@/app/components/IntroLoader";
import LandingHero from "@/app/components/LandingHero";
import PortableText from "@/app/components/PortableText";
import TalentSection from "@/app/components/TalentSection";
import WorkSection from "@/app/components/WorkSection";
import { collectIntroMedia, collectSiteImageUrls } from "@/lib/introMedia";
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
  const introMedia = collectIntroMedia(works);
  const preloadUrls = collectSiteImageUrls(works, talents, about);

  return (
    <main className="flex flex-col bg-white text-black">
      <IntroLoader media={introMedia} preloadUrls={preloadUrls} />

      <section
        id="landing"
        className="scroll-mt-14 md:scroll-mt-24 md:box-border md:flex md:h-dvh md:min-h-dvh md:-mt-[6.5rem] md:flex-col md:pt-[6.5rem]"
      >
        <div className="px-4 pt-4 pb-2 md:hidden">
          <h1 className="mb-6 text-center text-3xl font-medium tracking-tight uppercase">
            BLANK C()
          </h1>
          {description && description.length > 0 ? (
            <PortableText
              value={description}
              className="mx-auto mb-2 max-w-md text-center text-sm font-normal leading-relaxed text-black"
            />
          ) : null}
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
