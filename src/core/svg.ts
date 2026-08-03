/** Minimal DOM-free SVG string builder. All units are sign inches. */

export type SvgNode = string;

function esc(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function el(
  tag: string,
  attrs: Record<string, string | number | undefined> = {},
  children: SvgNode[] = [],
): SvgNode {
  let a = "";
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined) continue;
    a += ` ${k}="${esc(String(v))}"`;
  }
  if (children.length === 0) return `<${tag}${a}/>`;
  return `<${tag}${a}>${children.join("")}</${tag}>`;
}

export function svgRoot(
  widthIn: number,
  heightIn: number,
  children: SvgNode[],
): string {
  return el(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: `0 0 ${round(widthIn)} ${round(heightIn)}`,
      width: `${round(widthIn)}in`,
      height: `${round(heightIn)}in`,
    },
    children,
  );
}

export function round(v: number): number {
  return Math.round(v * 1000) / 1000;
}

export function path(
  d: string,
  fill: string,
  attrs: Record<string, string | number | undefined> = {},
): SvgNode {
  return el("path", { d, fill, ...attrs });
}

export type BBox = { minX: number; minY: number; maxX: number; maxY: number };

/**
 * Approximate bounding box of absolute path data (M/L/C/Q/A/Z). Uses curve
 * control points and arc endpoints, which is exact for polylines and
 * axis-aligned quarter arcs and slightly generous for other curves.
 */
export function pathBBox(d: string): BBox {
  const box: BBox = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };
  const add = (x: number, y: number) => {
    box.minX = Math.min(box.minX, x);
    box.minY = Math.min(box.minY, y);
    box.maxX = Math.max(box.maxX, x);
    box.maxY = Math.max(box.maxY, y);
  };
  const re = /([MLCQAZ])([^MLCQAZ]*)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(d))) {
    const cmd = m[1]!.toUpperCase();
    if (cmd === "Z") continue;
    const nums = (m[2]!.match(/-?[\d.]+(?:e-?\d+)?/gi) ?? []).map(Number);
    if (cmd === "A") {
      // rx ry rot large sweep x y, possibly repeated.
      for (let i = 0; i + 6 < nums.length + 1; i += 7) {
        add(nums[i + 5]!, nums[i + 6]!);
      }
    } else {
      for (let i = 0; i + 1 < nums.length; i += 2) {
        add(nums[i]!, nums[i + 1]!);
      }
    }
  }
  return box;
}
