import Image from "next/image";
import AboutProfiles from "@/app/components/AboutProfiles";
import MobileContactAlign from "@/app/components/MobileContactAlign";
import type { About } from "@/types/about";

type AboutSectionProps = {
  about: About | null;
};

export default function AboutSection({ about }: AboutSectionProps) {
  if (!about) {
    return <section id="about" className="min-h-dvh scroll-mt-12 md:scroll-mt-20" />;
  }

  const {
    description,
    profiles = [],
    staff,
    featuredGif,
    featuredGifAlt,
    featuredImage,
    featuredImageAlt,
  } = about;

  const staffList = staff ?? [];
  const hasStaff = staffList.length > 0;
  const mediaUrl = featuredGif || featuredImage;
  const mediaAlt =
    (featuredGif ? featuredGifAlt : featuredImageAlt) || "BlankCo";
  const isGif = Boolean(featuredGif);
  const hasFeatured = Boolean(mediaUrl);

  const bioClass =
    "min-w-0 text-xs font-normal leading-[1.15] whitespace-pre-line md:text-[0.8rem] lg:text-sm";

  const staffBlock = hasStaff ? (
    <div className="flex flex-col gap-3 md:gap-3 lg:gap-3.5">
      {staffList.map((member) => (
        <div key={member._key} className={`flex flex-col gap-0.5 ${bioClass}`}>
          {member.name ? <p>({member.name})</p> : null}
          {member.title ? <p>{member.title}</p> : null}
          {member.email ? (
            <a
              href={`mailto:${member.email}`}
              className="transition-opacity hover:opacity-60"
            >
              {member.email}
            </a>
          ) : null}
          {member.phone ? (
            <a
              href={`tel:${member.phone.replace(/\s+/g, "")}`}
              className="transition-opacity hover:opacity-60"
            >
              {member.phone}
            </a>
          ) : null}
        </div>
      ))}
    </div>
  ) : null;

  return (
    <section
      id="about"
      className={`scroll-mt-12 px-4 pt-4 pb-6 md:relative md:box-border md:flex md:h-[calc(100dvh-5rem)] md:max-h-[calc(100dvh-5rem)] md:scroll-mt-20 md:flex-col md:overflow-hidden md:px-0 md:py-0 ${
        hasFeatured ? "" : "md:px-16 lg:px-24"
      }`}
    >
      <p className="mb-4 text-center text-[10px] font-bold tracking-wide uppercase md:hidden">
        (About us)
      </p>

      <div
        className={`flex min-h-0 flex-1 flex-col md:h-full ${
          hasFeatured ? "md:w-1/2 md:overflow-y-auto md:px-16 md:py-3 lg:px-24 lg:py-4" : "md:overflow-hidden"
        }`}
      >
        <MobileContactAlign className="w-full md:contents">
          {description ? (
            <p className="mb-6 shrink-0 text-sm font-normal leading-tight whitespace-pre-line md:mb-13 md:max-w-lg md:text-sm lg:mb-10 lg:text-[0.95rem]">
              {description}
            </p>
          ) : null}

          <div
            className={`grid min-h-0 flex-1 grid-cols-1 items-start gap-6 ${
              hasFeatured
                ? "md:grid-cols-1 md:gap-3"
                : "md:grid-cols-2 md:items-stretch md:gap-8 lg:gap-12"
            }`}
          >
            <div className="flex min-h-0 flex-col gap-6 md:gap-3 md:overflow-y-auto lg:gap-4">
              <AboutProfiles profiles={profiles} />
              {hasFeatured ? staffBlock : null}
            </div>

            {!hasFeatured ? staffBlock : null}
          </div>
        </MobileContactAlign>
      </div>

      {hasFeatured ? (
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 md:block">
          <Image
            src={mediaUrl!}
            alt={mediaAlt}
            fill
            className="object-cover"
            sizes="50vw"
            loading="lazy"
            // Preserve GIF animation (optimizer would flatten frames).
            unoptimized={isGif}
          />
        </div>
      ) : null}
    </section>
  );
}
