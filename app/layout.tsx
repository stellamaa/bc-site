import type { Metadata } from "next";
import localFont from "next/font/local";
import SiteChrome from "@/app/components/SiteChrome";
import "./globals.css";

const foundersGrotesk = localFont({
  src: [
    {
      path: "./fonts/FoundersGrotesk-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/FoundersGrotesk-Medium.otf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-founders",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BlankCo",
  description:
    "BlankCo represents exceptional Film Directors, Creative Directors, and AI Creatives.",
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
