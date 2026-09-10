import Image from "next/image";
import { Suspense } from "react";
import Logo from "@/app/logo.svg";
import AboutSection from "@/app/components/AboutSection";
import ClientsCarousel from "@/app/components/ClientsCarousel";
import ContactSection from "@/app/components/ContactSection";
import IntroLoader from "@/app/components/IntroLoader";
import LandingHero from "@/app/components/LandingHero";
import LandingMobileCopy from "@/app/components/LandingMobileCopy";
import SectionPager from "@/app/components/SectionPager";
import TalentSectionSwitch from "@/app/components/TalentSectionSwitch";
import WorkSectionSwitch from "@/app/components/WorkSectionSwitch";
import { collectIntroMedia } from "@/lib/introMedia";
import {
  getAbout,
  getCategories,
  getLandingPage,
  getLogos,
  getTalents,
  getWorks,
} from "@/sanity/sanity-utils";

type HomeContentProps = {
  /** `/talent/<slug>`: open the Talent section with this talent highlighted. */
  talentSlug?: string;
  /** `/work/<slug>`: open the Work section with this project expanded. */
  workSlug?: string;
};

/**
 * The whole single-page site. Rendered at `/`, `/talent/<slug>` and
 * `/work/<slug>`, so a shared link lands on the same page, on that section.
 */
export default async function HomeContent({
  talentSlug,
  workSlug,
}: HomeContentProps) {
  const [
    landing,
    landingCategories,
    workCategories,
    works,
    talents,
    about,
    logos,
  ] = await Promise.all([
    getLandingPage(),
    getCategories({ forLanding: true }),
    getCategories({ forWork: true }),
    getWorks(),
    getTalents(),
    getAbout(),
    getLogos(),
  ]);

  const description = landing?.description ?? null;
  const introMedia = collectIntroMedia(works);

  return (
    <main className="flex flex-col bg-white text-black">
      <IntroLoader media={introMedia} />

      <SectionPager
        initialSection={
          talentSlug ? "talent" : workSlug ? "work" : undefined
        }
      >
        <section
          id="landing"
          className="scroll-mt-12 md:scroll-mt-20 md:box-border md:flex md:h-dvh md:min-h-dvh md:-mt-20 md:flex-col md:pt-20"
        >
          <div className="px-4 pt-4 pb-2 md:hidden">
            <h1 className="mb-6 flex justify-center text-3xl">
              {/* 0.66em is the cap height of the text this replaced. */}
              <Image
                src={Logo}
                alt="Blank Co"
                className="h-[0.66em] w-auto"
                priority
                unoptimized
              />
            </h1>
            {description && description.length > 0 ? (
              <LandingMobileCopy description={description} />
            ) : null}
          </div>

          <LandingHero
            description={description}
            categories={landingCategories}
          />

          {/* Mobile shows the logos under Contact instead (see below). */}
          <ClientsCarousel logos={logos} className="mt-auto hidden md:block" />
        </section>

        <Suspense fallback={<div id="work" className="min-h-dvh" />}>
          <WorkSectionSwitch
            categories={workCategories}
            works={works}
            initialSlug={workSlug}
          />
        </Suspense>

        <TalentSectionSwitch
          talents={talents}
          works={works}
          initialSlug={talentSlug}
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
          // Mobile: logos close out the page, along the bottom of Contact.
          footer={
            <ClientsCarousel logos={logos} className="mt-auto md:hidden" />
          }
        />
      </SectionPager>
    </main>
  );
}
