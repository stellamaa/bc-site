import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "./lib/sanity-config";
import schemas from "./sanity/schemas";

const config = defineConfig({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,
  title: "BC Site",
  basePath: "/admin",
  plugins: [structureTool()],
  schema: {
    types: schemas,
  },
  // Keep classic Publish button; Releases hides/moves it for many editors
  releases: {
    enabled: false,
  },
});

export default config;
