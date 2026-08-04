# <img src="./assets/mutcd-ts.svg" alt="mutcd-ts" width="250">

[![npm version](https://img.shields.io/npm/v/mutcd-ts.svg)](https://www.npmjs.com/package/mutcd-ts)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](https://www.npmjs.com/package/mutcd-ts)
[![site](https://github.com/brycedorn/mutcd-ts/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/brycedorn/mutcd-ts/actions/workflows/deploy-pages.yml)

Parametric rendering of US MUTCD road signs (2024 SHS Release 6) as SVG, designed for use as textures in three.js scenes or anywhere an SVG/canvas works. Zero runtime dependencies and zero runtime assets; FHWA-series lettering is compiled into the package as glyph path data.

**[Browse the sign gallery →](https://brycedorn.github.io/mutcd-ts/)**

## Install

```sh
npm install mutcd-ts
```

## Usage

```ts
import { renderSVG, rasterize, listSigns } from "mutcd-ts";

// Plain SVG string (viewBox in inches)
const svg = renderSVG("R2-1", { speed: 45 });

// Rasterize for a three.js texture (async: decodes the SVG off-thread)
const canvas = await rasterize(svg, { pxPerInch: 16 });
const texture = new THREE.CanvasTexture(canvas);

// Discover available signs, categories, and default props
listSigns(); // [{ code: "R1-1", name: "Stop", category: "regulatory", defaults: {} }, ...]
```

Signs with variable content take typed props (checked against the specific sign code):

```ts
renderSVG("D3-1", { name: "Wyngate", suffix: "Rd" });
renderSVG("R2-1", { speed: 65 });
renderSVG("R3-5", { movement: "right" });
renderSVG("R6-1", { direction: "left" });
renderSVG("R7-1", { lines: ["8 AM", "TO", "6 PM"], arrow: "right" });
renderSVG("M1-1", { route: "80" });
renderSVG("W13-1P", { speed: 35 });
renderSVG("D1-1", { lines: [{ name: "Pullman", arrow: "left", miles: 3 }] });
```

`renderSVG` returns a plain string and runs in any JavaScript runtime; `rasterize` requires a browser (or worker) environment. The package never imports three.js.

## Accuracy

Sign geometry is traced from the official FHWA 2024 Standard Highway Signs vector artwork and verified with a pixel-level comparison against it: renders are rasterized, classified into the standard sign colors, and diffed against the official files. All 45 referenced signs pass; 42 of them match at exactly 0.00% pixel mismatch, and the worst case (font-rendered guide signs) is within 0.8%. Colors follow the Pantone values the spec defines rather than the print CMYK conversions baked into the official files.

## Included signs (47 templates)

- Regulatory: R1-1 Stop, R1-2 Yield, R2-1 Speed Limit, R3-1/2/3/4 turn restrictions, R3-5 lane control, R4-1 Do Not Pass, R4-7 Keep Right, R5-1 Do Not Enter, R5-2 No Trucks, R6-1/6-2 One Way, R7-1 No Parking (times/arrow), R8-3 No Parking symbol, R10-11 No Turn On Red, R11-2 Road Closed
- Warning: W1-1..W1-6, W1-8 turns/curves/chevron, W2-1/2/4/5 intersections, W3-1/2/3 stop/yield/signal ahead, W11-1 bicycle, W11-2 pedestrian, W13-1P advisory speed, W14-1/2 dead end/no outlet, W20-1 road work
- Guide: D1-1/2/3 destinations (variable width), D3-1 street name (fit-to-width), E5-1 exit gore
- Route markers: M1-1 Interstate, M1-4 US Route, M1-5 State Route
- School: S1-1

The catalog covers the most common signs so far, with more on the way. Missing one you need? [Open an issue](https://github.com/brycedorn/mutcd-ts/issues).

## Design notes

- Sign geometry comes from the official 2024 Standard Highway Signs vector artwork (public domain) and is emitted with an inch-based `viewBox`, so geometry is resolution-independent.
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
npm run site:build     # static site build (deployed to GitHub Pages on push to main)
```

The files under `src/font/generated/` and `src/signs/generated/` are compiled from the official FHWA 2024 SHS artwork (public domain) and from the Roadgeek 2014 recreation of the FHWA alphabets (sammdot/roadgeek-fonts); edit the sources, not the generated output. Neither the SHS artwork nor the font files are committed or shipped.

## License

MIT. Sign geometry derives from the public-domain FHWA 2024 Standard Highway Signs.
