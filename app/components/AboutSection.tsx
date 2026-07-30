import Image from "next/image";
import type { About } from "@/types/about";

type AboutSectionProps = {
  about: About | null;
};

export default function AboutSection({ about }: AboutSectionProps) {
  if (!about) {
    return <section id="about" className="min-h-dvh scroll-mt-20 md:scroll-mt-24" />;
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

  const featured = featuredImage ? (
    <div className="relative w-full aspect-[3/4] md:aspect-auto md:min-h-[70vh] md:h-full overflow-hidden bg-neutral-100">
      <Image
        src={featuredImage}
        alt={featuredImageAlt || "BlankCo"}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  ) : null;

  return (
    <section
      id="about"
      className="min-h-dvh scroll-mt-20 md:scroll-mt-24 px-4 md:px-8 pb-16 md:pb-20 pt-4 md:pt-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 lg:gap-16 items-start">
        <div className="flex flex-col gap-10 md:gap-12">
          {description ? (
            <p className="text-sm md:text-base font-normal leading-relaxed whitespace-pre-line max-w-xl">
              {description}
            </p>
          ) : null}

          {profiles.map((profile) => (
            <article key={profile._key} className="flex flex-col gap-3">
              <div className="flex gap-4 md:gap-6 items-start">
                {profile.image ? (
                  <div className="relative w-28 h-28 md:w-36 md:h-36 shrink-0 overflow-hidden bg-neutral-100">
                    <Image
                      src={profile.image}
                      alt={profile.imageAlt || profile.name || "Profile"}
                      fill
                      className="object-cover grayscale"
                      sizes="144px"
                    />
                  </div>
                ) : (
                  <div className="w-28 h-28 md:w-36 md:h-36 shrink-0 bg-neutral-100" />
                )}
                {profile.bio ? (
                  <p className="text-xs md:text-sm font-normal leading-relaxed whitespace-pre-line pt-0.5">
                    {profile.bio}
                  </p>
                ) : null}
              </div>
              {profile.name ? (
                <h2 className="text-lg md:text-xl lg:text-2xl font-medium">
                  ({profile.name})
                </h2>
              ) : null}
            </article>
          ))}

          {/* Mobile: featured image before contact (staff empty for now) */}
          <div className="md:hidden">{featured}</div>

          <div
            id="contact"
            className="scroll-mt-24 space-y-1 text-sm md:text-base font-normal"
          >
            {phone ? <p>{phone}</p> : null}
            {address ? (
              <p className="whitespace-pre-line">{address}</p>
            ) : null}
          </div>
        </div>

        <div className="hidden md:block md:sticky md:top-24 self-start">
          {featured}
        </div>
      </div>

      <div className="mt-16 md:mt-24 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-stretch sm:items-center">
        {email ? (
          <a
            href={`mailto:${email}`}
            className="rounded-full bg-black text-white text-center uppercase font-medium tracking-wide text-sm md:text-base px-10 py-3 md:py-4 hover:opacity-80 transition-opacity"
          >
            Email
          </a>
        ) : null}
        {instagram ? (
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-black text-white text-center uppercase font-medium tracking-wide text-sm md:text-base px-10 py-3 md:py-4 hover:opacity-80 transition-opacity"
          >
            Instagram
          </a>
        ) : null}
        {linkedin ? (
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-black text-white text-center uppercase font-medium tracking-wide text-sm md:text-base px-10 py-3 md:py-4 hover:opacity-80 transition-opacity"
          >
            LinkedIn
          </a>
        ) : null}
      </div>
    </section>
  );
}
