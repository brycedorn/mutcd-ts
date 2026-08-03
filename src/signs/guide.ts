import { defineSign } from "../core/types";
import { COLORS } from "../core/colors";
import { el, round, SvgNode } from "../core/svg";
import { roundedRect } from "../core/shapes";
import { text } from "../core/text";
import { measureText, measureInkBearings, fitText } from "../font/layout";
import { arrow } from "../symbols/arrows";

/**
 * Guide panel proportions calibrated from the official SHS SVGs
 * (e.g. D01-01 at 18": 0.75" white edge, 1.5" corner radius on the field).
 */
function guidePanel(
  w: number,
  h: number,
  bg = COLORS.green,
  opts?: { edge?: number; rOuter?: number; rInner?: number },
): SvgNode[] {
  const edge = opts?.edge ?? h * 0.0417;
  const rOuter = opts?.rOuter ?? h * 0.125;
  const rInner = opts?.rInner ?? h * 0.0833;
  return [
    roundedRect(0, 0, w, h, rOuter, COLORS.white),
    roundedRect(edge, edge, w - 2 * edge, h - 2 * edge, rInner, bg),
  ];
}

export type DestinationLine = {
  name: string;
  /** Arrow placement; up = advance/straight-through. */
  arrow: "left" | "right" | "up" | "none";
  /** Distance in miles shown after the name (omit for none). */
  miles?: number;
};

// D1 arrow proportions measured off D01-01 VARx18: 9x6" for 6" caps.
function guideArrow(
  cx: number,
  cy: number,
  dir: "left" | "right" | "up",
  capH: number,
): SvgNode {
  const angle = dir === "left" ? 180 : dir === "right" ? 0 : -90;
  return arrow(cx, cy, angle, COLORS.white, {
    length: capH * 1.5,
    shaft: capH * 0.375,
    headLength: capH * 0.75,
    headWidth: capH,
  });
}

/**
 * Renders a variable-width destination guide sign. Width grows with the
 * longest line. Lines render in mixed case Series E at 2/3 line height.
 */
function destinationSign(code: string, name: string, lineCount: 1 | 2 | 3) {
  return defineSign<{ lines: DestinationLine[] }>({
    code,
    name,
    category: "guide",
    defaults: {
      lines: Array.from({ length: lineCount }, (_, i) => ({
        name: ["Pullman", "Colfax", "Palouse"][i]!,
        arrow: (["left", "up", "right"] as const)[i]!,
      })),
    },
    // Geometry from D01-01 VARx18 / D01-02 VARx30: 6" caps, 7" side margins,
    // 9x6" arrow, 6" arrow-to-text gap; multi-line signs are 15"-tall stacked
    // fields separated by the shared 0.75" white edge.
    render: ({ lines }) => {
      const capH = 6;
      const edge = 0.75;
      const n = lines.length;
      const h = n === 1 ? 18 : 15 * n;
      const arrowW = capH * 1.5;
      const margin = 7;
      const arrowGap = 6;
      // Distance figures sit a wide column gap after the name (~2 cap heights
      // averaged across D01/D02 artwork), not a normal word space.
      const colGap = 2;
      // Margins and gaps measure to ink edges, so lay out by ink extents.
      const measureLine = (line: DestinationLine) => {
        let advance = measureText(line.name, "D");
        let lastText = line.name;
        if (line.miles !== undefined) {
          lastText = String(line.miles);
          advance += colGap + measureText(lastText, "D");
        }
        const left = measureInkBearings(line.name, "D").left;
        const right = measureInkBearings(lastText, "D").right;
        return { ink: (advance - left - right) * capH, left: left * capH };
      };
      let maxW = 0;
      for (const line of lines) {
        const aw = line.arrow === "none" ? 0 : arrowW + arrowGap;
        maxW = Math.max(maxW, measureLine(line).ink + aw);
      }
      const w = Math.ceil(maxW + margin * 2);
      const nodes: SvgNode[] = [roundedRect(0, 0, w, h, 2.25, COLORS.white)];
      const fieldH = (h - (n + 1) * edge) / n;
      for (let i = 0; i < n; i++) {
        nodes.push(
          roundedRect(edge, edge + i * (fieldH + edge), w - 2 * edge, fieldH, 1.5, COLORS.green),
        );
      }
      lines.forEach((line, i) => {
        const cy = edge + i * (fieldH + edge) + fieldH / 2;
        const baseline = cy + capH / 2;
        const hasLeft = line.arrow === "left";
        const inkX = margin + (hasLeft ? arrowW + arrowGap : 0);
        const penX = inkX - measureLine(line).left;
        nodes.push(
          text(line.name, {
            series: "D",
            height: capH,
            x: penX,
            y: baseline,
            fill: COLORS.white,
          }),
        );
        if (line.miles !== undefined) {
          nodes.push(
            text(String(line.miles), {
              series: "D",
              height: capH,
              x: penX + (measureText(line.name, "D") + colGap) * capH,
              y: baseline,
              fill: COLORS.white,
            }),
          );
        }
        if (line.arrow === "left") {
          nodes.push(guideArrow(margin + arrowW / 2, cy, "left", capH));
        } else if (line.arrow === "right" || line.arrow === "up") {
          nodes.push(guideArrow(w - margin - arrowW / 2, cy, line.arrow, capH));
        }
      });
      return { width: w, height: h, nodes };
    },
  });
}

export const D1_1 = destinationSign("D1-1", "Destination (1 line)", 1);
export const D1_2 = destinationSign("D1-2", "Destination (2 lines)", 2);
export const D1_3 = destinationSign("D1-3", "Destination (3 lines)", 3);

