import type { Metadata } from "next";
import HomeContent from "@/app/HomeContent";

export const metadata: Metadata = {
  title: "BlankCo",
  description:
    "BlankCo represents exceptional Film Directors, Creative Directors, and AI Creatives.",
};

export default function Home() {
  return <HomeContent />;
}
