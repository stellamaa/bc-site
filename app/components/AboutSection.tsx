import Image from "next/image";
import type { About } from "@/types/about";

type AboutSectionProps = {
  about: About | null;
};

export default function AboutSection({ about }: AboutSectionProps) {
  if (!about) {
    return <section id="about" className="min-h-dvh scroll-mt-14 md:scroll-mt-24" />;
  }

  const {
    description,
    profiles = [],
    featuredImage,
    featuredImageAlt,
    phone,
    address,
    email,
    instagram,
    linkedin,
  } = about;

  const pillClass =
    "shrink-0 rounded-full bg-black px-5 py-0.7 text-center text-lg font-medium tracking-wide text-white uppercase transition-opacity hover:opacity-80 md:px-16 md:py-4 md:text-2xl";

  const pills = (
    <>
      {email ? (
        <a href={`mailto:${email}`} className={pillClass}>
          Email
        </a>
      ) : null}
      {instagram ? (
        <a
          href={instagram}
          target="_blank"
          rel="noopener noreferrer"
          className={pillClass}
        >
          Instagram
        </a>
      ) : null}
      {linkedin ? (
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={pillClass}
        >
          LinkedIn
        </a>
      ) : null}
    </>
  );

  return (
    <section
      id="about"
      className="scroll-mt-14 px-4 pt-4 pb-6 md:scroll-mt-24 md:px-8 md:pt-2 md:pb-8 lg:px-10 lg:pt-10 lg:pb-8"
    >
      <p className="mb-4 text-center text-[10px] font-medium tracking-wide uppercase md:hidden">
        (About us)
      </p>
      <div className="grid grid-cols-1 items-stretch gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
        <div className="flex flex-col gap-10 md:gap-12">
          {description ? (
            <p className="max-w-lg text-sm font-normal leading-tight whitespace-pre-line md:text-base">
              {description}
            </p>
          ) : null}

          {profiles.map((profile) => (
            <article key={profile._key} className="flex flex-col gap-3 md:gap-0">
              <div className="flex flex-row items-center gap-4 md:gap-6">
                {profile.image ? (
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden bg-neutral-100 md:h-36 md:w-36">
                    <Image
                      src={profile.image}
                      alt={profile.imageAlt || profile.name || "Profile"}
                      fill
                      className="object-cover grayscale"
                      sizes="144px"
                    />
                  </div>
                ) : (
                  <div className="h-28 w-28 shrink-0 bg-neutral-100 md:h-36 md:w-36" />
                )}
                {profile.bio ? (
                  <p className="min-w-0 flex-1 text-xs font-normal leading-normal whitespace-pre-line md:w-1/2 md:flex-none md:text-sm">
                    {profile.bio}
                  </p>
                ) : null}
              </div>
              {profile.name ? (
                <h2 className="text-lg font-medium md:text-xl lg:text-2xl md:mt-2">
                  ({profile.name})
                </h2>
              ) : null}
            </article>
          ))}

          {/* Address under last profile — ~gap-5, not the stack’s gap-12 */}
          <div
            id="contact"
            className="-mt-5 scroll-mt-24 space-y-1 text-sm font-normal md:-mt-7 md:text-base"
          >
            {phone ? <p>{phone}</p> : null}
            {address ? (
              <p className="whitespace-pre-line">{address}</p>
            ) : null}
          </div>
        </div>

        {/* Desktop: image matches left column height */}
        {featuredImage ? (
          <div className="relative hidden min-h-full w-full overflow-hidden bg-neutral-100 md:block">
            <Image
              src={featuredImage}
              alt={featuredImageAlt || "BlankCo"}
              fill
              className="object-cover"
              sizes="50vw"
            />
          </div>
        ) : null}
      </div>

      {/* Separate row below content — one row of pills */}
      <div className="mt-12 flex w-full flex-nowrap items-center justify-between md:mt-13 md:justify-center md:gap-10">
        {pills}
      </div>
    </section>
  );
}
