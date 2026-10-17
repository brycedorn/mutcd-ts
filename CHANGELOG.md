# Changelog

## Unreleased

Adds 16 Core Exact signs from the primary FHWA 2024 artwork, raising the catalog to 63 sign codes.

- Adds R4-8, R5-1a, R15-1, S5-1, W4-1, W4-2, W5-1, W5-2, W6-1, W6-2, W6-3, W8-1, W8-5, W10-1, W11-3, and W17-1.
- Adds exact left and right artwork for W4-1 and W4-2.
- Adds typed, fitted speed numerals and fluorescent color control for S5-1.
- Expands official-artwork comparison coverage from 45 to 61 presets while preserving per-sign tree shaking.

## 0.2.2

Fidelity refinements eliminate the remaining measured differences from the primary FHWA artwork.

- Replaces the E5-1 exit arrow with the exact official path and corrects numbered-panel widths and numeral placement.
- Uses exact official artwork for the D1-1 arrow, the matching R7-1 legend, and the matching D3-1 reference variant while preserving parametric fallbacks.
- All 45 official-artwork comparisons now measure a 0.00% pixel mismatch.
- No API changes.

## 0.2.1

Fidelity fix: sign geometry is now traced from the FHWA's primary 2024 Standard Highway Signs artwork (the PDFs) instead of the published SVG exports, which turn out to contain curve distortion introduced by FHWA's own conversion.

- Fixes the four affected signs: R1-1 (boxy upper-left shoulder on the S), R11-2 (spurious bumps on the C terminals), W13-1P (flattened digit bowls), and W11-1 (nick on the bicycle frame). All other signs were verified unaffected.
- Every template now measures a 0.00% pixel mismatch against the primary artwork, except the font-rendered guide signs at <= 0.7%.
- No API changes. Full-catalog bundle shrinks ~5 KB (~1.4 KB gzipped).

## 0.2.0

Pay-per-sign bundling. Importing templates directly now tree-shakes unused signs and lettering out of consumer bundles (one artwork sign is ~1.4 KB gzipped vs ~80 KB for the full catalog).

- Adds `renderSign(template, props)`: renders an imported template without pulling the full catalog. `renderSVG(code)` is unchanged and remains the whole-catalog convenience.
- Adds `defineSign` and per-sign prop type exports (`SpeedLimitProps`, `RouteProps`, ...) so custom templates can be authored and rendered with `renderSign`.
- Breaking: `measureText`, `layoutText`, and `fitText` now take `FontData` instead of a series string, and `fitText` takes an ordered `fonts` chain (e.g. `CHAIN_D`) instead of a preferred series. The series data (`seriesB`...`seriesE`), step-down chains (`CHAIN_C/D/E`), and a string-keyed `FONTS`/`getFont` registry are exported.

## 0.1.0

Initial release: 47 parametric MUTCD sign templates rendered as SVG, traced from the official FHWA 2024 Standard Highway Signs artwork.
