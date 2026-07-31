"use client";

import config from "@/sanity.config";
import { NextStudio } from "next-sanity/studio";

export default function Studio() {
  // Hash history keeps Studio on /admin/ — required for static GitHub Pages
  // (browser history navigates to /admin/structure which 404s).
  return <NextStudio config={config} history="hash" />;
}
