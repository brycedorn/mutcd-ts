import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  // Relative asset paths so the build deploys to any subpath (GitHub Pages).
  base: "./",
  resolve: {
    alias: {
      "mutcd-ts": here("../src/index.ts"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: here("index.html"),
        signs: here("signs/index.html"),
      },
    },
  },
});
