# Changelog

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
