import { el, round, SvgNode } from "./svg";

/** Filled rounded-corner rectangle. */
export function roundedRect(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
): SvgNode {
  return el("rect", {
    x: round(x),
    y: round(y),
    width: round(w),
    height: round(h),
    rx: round(r),
    fill,
  });
}

/**
 * Standard SHS panel: background plus an inset border of the given width.
 * Border is stroked centered on its inset line, corners rounded.
 */
export function panel(
  w: number,
  h: number,
  opts: {
    bg: string;
    border: string;
    borderWidth: number;
    /** Corner radius of the border centerline. */
    radius: number;
    /** Distance from panel edge to the border outer edge (indent). */
    indent?: number;
  },
): SvgNode[] {
  const bw = opts.borderWidth;
  const ind = opts.indent ?? bw;
  const inset = ind + bw / 2;
  return [
    roundedRect(0, 0, w, h, opts.radius + inset > 0 ? opts.radius : 0, opts.bg),
    el("rect", {
      x: round(inset),
      y: round(inset),
      width: round(w - 2 * inset),
      height: round(h - 2 * inset),
      rx: round(opts.radius),
      fill: "none",
      stroke: opts.border,
      "stroke-width": round(bw),
    }),
  ];
}

