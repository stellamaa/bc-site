import type { Metadata } from "next";
import localFont from "next/font/local";
import SiteChrome from "@/app/components/SiteChrome";
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION_FALLBACK,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";
import "./globals.css";

const foundersGrotesk = localFont({
  src: [
    {
      path: "./fonts/FoundersGrotesk-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/FoundersGrotesk-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-founders",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION_FALLBACK,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_GB",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    images: [DEFAULT_OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${foundersGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-black font-sans">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
