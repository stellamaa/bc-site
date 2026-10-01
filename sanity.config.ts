"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
  studioBasePath,
} from "./lib/sanity-config";
import schemas from "./sanity/schemas";

const config = defineConfig({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,
  title: "BC Site",
  basePath: studioBasePath,
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemas,
  },
  // Keep classic Publish button; Releases hides/moves it for many editors
  releases: {
    enabled: false,
  },
});

export default config;
