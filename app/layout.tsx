import type { Metadata } from "next";
import localFont from "next/font/local";
import Header from "@/app/components/Header";
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
        {/* Desktop: fixed top nav on every page */}
        <div className="hidden md:block fixed top-0 inset-x-0 z-50 bg-white border-b border-transparent">
          <Header />
        </div>
        <div className="flex-1 flex flex-col md:pt-[5.5rem]">{children}</div>
      </body>
    </html>
  );
}