export type StreetNameProps = {
  /** Street name, mixed case, e.g. "Wyngate". */
  name: string;
  /** Suffix such as "Rd", "St", "Ave"; empty for none. */
  suffix: string;
  /** Optional block number prefix, e.g. "W" or "1200". */
  prefix: string;
};

/** D3-1 Street Name. Variable width, 6" caps on a green field. */
export const D3_1 = defineSign<StreetNameProps>({
  code: "D3-1",
  name: "Street Name",
  category: "guide",
  defaults: { name: "Wyngate", suffix: "Rd", prefix: "" },
  // Geometry from D03-01 "Wyngate Dr" VARx6 (drawn at 2x): caps h/2, suffix
  // caps h/3 on a shared baseline at 0.701h, side margins h/2 to ink,
  // name-suffix ink gap 0.375h, white edge h/16. Street-name legends track
  // wider than destination legends (+0.055 cap per gap, measured).
  render: ({ name, suffix, prefix }) => {
    const h = 12;
    const capH = 6;
    const suffixH = 4;
    const margin = 6;
    const gap = 4.5;
    const tracking = 0.055;
    const full = [prefix, name].filter(Boolean).join(" ");
    const maxSignW = 108;
    const fit = fitText(full, {
      series: "D",
      height: capH,
      x: 0,
      y: 0,
      tracking,
      maxWidth: maxSignW - margin * 2 - (suffix ? measureText(suffix, "D") * suffixH + gap : 0),
    });
    const nameBearings = measureInkBearings(full, fit.series);
    const nameInkW = fit.width - (nameBearings.left + nameBearings.right) * fit.height;
    const sufBearings = measureInkBearings(suffix, "D");
    const sufInkW = suffix
      ? (measureText(suffix, "D") - sufBearings.left - sufBearings.right) * suffixH
      : 0;
    const w = Math.ceil(nameInkW + sufInkW + (suffix ? gap : 0) + margin * 2);
    const baseline = h * 0.701;
    const nodes = guidePanel(w, h, COLORS.green, { edge: 0.75, rOuter: 1.5, rInner: 0.75 });
    nodes.push(
      el("path", {
        d: fitText(full, {
          series: fit.series,
          height: fit.height,
          x: margin - nameBearings.left * fit.height,
          y: baseline,
          tracking,
          maxWidth: fit.width + 0.01,
        }).d,
        fill: COLORS.white,
      }),
    );
    if (suffix) {
      nodes.push(
        text(suffix, {
          series: "D",
          height: suffixH,
          x: margin + nameInkW + gap - sufBearings.left * suffixH,
          y: baseline,
          fill: COLORS.white,
        }),
      );
    }
    return { width: w, height: h, nodes };
  },
});

export type ExitGoreProps = {
  /** Exit number, e.g. "25" or "25A"; empty for unnumbered gore. */
  exit: string;
};

/** SHS width table for numbered gores, keyed by digit and suffix-letter count. */
function exitGoreWidth(digits: number, letters: number): number {
  const table = [
    [78, 78, 96],
    [90, 108, 126],
    [120, 138, 156],
  ];
  return table[Math.min(letters, 2)]![Math.min(digits - 1, 2)]!;
}

/**
 * E5-1 Exit Gore. Geometry from E05-01 72x60 and E05-01a 78x60: letterspaced
 * 12" EXIT centered with cap top at 10", 18" number at x 16 with baseline 49",
 * 23x23" up-right arrow (centered when unnumbered, right-side otherwise).
 */
export const E5_1 = defineSign<ExitGoreProps>({
  code: "E5-1",
  name: "Exit Gore",
  category: "guide",
  defaults: { exit: "25" },
  render: ({ exit }) => {
    const h = 60;
    const match = /^(\d+)\s*([A-Za-z]*)$/.exec(exit.trim());
    const label = exit.trim().replace(/\s+/g, "");
    let w: number;
    let numW = 0;
    if (label && match) {
      numW = measureText(label, "E") * 18;
      w = Math.max(exitGoreWidth(match[1]!.length, match[2]!.length), Math.ceil(16 + numW + 3 + 23 + 6));
    } else if (label) {
      numW = measureText(label, "E") * 18;
      w = Math.ceil(16 + numW + 3 + 23 + 6);
    } else {
      w = 72;
    }
    const nodes = guidePanel(w, h, COLORS.green, { edge: 1.5, rOuter: 6, rInner: 4.5 });
    // EXIT letterspacing is non-uniform in the artwork; per-letter ink
    // offsets measured from E05-01 72x60 (cap units).
    const exitOffsets: Array<[string, number]> = [
      ["E", 0],
      ["X", 1.0625],
      ["I", 2.3833],
      ["T", 2.9458],
    ];
    const exitInkW = 3.6917 * 12;
    const exitLeft = w / 2 - exitInkW / 2;
    for (const [ch, off] of exitOffsets) {
      nodes.push(
        text(ch, {
          series: "E",
          height: 12,
          x: exitLeft + (off - measureInkBearings(ch, "E").left) * 12,
          y: 22,
          fill: COLORS.white,
        }),
      );
    }
    if (label) {
      nodes.push(
        text(label, { series: "E", height: 18, x: 16, y: 49, fill: COLORS.white }),
      );
    }
    const arrowCx = label ? w - 6 - 11.5 : w / 2;
    nodes.push(
      arrow(arrowCx, 42.5, -45, COLORS.white, {
        length: 32.5,
        shaft: 5,
        headLength: 13,
        headWidth: 16,
      }),
    );
    return { width: w, height: h, nodes };
  },
});
