import Image from "next/image";
import AboutProfiles from "@/app/components/AboutProfiles";
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
    staff,
    featuredImage,
    featuredImageAlt,
  } = about;

  const staffList = staff ?? [];
  const hasStaff = staffList.length > 0;

  const bioClass =
    "min-w-0 text-xs font-normal leading-[1.15] whitespace-pre-line md:text-[0.8rem] lg:text-sm";

  return (
    <section
      id="about"
      className="scroll-mt-14 px-4 pt-4 pb-6 md:box-border md:flex md:h-[calc(100dvh-6.5rem)] md:max-h-[calc(100dvh-6.5rem)] md:scroll-mt-24 md:flex-col md:px-16 md:py-2 lg:px-24 lg:py-3"
    >
      <p className="mb-4 text-center text-[10px] font-bold tracking-wide uppercase md:hidden">
        (About us)
      </p>

      <div className="flex min-h-0 flex-1 flex-col md:overflow-y-auto">
        {description ? (
          <p className="mb-6 max-w-lg shrink-0 text-sm font-normal leading-tight whitespace-pre-line md:mb-3 md:text-sm lg:mb-4 lg:text-[0.95rem]">
            {description}
          </p>
        ) : null}

        <div className="grid min-h-0 flex-1 grid-cols-1 items-start gap-6 md:grid-cols-2 md:gap-8 lg:gap-12">
          <AboutProfiles profiles={profiles} />

          {hasStaff ? (
            <div className="flex flex-col gap-3 md:gap-3 lg:gap-3.5">
              {staffList.map((member) => (
                <div
                  key={member._key}
                  className={`flex flex-col gap-0.5 ${bioClass}`}
                >
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
          ) : featuredImage ? (
            <div className="relative hidden min-h-[12rem] w-full self-stretch overflow-hidden bg-neutral-100 md:block">
              <Image
                src={featuredImage}
                alt={featuredImageAlt || "BlankCo"}
                fill
                className="object-cover"
                sizes="50vw"
                loading="lazy"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
