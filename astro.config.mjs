import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.sakustudios.com.tr",
  output: "static",
  integrations: [sitemap()],
});
