import type { Metadata } from "next";
import { Suspense } from "react";
import AboutSection from "@/app/components/AboutSection";
import ContactSection from "@/app/components/ContactSection";
import IntroLoader from "@/app/components/IntroLoader";
import LandingHero from "@/app/components/LandingHero";
import LandingMobileCopy from "@/app/components/LandingMobileCopy";
import SectionPager from "@/app/components/SectionPager";
import TalentSectionSwitch from "@/app/components/TalentSectionSwitch";
import WorkSectionSwitch from "@/app/components/WorkSectionSwitch";
import { collectIntroMedia, collectCriticalImageUrls } from "@/lib/introMedia";
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
  const preloadUrls = collectCriticalImageUrls(works);

  return (
    <main className="flex flex-col bg-white text-black">
      <IntroLoader media={introMedia} preloadUrls={preloadUrls} />

      <SectionPager>
        <section
          id="landing"
          className="scroll-mt-12 md:scroll-mt-20 md:box-border md:flex md:h-dvh md:min-h-dvh md:-mt-20 md:flex-col md:pt-20"
        >
          <div className="px-4 pt-4 pb-2 md:hidden">
            <h1 className="mb-6 text-center text-3xl font-medium tracking-tight uppercase">
              BLANK C()
            </h1>
            {description && description.length > 0 ? (
              <LandingMobileCopy description={description} />
            ) : null}
          </div>

          <LandingHero
            description={description}
            categories={landingCategories}
          />
        </section>

        <Suspense fallback={<div id="work" className="min-h-dvh" />}>
          <WorkSectionSwitch categories={workCategories} works={works} />
        </Suspense>

        <TalentSectionSwitch
          talents={talents}
          works={works}
          // Experiment branch: overlay on by default. Back to original: ?talentLayout=default
          defaultLayout="overlay"
        />

        <AboutSection about={about} />

        <ContactSection
          phone={about?.phone}
          address={about?.address}
          email={about?.email}
          instagram={about?.instagram}
          linkedin={about?.linkedin}
        />
      </SectionPager>
    </main>
  );
}
