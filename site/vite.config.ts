import { defineConfig, type Plugin } from "vite";
import { fileURLToPath } from "node:url";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SIGNS } from "../src/index";

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

/**
 * Static hosts (GitHub Pages) can't rewrite URLs, so emit a real page per
 * sign: signs/<CODE>/index.html, a copy of the gallery page with relative
 * URLs stepped up one directory. The page script routes off the pathname.
 */
function signDetailPages(): Plugin {
  return {
    name: "sign-detail-pages",
    apply: "build",
    async closeBundle() {
      const dist = here("dist");
      const src = await readFile(join(dist, "signs/index.html"), "utf8");
      // The rewrites below assume vite emits relative ../ URLs and a <title>;
      // fail the build rather than ship broken pages if that shape changes.
      if (!/(href|src)="\.\.\//.test(src) || !/<title>.*?<\/title>/.test(src)) {
        throw new Error(
          "sign-detail-pages: signs/index.html no longer matches the expected shape",
        );
      }
      // GH Pages serves /signs from signs.html, beating the 301 to /signs/,
      // so slashless gallery links load with no redirect hop.
      await writeFile(
        join(dist, "signs.html"),
        src.replaceAll('href="../', 'href="./').replaceAll('src="../', 'src="./'),
      );
      for (const code of Object.keys(SIGNS)) {
        const titled = src.replace(
          /<title>.*?<\/title>/,
          `<title>mutcd-ts | ${code}</title>`,
        );
        // Flat signs/<CODE>.html serves /signs/<CODE> with no redirect (same
        // directory depth as the gallery page, so relative paths are fine).
        await writeFile(join(dist, "signs", `${code}.html`), titled);
        // Directory variant keeps /signs/<CODE>/ working too.
        const html = titled
          .replaceAll('href="../', 'href="../../')
          .replaceAll('src="../', 'src="../../');
        const dir = join(dist, "signs", code);
        await mkdir(dir, { recursive: true });
        await writeFile(join(dir, "index.html"), html);
      }
    },
  };
}

/** Dev-server equivalent: serve the gallery page for signs/<CODE> URLs. */
function signDetailDev(): Plugin {
  return {
    name: "sign-detail-dev",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const path = (req.url ?? "").split("?")[0]!;
        if (/^\/signs(\/[A-Za-z0-9-]+)?$/.test(path)) req.url = "/signs/index.html";
        next();
      });
    },
  };
}

export default defineConfig({
  // Relative asset paths so the build deploys to any subpath (GitHub Pages).
  base: "./",
  resolve: {
    alias: {
      "mutcd-ts": here("../src/index.ts"),
    },
  },
  plugins: [signDetailPages(), signDetailDev()],
  build: {
    rollupOptions: {
      input: {
        main: here("index.html"),
        signs: here("signs/index.html"),
        fidelity: here("fidelity/index.html"),
      },
    },
  },
});
