import { el, round, SvgNode } from "../core/svg";

/**
 * Straight directional arrow pointing right, centered on (0,0).
 * Modeled on the SHS standard arrow: tapered barbs, straight shaft.
 */
export function arrowRightPath(opts: {
  length: number;
  shaft: number;
  headLength: number;
  headWidth: number;
}): string {
  const { length, shaft, headLength, headWidth } = opts;
  const half = length / 2;
  const hs = shaft / 2;
  const hw = headWidth / 2;
  const hx = half - headLength;
  const pts = [
    [-half, -hs],
    [hx, -hs],
    [hx, -hw],
    [half, 0],
    [hx, hw],
    [hx, hs],
    [-half, hs],
  ];
  return `M${pts.map((p) => `${round(p[0]!)} ${round(p[1]!)}`).join("L")}Z`;
}

/** Arrow at an angle, degrees clockwise from pointing right. */
export function arrow(
  cx: number,
  cy: number,
  angleDeg: number,
  fill: string,
  opts: { length: number; shaft?: number; headLength?: number; headWidth?: number },
): SvgNode {
  const shaft = opts.shaft ?? opts.length * 0.22;
  const headLength = opts.headLength ?? opts.length * 0.38;
  const headWidth = opts.headWidth ?? opts.length * 0.55;
  const d = arrowRightPath({ length: opts.length, shaft, headLength, headWidth });
  return el("path", {
    d,
    fill,
    transform: `translate(${round(cx)} ${round(cy)}) rotate(${round(angleDeg)})`,
  });
}

/** Straight-up lane arrow in a width x height box, bottom-center shaft. */
export function upArrowPath(opts: {
  width: number;
  height: number;
  shaft: number;
  headLength: number;
  headWidth: number;
}): string {
  const { width: w, height: h, shaft: t, headLength: hl, headWidth: hw } = opts;
  const cx = w / 2;
  const pts = [
    [cx - t / 2, h],
    [cx - t / 2, hl],
    [cx - hw / 2, hl],
    [cx, 0],
    [cx + hw / 2, hl],
    [cx + t / 2, hl],
    [cx + t / 2, h],
  ];
  return `M${pts.map((p) => `${round(p[0]!)} ${round(p[1]!)}`).join("L")}Z`;
}

