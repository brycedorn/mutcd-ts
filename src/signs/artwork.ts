import { COLORS, SignColor } from "../core/colors";
import { el, SvgNode } from "../core/svg";
import type { SignRender } from "../core/types";

/** Vector artwork traced from official FHWA 2024 SHS releases. */
export type SignArt = {
  width: number;
  height: number;
  paths: { d: string; fill: string }[];
  /** Prop-driven legend zone, rendered only when props match the official layout. */
  legend?: { d: string; fill: string }[];
};

function pathsToNodes(
  paths: { d: string; fill: string }[],
  remap: Partial<Record<SignColor, SignColor>>,
): SvgNode[] {
  return paths.map((p) => {
    const token = (remap[p.fill as SignColor] ?? p.fill) as SignColor;
    return el("path", { d: p.d, fill: COLORS[token] });
  });
}

/** Renders artwork paths with palette colors; remap swaps tokens (e.g. fyg to yellow). */
export function artNodes(
  art: SignArt,
  remap: Partial<Record<SignColor, SignColor>> = {},
): SvgNode[] {
  return pathsToNodes(art.paths, remap);
}

/** Renders the artwork legend zone (exact official digits/words). */
export function artLegendNodes(
  art: SignArt,
  remap: Partial<Record<SignColor, SignColor>> = {},
): SvgNode[] {
  return pathsToNodes(art.legend ?? [], remap);
}

export function artRender(
  art: SignArt,
  remap?: Partial<Record<SignColor, SignColor>>,
): SignRender {
  return { width: art.width, height: art.height, nodes: artNodes(art, remap) };
}
