import { el, SvgNode } from "./svg";
import { layoutText, fitText } from "../font/layout";
import type { FontData } from "../font/types";

/** Single line of text as a filled path node. */
export function text(
  content: string,
  opts: {
    font: FontData;
    height: number;
    x: number;
    /** Baseline y. */
    y: number;
    fill: string;
    anchor?: "start" | "middle" | "end";
    tracking?: number;
  },
): SvgNode {
  const { d } = layoutText(content, opts);
  return el("path", { d, fill: opts.fill });
}

/** Centered line that steps down the font chain / shrinks to fit maxWidth. */
export function fittedText(
  content: string,
  opts: {
    fonts: FontData[];
    height: number;
    x: number;
    y: number;
    fill: string;
    maxWidth: number;
    anchor?: "start" | "middle" | "end";
    tracking?: number;
    minHeight?: number;
  },
): SvgNode {
  const { d } = fitText(content, opts);
  return el("path", { d, fill: opts.fill });
}

/**
 * Stack of centered lines. Each entry may override font/height.
 * `y` positions are baselines computed from top plus line offsets.
 */
export function textStack(
  lines: { text: string; height: number; font?: FontData; extraGap?: number }[],
  opts: {
    cx: number;
    /** y of the first line's cap top. */
    top: number;
    /** Gap between the baseline and the next line's cap top. */
    gap: number;
    fill: string;
    font: FontData;
    tracking?: number;
  },
): SvgNode[] {
  const nodes: SvgNode[] = [];
  let capTop = opts.top;
  for (const line of lines) {
    const baseline = capTop + line.height;
    nodes.push(
      text(line.text, {
        font: line.font ?? opts.font,
        height: line.height,
        x: opts.cx,
        y: baseline,
        fill: opts.fill,
        anchor: "middle",
        tracking: opts.tracking,
      }),
    );
    capTop = baseline + opts.gap + (line.extraGap ?? 0);
  }
  return nodes;
}
