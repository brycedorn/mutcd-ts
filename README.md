# <img src="https://raw.githubusercontent.com/brycedorn/mutcd-ts/main/assets/mutcd-ts.svg" alt="mutcd-ts" width="250">

[![npm version](https://img.shields.io/npm/v/mutcd-ts.svg)](https://www.npmjs.com/package/mutcd-ts)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](https://www.npmjs.com/package/mutcd-ts)
[![site](https://github.com/brycedorn/mutcd-ts/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/brycedorn/mutcd-ts/actions/workflows/deploy-pages.yml)

Parametric rendering of US [MUTCD](https://mutcd.fhwa.dot.gov) road signs from the FHWA 2024 Standard Highway Signs as SVG, designed for use as textures in three.js scenes or anywhere an SVG/canvas works. Zero runtime dependencies and zero runtime assets; FHWA-series lettering is compiled into the package as glyph path data.

**[Browse the sign gallery →](https://bryce.io/mutcd-ts/signs)**

## Install

```sh
npm install mutcd-ts
```

## Usage

```ts
import { renderSVG, rasterize, listSigns } from "mutcd-ts";

// Plain SVG string (viewBox in inches)
const svg = renderSVG("R2-1", { speed: 45 });

// Rasterize asynchronously for a three.js texture
const canvas = await rasterize(svg, { pxPerInch: 16 });
const texture = new THREE.CanvasTexture(canvas);

// Discover available signs, categories, and default props
listSigns(); // [{ code: "R1-1", name: "Stop", category: "regulatory", defaults: {} }, ...]
```

Signs with variable content take typed props (checked against the specific sign code):

```ts
renderSVG("D3-1", { name: "Wyngate", suffix: "Rd" });
renderSVG("R2-1", { speed: 65 });
renderSVG("D1-1", { lines: [{ name: "Pullman", arrow: "left", miles: 3 }] });
```

`renderSVG` returns a plain string and runs in any JavaScript runtime; `rasterize` requires a browser DOM environment. The package never imports three.js.

### Bundle size

Looking signs up by code (`renderSVG`) pulls the whole catalog (~78 KB gzipped). If you only need a few signs, import their templates directly and render with `renderSign`; bundlers then tree-shake the rest, down to a few KB per sign:

```ts
import { renderSign, R1_1, R2_1 } from "mutcd-ts";

renderSign(R1_1);                // ~1.3 KB gzipped in your bundle
renderSign(R2_1, { speed: 65 }); // text-fitting signs also pull the lettering they use
```

## Geometry

Sign geometry is traced from the FHWA's primary 2024 Standard Highway Signs PDF artwork and verified with pixel-level comparisons. A full audit found curve distortion in four of the FHWA's published SVG conversions, so mutcd-ts follows the primary artwork instead.

All 45 official-artwork comparisons match at 0.00% pixel mismatch. Colors follow the Pantone values the specification defines instead of the print CMYK conversions embedded in the official files.

## Design notes

- Sign geometry comes from the primary official 2024 Standard Highway Signs PDF artwork (public domain) and is emitted with an inch-based `viewBox`, so geometry is resolution-independent.
- Text is set in the FHWA Series alphabets (B/C/D/E/E-Modified/F) as `<path>` data. No fonts load at runtime, so rasterization is deterministic across browsers and workers.
- Variable text uses real sign practice to fit: step down to a narrower series first, then shrink letter height.
- `rasterize()` returns an `HTMLCanvasElement` (browser only); the package never imports three.js.
- Output is faithful to the SHS sheets but is not certified sign fabrication data.

## Development

```sh
npm install
npm test               # vitest snapshot + behavior tests
npm run typecheck
npm run build          # ESM + CJS + d.ts via tsup
npm run site           # docs site + live sign gallery (npm workspace in site/)
npm run site:build     # static site build
```

Generated sign and font data is checked into the package, so consumers need no runtime assets. Lettering is based on the [Roadgeek 2014](https://github.com/sammdot/roadgeek-fonts) recreation of the FHWA alphabets; source artwork and font files are not committed or shipped.

## License

MIT. Sign geometry derives from the public-domain FHWA 2024 Standard Highway Signs.
