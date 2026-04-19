import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://amadeo-wohnung.netlify.app",
  integrations: [
    preact(),
    sitemap({
      canonicalURL: "https://amadeo-wohnung.netlify.app",
    }),
  ],
});
