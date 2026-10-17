import type { FontData } from "./types";

export type FontSeries = "B" | "C" | "D" | "E" | "EM" | "F";

export type TextOptions = {
  font: FontData;
  /** Uppercase letter height in sign units (inches). */
  height: number;
  x: number;
  /** Baseline y. */
  y: number;
  anchor?: "start" | "middle" | "end";
  /** Extra tracking between characters, as a fraction of letter height. */
  tracking?: number;
};

/** Width of text in multiples of letter height. */
export function measureText(text: string, font: FontData, tracking = 0): number {
  let w = 0;
  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!;
    const g = font.glyphs[ch] ?? font.glyphs["?"];
    if (!g) continue;
    w += g.a;
    if (i < chars.length - 1) {
      w += (font.kern[ch + chars[i + 1]!] ?? 0) + tracking;
    }
  }
  return w;
}

/** Transforms normalized glyph path data by scale s and offset (dx, dy). */
function transformPath(d: string, s: number, dx: number, dy: number): string {
  let out = "";
  let i = 0;
  const n = d.length;
  while (i < n) {
    const cmd = d[i]!;
    out += cmd;
    i++;
    if (cmd === "Z") continue;
    // Collect the numbers following this command.
    let j = i;
    while (j < n && !/[A-Za-z]/.test(d[j]!)) j++;
    const nums = d
      .slice(i, j)
      .trim()
      .split(/[\s,]+/)
      .filter((t) => t.length > 0)
      .map(Number);
    const parts: string[] = [];
    for (let k = 0; k < nums.length; k += 2) {
      const x = nums[k]! * s + dx;
      const y = nums[k + 1]! * s + dy;
      parts.push(`${round(x)} ${round(y)}`);
    }
    out += parts.join(" ");
    i = j;
  }
  return out;
}

function round(v: number): string {
  const r = Math.round(v * 1000) / 1000;
  return Object.is(r, -0) ? "0" : String(r);
}

/**
 * Lays out text as a single SVG path data string in sign coordinates.
 * Returns the path and the laid-out width (in sign units).
 */
export function layoutText(
  text: string,
  opts: TextOptions,
): { d: string; width: number } {
  const { font, height, y, anchor = "start", tracking = 0 } = opts;
  const width = measureText(text, font, tracking) * height;
  let penX =
    anchor === "middle"
      ? opts.x - width / 2
      : anchor === "end"
        ? opts.x - width
        : opts.x;
  let d = "";
  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!;
    const g = font.glyphs[ch] ?? font.glyphs["?"];
    if (!g) continue;
    if (g.d) d += transformPath(g.d, height, penX, y);
    penX += g.a * height;
    if (i < chars.length - 1) {
      penX += ((font.kern[ch + chars[i + 1]!] ?? 0) + tracking) * height;
    }
  }
  return { d, width };
}

export type FitTextOptions = Omit<TextOptions, "font"> & {
  /** Candidate fonts, preferred (widest) first; narrower series follow. */
  fonts: FontData[];
  maxWidth: number;
  /** Minimum letter height when shrinking, in sign units. */
  minHeight?: number;
};

/**
 * Fits text within maxWidth: first steps the series down (narrower alphabet),
 * then shrinks letter height as a last resort. Mirrors real sign practice.
 */
export function fitText(
  text: string,
  opts: FitTextOptions,
): { d: string; width: number; font: FontData; height: number } {
  for (const font of opts.fonts) {
    const w = measureText(text, font, opts.tracking ?? 0) * opts.height;
    if (w <= opts.maxWidth) {
      const laid = layoutText(text, { ...opts, font });
      return { ...laid, font, height: opts.height };
    }
  }
  // Shrink height with the narrowest font.
  const narrowest = opts.fonts[opts.fonts.length - 1]!;
  const unitWidth = measureText(text, narrowest, opts.tracking ?? 0);
  const minHeight = opts.minHeight ?? opts.height * 0.5;
  const height = Math.max(minHeight, opts.maxWidth / Math.max(unitWidth, 1e-6));
  const laid = layoutText(text, { ...opts, font: narrowest, height });
  return { ...laid, font: narrowest, height };
}

const inkXCache = new Map<string, { min: number; max: number }>();

function glyphInkX(font: FontData, ch: string): { min: number; max: number } {
  const key = font.series + ch;
  let ext = inkXCache.get(key);
  if (ext === undefined) {
    ext = { min: 0, max: 0 };
    const g = font.glyphs[ch];
    if (g?.d) {
      let min = Infinity;
      let max = -Infinity;
      const nums = g.d.match(/-?[\d.]+/g);
      if (nums) {
        // Path data alternates x y pairs.
        for (let i = 0; i < nums.length; i += 2) {
          const x = Number(nums[i]);
          if (x < min) min = x;
          if (x > max) max = x;
        }
      }
      if (min !== Infinity) ext = { min, max };
    }
    inkXCache.set(key, ext);
  }
  return ext;
}

/**
 * Side bearings of laid-out text: distance from the pen origin to the first
 * ink, and from the last advance back to the last ink, in multiples of letter
 * height. Official sign layouts measure margins and gaps to ink edges.
 */
export function measureInkBearings(
  text: string,
  font: FontData,
): { left: number; right: number } {
  const chars = [...text];
  const first = chars.find((c) => font.glyphs[c]?.d);
  const last = [...chars].reverse().find((c) => font.glyphs[c]?.d);
  if (!first || !last) return { left: 0, right: 0 };
  const lastGlyph = font.glyphs[last]!;
  return {
    left: glyphInkX(font, first).min,
    right: lastGlyph.a - glyphInkX(font, last).max,
  };
}

const inkDepthCache = new Map<string, number>();

/**
 * Deepest ink below the baseline for the given text, in multiples of letter
 * height (0 for text with no descenders). Measured from actual glyph
 * outlines, so it is tighter than the font's nominal descender.
 */
export function inkDepthBelowBaseline(text: string, font: FontData): number {
  let depth = 0;
  for (const ch of text) {
    const key = font.series + ch;
    let d = inkDepthCache.get(key);
    if (d === undefined) {
      d = 0;
      const g = font.glyphs[ch];
      if (g?.d) {
        const nums = g.d.match(/-?[\d.]+/g);
        if (nums) {
          // Path data alternates x y pairs; y > 0 is below the baseline.
          for (let i = 1; i < nums.length; i += 2) {
            d = Math.max(d, Number(nums[i]));
          }
        }
      }
      inkDepthCache.set(key, d);
    }
    depth = Math.max(depth, d);
  }
  return depth;
}
