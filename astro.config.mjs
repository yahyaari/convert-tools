import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://convert-toolss.pages.dev",
  output: "static",
  integrations: [sitemap()],
});
