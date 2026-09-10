import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION_FALLBACK,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  plainTextFromPortable,
  truncateMeta,
} from "@/lib/site";
import { getAbout, getLandingPage } from "@/sanity/sanity-utils";

/** Shared home metadata — used by `/` and as a fallback. */
export async function buildHomeMetadata() {
  const landing = await getLandingPage().catch(() => null);
  const fromSanity = plainTextFromPortable(landing?.description);
  const description = truncateMeta(fromSanity || SITE_DESCRIPTION_FALLBACK);

  return {
    title: { absolute: SITE_NAME },
    description,
    alternates: { canonical: absoluteUrl("/") },
    openGraph: {
      title: SITE_NAME,
      description,
      url: absoluteUrl("/"),
      siteName: SITE_NAME,
      locale: "en_GB",
      type: "website" as const,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: SITE_NAME,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}

/** Organization JSON-LD for the public site shell. */
export async function buildOrganizationJsonLd() {
  const about = await getAbout().catch(() => null);
  const sameAs = [about?.instagram, about?.linkedin].filter(
    (url): url is string => Boolean(url),
  );

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE.url,
    ...(about?.email ? { email: about.email } : {}),
    ...(about?.phone ? { telephone: about.phone } : {}),
    ...(about?.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: about.address.replace(/\s+/g, " ").trim(),
          },
        }
      : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}
