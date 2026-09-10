import type { ReactNode } from "react";

type ContactSectionProps = {
  phone?: string | null;
  address?: string | null;
  email?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  /** Sits at the foot of the section — the client logos on mobile. */
  footer?: ReactNode;
};

function mapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address.replace(/\s+/g, " ").trim(),
  )}`;
}

const linkClass =
  "group text-3xl font-medium uppercase tracking-tight text-neutral-400 transition-colors hover:text-black md:text-[clamp(2.5rem,min(9.5vh,9.5vw),6rem)] md:leading-[1.05]";

function HoverLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      className={linkClass}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      <span className="opacity-0 transition-opacity group-hover:opacity-100">
        (
      </span>
      {label}
      <span className="opacity-0 transition-opacity group-hover:opacity-100">
        )
      </span>
    </a>
  );
}

export default function ContactSection({
  phone,
  address,
  email,
  instagram,
  linkedin,
  footer,
}: ContactSectionProps) {
  const hasLinks = Boolean(email || instagram || linkedin || phone || address);

  // Line one is the street; anything after it (the postcode) is mobile only.
  const addressLines = (address?.trim() || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const street = addressLines[0] || "";
  const postcode = addressLines.slice(1).join("\n");

  return (
    <section
      id="contact"
      // Mobile: the links start a quarter of the way down the screen and the
      // footer rides the bottom edge, so the page ends with it.
      className="flex min-h-dvh scroll-mt-12 flex-col items-center justify-start px-4 pt-[25dvh] pb-12 md:mt-20 md:justify-center md:scroll-mt-20 md:px-16 md:py-10 lg:px-24"
    >
      {!hasLinks ? (
        <div className="min-h-[40vh]" aria-hidden />
      ) : (
        <ul className="flex flex-col items-center gap-6 text-center md:gap-5">
          {email ? (
            <li>
              <HoverLink href={`mailto:${email}`} label="Email" />
            </li>
          ) : null}
          {instagram ? (
            <li>
              <HoverLink href={instagram} label="Instagram" external />
            </li>
          ) : null}
          {linkedin ? (
            <li>
              <HoverLink href={linkedin} label="LinkedIn" external />
            </li>
          ) : null}
          {phone ? (
            <li>
              <HoverLink
                href={`tel:${phone.replace(/\s+/g, "")}`}
                label={phone}
              />
            </li>
          ) : null}
          {street ? (
            <li>
              <a
                href={mapsUrl(address!)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkClass} whitespace-pre-line`}
              >
                <span className="opacity-0 transition-opacity group-hover:opacity-100">
                  (
                </span>
                {street}
                {postcode ? (
                  <span className="md:hidden">{`\n${postcode}`}</span>
                ) : null}
                <span className="opacity-0 transition-opacity group-hover:opacity-100">
                  )
                </span>
              </a>
            </li>
          ) : null}
        </ul>
      )}

      {footer}
    </section>
  );
}
