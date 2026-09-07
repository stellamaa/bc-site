import { defineCliConfig } from "sanity/cli";
import {
  sanityDataset,
  sanityProjectId,
} from "./lib/sanity-config";

export default defineCliConfig({
  api: {
    projectId: sanityProjectId,
    dataset: sanityDataset,
  },
});
