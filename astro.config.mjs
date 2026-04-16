import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.sakustudios.com.tr",
  output: "static",
  integrations: [
    sitemap({
      changefreq: "weekly",
      priority: 0.8,
      lastmod: new Date(),
      serialize(item) {
        if (item.url === "https://www.sakustudios.com.tr/") {
          item.priority = 1.0;
        }
        return item;
      },
    }),
  ],
});
