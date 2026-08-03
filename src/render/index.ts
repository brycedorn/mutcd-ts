import { svgRoot } from "../core/svg";
import { SIGNS, SignCode, SignProps } from "../signs";

/**
 * Renders a sign to an SVG string. The viewBox is in inches, so the SVG
 * scales losslessly to any output size.
 */
export function renderSVG<C extends SignCode>(
  code: C,
  props?: Partial<SignProps<C>>,
): string {
  const template = SIGNS[code];
  if (!template) throw new Error(`Unknown sign code: ${code}`);
  const merged = { ...template.defaults, ...props } as SignProps<C>;
  const { width, height, nodes } = (
    template.render as (p: SignProps<C>) => {
      width: number;
      height: number;
      nodes: string[];
    }
  )(merged);
  return svgRoot(width, height, nodes);
}

export type RasterizeOptions = {
  /** Pixels per inch of sign face (default 8). */
  pxPerInch?: number;
  /** Overrides pxPerInch: output canvas width in pixels. */
  widthPx?: number;
  /** Canvas background; default transparent. */
  background?: string;
};

/** Parses width/height inches from a renderSVG output viewBox. */
export function svgSizeInches(svg: string): { width: number; height: number } {
  const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!m) throw new Error("SVG missing viewBox");
  return { width: Number(m[1]), height: Number(m[2]) };
}

/**
 * Rasterizes an SVG string to a canvas (browser only). Suitable for
 * `new THREE.CanvasTexture(canvas)`.
 */
export async function rasterize(
  svg: string,
  opts: RasterizeOptions = {},
): Promise<HTMLCanvasElement> {
  const { width, height } = svgSizeInches(svg);
  const scale = opts.widthPx ? opts.widthPx / width : (opts.pxPerInch ?? 8);
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d canvas context unavailable");
  if (opts.background) {
    ctx.fillStyle = opts.background;
    ctx.fillRect(0, 0, w, h);
  }
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to decode sign SVG"));
      img.src = url;
    });
    ctx.drawImage(img, 0, 0, w, h);
  } finally {
    URL.revokeObjectURL(url);
  }
  return canvas;
}
