import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.sakustudios.com.tr",
  output: "static",
  integrations: [sitemap()],
  vite: {
    optimizeDeps: {
      exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/core", "@ffmpeg/util"],
    },
    ssr: {
      noExternal: ["@ffmpeg/ffmpeg", "@ffmpeg/core", "@ffmpeg/util"],
    },
  },
});
