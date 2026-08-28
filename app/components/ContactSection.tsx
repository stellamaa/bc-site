type ContactSectionProps = {
  phone?: string | null;
  address?: string | null;
  email?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
};

function mapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address.replace(/\s+/g, " ").trim(),
  )}`;
}

const linkClass =
  "group text-3xl font-medium uppercase tracking-tight text-neutral-400 transition-colors hover:text-black md:text-7xl lg:text-8xl";

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
}: ContactSectionProps) {
  const hasLinks = Boolean(email || instagram || linkedin || phone || address);

  return (
    <section
      id="contact"
      className="flex min-h-dvh scroll-mt-14 flex-col items-center justify-center pb-25 md:justify-center px-4 py-16 md:scroll-mt-24 md:px-16 md:py-10 lg:px-24"
    >
      {!hasLinks ? (
        <div className="min-h-[40vh]" aria-hidden />
      ) : (
        <ul className="flex flex-col items-center gap-4 text-center md:gap-5">
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
          {address ? (
            <li>
              <a
                href={mapsUrl(address)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkClass} whitespace-pre-line`}
              >
                <span className="opacity-0 transition-opacity group-hover:opacity-100">
                  (
                </span>
                {address.trim()}
                <span className="opacity-0 transition-opacity group-hover:opacity-100">
                  )
                </span>
              </a>
            </li>
          ) : null}
        </ul>
      )}
    </section>
  );
}
