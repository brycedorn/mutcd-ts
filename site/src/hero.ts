import { renderSVG, rasterize } from "mutcd-ts";
import type { SignCode } from "mutcd-ts";

/**
 * Isometric treadmill hero: the whole ground is a conveyor belt that wraps
 * around rollers at both ends. Everything (road markings, signs, plants) lives
 * at a belt coordinate s and rides it: over the far roller into view, along
 * the flat top, then under the near roller. World units are px at scale 1;
 * u is the direction of travel, v crosses the road.
 */

type CycleEntry = { code: SignCode; props?: Record<string, unknown> };

const CYCLE: CycleEntry[] = [
  { code: "R1-1" },
  { code: "R2-1", props: { speed: 50 } },
  { code: "W1-2", props: { direction: "right" } },
  { code: "R1-2" },
  { code: "W11-2" },
  { code: "R6-1", props: { direction: "right" } },
  { code: "M1-1", props: { route: "80" } },
  { code: "R5-1" },
  { code: "W3-1" },
  { code: "S1-1" },
  { code: "R3-2" },
  { code: "W14-2" },
  { code: "R10-11" },
];

// Iso basis: u runs far (top-right) to near (bottom-left), v crosses the road.
const U = norm(-2, 1);
const V = norm(2, 1);

// World layout (px at scale 1).
const HALF_LEN = 150; // half belt length along u (flat section)
const HALF_WID = 126; // half belt width along v
const ROAD_HALF = 56; // half road width
const ROLL_R = 34; // roller radius at the belt ends
// The ground plane slices the treadmill at roller-axle height, so each belt
// wrap is exactly a quarter turn ending flush with the grid.
const THETA_MAX = Math.PI / 2;
const S_END = HALF_LEN + THETA_MAX * ROLL_R; // belt coord of the ground contact
// Far roller crest: where the wrapped surface turns away from the camera in
// this projection (dy/dtheta = 0); nothing behind it is visible.
const THETA_CREST = Math.atan(0.447);
const S_CREST = HALF_LEN + THETA_CREST * ROLL_R;
const THETA_FADE = 0.45; // riders start fading as they tip over the near edge
const THETA_HIDE = 1.5; // fully faded (belt meets the grid); rider can despawn
const SIGN_LANE = -(ROAD_HALF + 24); // sign posts across the road, facing viewer
const PLANT_LANE = ROAD_HALF + 40;
const SPEED = 55; // world units per second
const DASH_LEN = 18;
const DASH_GAP = 15;
const PX_PER_INCH = 2.1; // sign face raster scale (display px)
const RASTER_OVERSAMPLE = 2;
// Backing-store cap: 3x phones pay 2.25x the pixels for no visible gain.
const MAX_DPR = 2;

const BELT_SPAN = 2 * (HALF_LEN + ROLL_R * THETA_HIDE); // one rider lap

const C_SAND: RGB = [224, 207, 170];
const C_SAND_SIDE: RGB = [169, 143, 103];
const C_SAND_SUNSET: RGB = [121, 86, 73];
const C_SAND_SIDE_SUNSET: RGB = [76, 55, 51];
const C_ROAD: RGB = [93, 102, 112];
const C_ROAD_NIGHT: RGB = [48, 55, 64];
const C_EDGE: RGB = [244, 246, 248];
const C_DASH: RGB = [242, 199, 68];

type RGB = [number, number, number];

function norm(x: number, y: number): [number, number] {
  const m = Math.hypot(x, y);
  return [x / m, y / m];
}

function shade([r, g, b]: RGB, f: number, alpha = 1): string {
  return `rgba(${Math.round(r * f)},${Math.round(g * f)},${Math.round(b * f)},${alpha})`;
}

/** Belt coordinate to flat-plane coordinate + vertical drop over the rollers. */
function cross(s: number): { a: number; drop: number; theta: number; zone: -1 | 0 | 1 } {
  if (s > HALF_LEN) {
    const theta = (s - HALF_LEN) / ROLL_R;
    return {
      a: HALF_LEN + Math.sin(theta) * ROLL_R,
      drop: (1 - Math.cos(theta)) * ROLL_R,
      theta,
      zone: 1,
    };
  }
  if (s < -HALF_LEN) {
    const theta = (-HALF_LEN - s) / ROLL_R;
    return {
      a: -HALF_LEN - Math.sin(theta) * ROLL_R,
      drop: (1 - Math.cos(theta)) * ROLL_R,
      theta,
      zone: -1,
    };
  }
  return { a: s, drop: 0, theta: 0, zone: 0 };
}

/**
 * Rider pitch about the roller axis (positive = tipping forward over the near
 * edge): follows the belt wrap on rollers, snaps upright with a damped wobble
 * after landing on the flat.
 */
function riderPhi(s: number, theta: number, zone: -1 | 0 | 1): number {
  if (zone === 1) return theta;
  if (zone === -1) return -theta;
  const d = s + HALF_LEN; // distance travelled since landing
  if (d > 80) return 0;
  return 0.22 * Math.sin(d * 0.13) * Math.exp(-d * 0.045);
}

/**
 * Screen-space frame of a rider's panel plane pitched by phi about the roller
 * axis. The panel's horizontal edge is always the across-road direction V;
 * its up vector swings from screen-up toward the travel direction U, which is
 * the true axonometric projection of a rotation about the roller axis.
 */
function panelFrame(phi: number): [number, number, number, number] {
  const e2x = Math.sin(phi) * U[0];
  const e2y = Math.sin(phi) * U[1] - Math.cos(phi);
  return [V[0], V[1], -e2x, -e2y];
}

type Sprite = {
  front: HTMLCanvasElement;
  back: HTMLCanvasElement;
  shadow: HTMLCanvasElement;
};
type SpriteMap = Map<number, Sprite>;
const SHADOW_PAD = 16; // sprite-px padding around the blurred shadow silhouette
const POLE_H = 44; // sign pole height (world units at scale 1)
const POLE_W = 3; // sign pole stroke width (world units at scale 1)

/** Silhouette of the sign filled with a flat color. */
function silhouette(front: HTMLCanvasElement, fill: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = front.width;
  c.height = front.height;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(front, 0, 0);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, c.width, c.height);
  return c;
}

/** Sheet-metal gray back, shown past edge-on. */
function makeBack(front: HTMLCanvasElement): HTMLCanvasElement {
  return silhouette(front, "#a7aeb6");
}

/**
 * Soft dark silhouette for the ground shadow: panel plus pole in one canvas
 * (anchored at the pole base), gaussian-blurred, padded so the blur fits.
 */
function makeShadow(front: HTMLCanvasElement): HTMLCanvasElement {
  const poleH = POLE_H * RASTER_OVERSAMPLE;
  const poleW = POLE_W * RASTER_OVERSAMPLE;
  const c = document.createElement("canvas");
  c.width = front.width + SHADOW_PAD * 2;
  c.height = front.height + poleH + SHADOW_PAD * 2;
  const ctx = c.getContext("2d")!;
  ctx.filter = `blur(${SHADOW_PAD / 2}px)`;
  ctx.drawImage(silhouette(front, "#1a2129"), SHADOW_PAD, SHADOW_PAD);
  // Run the pole well up behind the panel so the blur can't open a gap where
  // the panel has little ink at bottom-center (e.g. the yield triangle).
  // Lighter blur here: the heavy panel blur washes the thin pole out.
  ctx.filter = "blur(3px)";
  ctx.fillStyle = "#1a2129";
  ctx.fillRect(
    (c.width - poleW) / 2,
    SHADOW_PAD + front.height * 0.5,
    poleW,
    front.height * 0.5 + poleH,
  );
  return c;
}

export function startHeroAnimation(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const sprites: SpriteMap = new Map();
  for (let i = 0; i < CYCLE.length; i++) {
    const entry = CYCLE[i]!;
    const svg = renderSVG(entry.code, entry.props as never);
    void rasterize(svg, { pxPerInch: PX_PER_INCH * RASTER_OVERSAMPLE }).then(
      (c) => sprites.set(i, { front: c, back: makeBack(c), shadow: makeShadow(c) }),
    );
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let raf = 0;
  let start = performance.now();
  let backingDpr = 0;
  const cache = createBgCache();

  const resize = (force = false): boolean => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (width === canvas.width && height === canvas.height) return false;
    const threshold = Math.max(1, Math.round(8 * dpr));
    if (
      !force &&
      dpr === backingDpr &&
      Math.abs(width - canvas.width) < threshold &&
      Math.abs(height - canvas.height) < threshold
    ) {
      return false;
    }
    canvas.width = width;
    canvas.height = height;
    backingDpr = dpr;
    return true;
  };
  resize(true);
  const ro = new ResizeObserver(() => {
    if (!resize()) return;
    const now = reduceMotion ? 0 : performance.now();
    draw(ctx, canvas, sprites, (now - start) / 1000, cache);
  });
  ro.observe(canvas);

  let running = false;
  let io: IntersectionObserver | null = null;

  function frame(now: number) {
    const t = (now - start) / 1000;
    draw(ctx!, canvas, sprites, t, cache);
    if (!reduceMotion && running) raf = requestAnimationFrame(frame);
  }

  if (reduceMotion) {
    // A static, fully-populated scene once sprites are ready.
    start = -40_000;
    setTimeout(() => frame(0), 300);
    new MutationObserver(() => frame(0)).observe(document.documentElement, {
      attributeFilter: ["data-theme", "data-sign-contrast"],
    });
  } else {
    // Animate only while the hero is on screen; shift the clock across pauses
    // so the belt resumes where it left off instead of jumping ahead.
    let pausedAt = performance.now();
    io = new IntersectionObserver(([entry]) => {
      const visible = !!entry?.isIntersecting;
      if (visible && !running) {
        start += performance.now() - pausedAt;
        running = true;
        raf = requestAnimationFrame(frame);
      } else if (!visible && running) {
        running = false;
        pausedAt = performance.now();
        cancelAnimationFrame(raf);
      }
    });
    io.observe(canvas);
  }

  // Stop cleanly if the canvas leaves the DOM (vite HMR).
  new MutationObserver(() => {
    if (!canvas.isConnected) {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
    }
  }).observe(document.body, { childList: true, subtree: true });
}

type Rider = {
  s: number;
  theta: number;
  zone: -1 | 0 | 1;
  kind: "sign" | "plant";
  idx: number;
};

type Proj = {
  scale: number;
  cx: number;
  cy: number;
  P: (a: number, b: number) => [number, number];
  Q: (s: number, b: number) => [number, number];
};

/** Projection for a css-pixel viewport: iso basis scaled and centered, with
 * headroom above the belt for tall signs and room below for the wraps. */
function makeProj(w: number, h: number): Proj {
  const scale = Math.min(w / 470, h / 470) * 0.7;
  const cx = w / 2;
  const cy = h / 2 + 40 * scale;
  const P = (a: number, b: number): [number, number] => [
    cx + (a * U[0] + b * V[0]) * scale,
    cy + (a * U[1] + b * V[1]) * scale,
  ];
  const Q = (s: number, b: number): [number, number] => {
    const c = cross(s);
    const [x, y] = P(c.a, b);
    return [x, y + c.drop * scale];
  };
  return { scale, cx, cy, P, Q };
}

type BgCache = { key: string; bg1: HTMLCanvasElement; bg2: HTMLCanvasElement };

function createBgCache(): BgCache {
  return {
    key: "",
    bg1: document.createElement("canvas"),
    bg2: document.createElement("canvas"),
  };
}

// Smooth band of belt surface between belt coords s0..s1 and lanes b0..b1,
// sampled finely so the roller curve renders without banding.
function bandPath(
  ctx: CanvasRenderingContext2D,
  Q: Proj["Q"],
  s0: number,
  s1: number,
  b0: number,
  b1: number,
) {
  const n = Math.max(2, Math.ceil(Math.abs(s1 - s0) / 3));
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const [x, y] = Q(s0 + ((s1 - s0) * i) / n, b0);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  for (let i = n; i >= 0; i--) {
    const [x, y] = Q(s0 + ((s1 - s0) * i) / n, b1);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/**
 * Everything that doesn't move, rendered once per size/theme into two layers:
 * bg1 is the ground (grid + ambient shadow) behind the emerging riders, bg2
 * is the belt that occludes them. Rebuilding these gradients and sampled
 * paths every frame is what made mobile scrolling stutter.
 */
function renderStaticLayers(
  cache: BgCache,
  pxW: number,
  pxH: number,
  dpr: number,
  proj: Proj,
  dark: boolean,
) {
  const { scale, cx, cy, P, Q } = proj;
  const w = pxW / dpr;
  const h = pxH / dpr;
  const grass = dark ? C_SAND_SUNSET : C_SAND;
  const grassSide = dark ? C_SAND_SIDE_SUNSET : C_SAND_SIDE;
  const road = dark ? C_ROAD_NIGHT : C_ROAD;
  const groundY = ROLL_R * scale;

  const layer = (c: HTMLCanvasElement): CanvasRenderingContext2D => {
    c.width = pxW;
    c.height = pxH;
    const lctx = c.getContext("2d")!;
    lctx.scale(dpr, dpr);
    return lctx;
  };

  // --- bg1: developer-mode ground grid + ambient belt shadow ---
  {
    const ctx = layer(cache.bg1);

    // Grid plane passes through the roller axles: the treadmill reads as
    // sliced in half by the floor, each wrap meeting the ground flush.
    const step = 42;
    const ext = 640;
    ctx.strokeStyle = "rgba(100,116,139,0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let a = -ext; a <= ext; a += step) {
      const [x0, y0] = P(a, -ext);
      const [x1, y1] = P(a, ext);
      ctx.moveTo(x0, y0 + groundY);
      ctx.lineTo(x1, y1 + groundY);
    }
    for (let b = -ext; b <= ext; b += step) {
      const [x0, y0] = P(-ext, b);
      const [x1, y1] = P(ext, b);
      ctx.moveTo(x0, y0 + groundY);
      ctx.lineTo(x1, y1 + groundY);
    }
    ctx.stroke();
    // Fade the grid (the only thing on this layer so far) with an elliptical
    // mask centered under the belt.
    ctx.save();
    ctx.globalCompositeOperation = "destination-in";
    ctx.translate(cx, cy + groundY * 0.7);
    ctx.scale(1, 0.58);
    const g = ctx.createRadialGradient(0, 0, 110 * scale, 0, 0, 330 * scale);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(0.6, "rgba(0,0,0,0.6)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(-w * 2, -h * 2, w * 4, h * 4);
    ctx.restore();

    // Soft ambient shadow from the belt footprint onto the ground plane.
    // The quad is drawn off-screen and only its blurred shadow is offset back
    // into place, so there is no hard fill edge anywhere.
    const m = 0; // no spread: the blur alone hugs the base (no halo)
    const aEnd = HALF_LEN + ROLL_R + m;
    const off = 10_000; // off-screen displacement (shadow offsets ignore CTM)
    ctx.save();
    ctx.shadowColor = "rgba(26,33,41,0.35)";
    ctx.shadowBlur = 10 * scale * dpr;
    ctx.shadowOffsetX = off * dpr;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    const corners: [number, number][] = [
      P(-aEnd, -HALF_WID - m),
      P(-aEnd, HALF_WID + m),
      P(aEnd, HALF_WID + m),
      P(aEnd, -HALF_WID - m),
    ];
    ctx.moveTo(corners[0]![0] - off, corners[0]![1] + groundY);
    for (let i = 1; i < corners.length; i++) {
      ctx.lineTo(corners[i]![0] - off, corners[i]![1] + groundY);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // --- bg2: the belt (both roller wraps, side face, flat top) ---
  {
    const ctx = layer(cache.bg2);

    // One roller wrap (dir +1 = near, -1 = far): surface bands shaded by a
    // smooth gradient from lit flat to the shadowed ground contact.
    const drawRoll = (dir: 1 | -1) => {
      // Near roller wraps a quarter turn down to the grid plane; the far
      // roller stops at its crest (nothing behind the silhouette is visible).
      const sFlat = dir * (HALF_LEN - 1);
      const sTerm = dir * (dir === 1 ? S_END : S_CREST);
      // Only the near wrap darkens toward the ground; the far lip (where
      // signs first appear) stays fully lit.
      const endF = dir === 1 ? 0.7 : 1;
      const bands: [number, number, RGB, number][] = [
        [-HALF_WID, HALF_WID, grass, 1],
        [-ROAD_HALF, ROAD_HALF, road, 1],
        [-(ROAD_HALF - 7) - 1.5, -(ROAD_HALF - 7) + 1.5, C_EDGE, 0.85],
        [ROAD_HALF - 7 - 1.5, ROAD_HALF - 7 + 1.5, C_EDGE, 0.85],
      ];
      const [gx0, gy0] = Q(dir * HALF_LEN, 0);
      const [gx1, gy1] = Q(sTerm, 0);
      for (const [b0, b1, color, alpha] of bands) {
        const g = ctx.createLinearGradient(gx0, gy0, gx1, gy1);
        const shadeRange = 1 - endF;
        g.addColorStop(0, shade(color, 1, alpha));
        g.addColorStop(0.2, shade(color, 1 - shadeRange * 0.104, alpha));
        g.addColorStop(0.4, shade(color, 1 - shadeRange * 0.352, alpha));
        g.addColorStop(0.6, shade(color, 1 - shadeRange * 0.648, alpha));
        g.addColorStop(0.8, shade(color, 1 - shadeRange * 0.896, alpha));
        g.addColorStop(1, shade(color, endF, alpha));
        ctx.fillStyle = g;
        bandPath(ctx, Q, sFlat, sTerm, b0, b1);
        ctx.fill();
      }
    };

    // Far roller wrap first (occludes emerging riders drawn beneath bg2).
    drawRoll(-1);

    // Belt side face: the cut face of the half-sliced body at b = +HALF_WID,
    // from the belt's top edge down to the ground line. Sampling the full
    // wrap at both ends traces the rollers' half-disc end caps, so each end
    // meets the grid flush; closePath is the straight ground-level edge.
    ctx.fillStyle = shade(grassSide, 1);
    ctx.beginPath();
    for (let s = -S_END; s < S_END; s += 6) {
      const [x, y] = Q(s, HALF_WID);
      if (s === -S_END) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    const [xEnd, yEnd] = Q(S_END, HALF_WID);
    ctx.lineTo(xEnd, yEnd);
    ctx.closePath();
    ctx.fill();

    // Flat top: grass, road, edge lines.
    poly(ctx, shade(grass, 1), [
      P(-HALF_LEN, -HALF_WID),
      P(-HALF_LEN, HALF_WID),
      P(HALF_LEN, HALF_WID),
      P(HALF_LEN, -HALF_WID),
    ]);
    poly(ctx, shade(road, 1), [
      P(-HALF_LEN, -ROAD_HALF),
      P(-HALF_LEN, ROAD_HALF),
      P(HALF_LEN, ROAD_HALF),
      P(HALF_LEN, -ROAD_HALF),
    ]);
    for (const b of [-(ROAD_HALF - 7), ROAD_HALF - 7]) {
      poly(ctx, shade(C_EDGE, 1, 0.85), [
        P(-HALF_LEN, b - 1.5),
        P(-HALF_LEN, b + 1.5),
        P(HALF_LEN, b + 1.5),
        P(HALF_LEN, b - 1.5),
      ]);
    }
    drawRoll(1);
  }
}

function draw(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  sprites: SpriteMap,
  t: number,
  cache: BgCache,
) {
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;
  const dark = document.documentElement.dataset.theme === "dark";
  const reducedContrast = document.documentElement.dataset.signContrast === "reduced";
  const proj = makeProj(w, h);
  const { scale, Q } = proj;

  const key = `${canvas.width}|${canvas.height}|${dark}`;
  if (cache.key !== key) {
    renderStaticLayers(cache, canvas.width, canvas.height, dpr, proj, dark);
    cache.key = key;
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  // 0. Ground plane (grid + ambient shadow), cached.
  ctx.drawImage(cache.bg1, 0, 0, w, h);

  const dist = t * SPEED;
  const period = DASH_LEN + DASH_GAP;
  const offset = ((dist % period) + period) % period;

  // --- riders (signs + plants) at belt coordinates ---
  const riders: Rider[] = [];
  const signSlots = 3;
  const signSpacing = BELT_SPAN / signSlots;
  for (let i = 0; i < signSlots; i++) {
    const travelled = dist + i * signSpacing;
    const lap = Math.floor(travelled / BELT_SPAN);
    const s = mod(travelled, BELT_SPAN) - BELT_SPAN / 2;
    const c = cross(s);
    if (c.theta >= THETA_HIDE) continue;
    riders.push({
      s,
      theta: c.theta,
      zone: c.zone,
      kind: "sign",
      idx: mod(i + lap * signSlots, CYCLE.length),
    });
  }
  const plantSlots = 4;
  const plantSpacing = BELT_SPAN / plantSlots;
  for (let i = 0; i < plantSlots; i++) {
    const travelled = dist + i * plantSpacing + 37;
    const s = mod(travelled, BELT_SPAN) - BELT_SPAN / 2;
    const c = cross(s);
    if (c.theta >= THETA_HIDE) continue;
    riders.push({ s, theta: c.theta, zone: c.zone, kind: "plant", idx: i });
  }

  const drawRider = (r: Rider) => {
    const phi = riderPhi(r.s, r.theta, r.zone);
    const lane = r.kind === "plant" ? PLANT_LANE : SIGN_LANE;
    // Shadow: none while cresting the far roller (it would land on empty
    // space behind the belt), ease in over the first flat stretch, and
    // fade out quickly as the rider starts to rotate over the near edge.
    let shadowFade = 0;
    if (r.zone === 0) shadowFade = Math.min(1, (r.s + HALF_LEN) / 40);
    else if (r.zone === 1) shadowFade = Math.max(0, 1 - r.theta * 3);
    const paint = () => {
      if (r.kind === "plant") {
        drawDesertPlant(ctx, Q(r.s, lane), scale, r.idx, phi, shadowFade, dark);
        return;
      }
      const sprite = sprites.get(r.idx);
      if (sprite) drawSign(ctx, Q(r.s, lane), sprite, scale, phi, shadowFade);
    };
    // Dissolve as riders tip over the near edge onto the grid, and fade in
    // symmetrically as they crest the far lip.
    let alpha = 1;
    if (r.zone === 1 && r.theta > THETA_FADE) {
      alpha = 1 - (r.theta - THETA_FADE) / (THETA_HIDE - THETA_FADE);
    } else if (r.zone === -1 && r.theta > THETA_CREST) {
      // Materialize while cresting the far lip.
      alpha = (0.9 - r.theta) / 0.45;
    }
    alpha = Math.max(0, Math.min(1, alpha));
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    paint();
    ctx.restore();
  };

  // 1. Far roller: emerging riders draw first so the belt lip occludes them.
  const farBehind = riders.filter((r) => r.zone === -1 && r.theta >= 0.5);
  farBehind.sort((a, b) => b.theta - a.theta);
  for (const r of farBehind) drawRider(r);

  // 2-3. The belt (wraps, side face, flat top), cached.
  ctx.drawImage(cache.bg2, 0, 0, w, h);

  // Center dashes ride the belt over both curves; they dim with the curve
  // shading and dissolve as they reach the terminal edges.
  for (let a = -S_CREST - period + offset; a < S_END; a += period) {
    const s0 = Math.max(a, -S_CREST);
    const s1 = Math.min(a + DASH_LEN, S_END);
    if (s1 <= s0) continue;
    const mid = (s0 + s1) / 2;
    const wrap = Math.max(0, Math.abs(mid) - HALF_LEN) / ROLL_R;
    const f = 0.45 + 0.55 * Math.max(0, Math.cos(wrap));
    const fade = Math.max(0, Math.min(1, (S_END - Math.abs(mid)) / 28));
    ctx.fillStyle = shade(C_DASH, f, fade);
    bandPath(ctx, Q, s0, s1, -1.8, 1.8);
    ctx.fill();
  }

  // 4. Riders on the flat and at the far lip, far to near.
  const upright = riders.filter(
    (r) => r.zone === 0 || (r.zone === -1 && r.theta < 0.5),
  );
  upright.sort((a, b) => a.s - b.s);
  for (const r of upright) drawRider(r);

  // 5. Near roller wrap with its terminal thickness band, then riders.
  const nearFront = riders.filter((r) => r.zone === 1);
  nearFront.sort((a, b) => a.s - b.s);
  for (const r of nearFront) drawRider(r);

  // Reduced-contrast lighting dims the complete scene without changing its palette.
  if (reducedContrast) {
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = "rgba(9,13,20,0.22)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
  }

  ctx.restore();
}

function drawSign(
  ctx: CanvasRenderingContext2D,
  [x, y]: [number, number],
  sprite: Sprite,
  scale: number,
  phi: number,
  shadowFade: number,
) {
  const sw = (sprite.front.width / RASTER_OVERSAMPLE) * scale;
  const sh = (sprite.front.height / RASTER_OVERSAMPLE) * scale;
  const poleH = POLE_H * scale;

  // Ground shadow: the sign's pre-blurred panel + pole silhouette laid flat
  // on the belt, cast backward along -U (sun high in front of the scene).
  // The caller controls shadowFade: delayed after cresting, gone once the
  // sign starts to rotate.
  if (shadowFade > 0.05) {
    const k = 0.3; // shadow length per unit of height (high sun = short)
    const kw = 0.75; // shadow width relative to the panel
    const pad = (SHADOW_PAD / RASTER_OVERSAMPLE) * scale;
    ctx.save();
    ctx.globalAlpha *= 0.2 * shadowFade;
    ctx.translate(x, y);
    // Local x (panel width) stays along V at kw size; local up projects
    // to -k * U.
    ctx.transform(kw * V[0], kw * V[1], k * U[0], k * U[1], 0, 0);
    ctx.drawImage(
      sprite.shadow,
      -sw / 2 - pad,
      -poleH - sh - pad,
      sw + pad * 2,
      sh + poleH + pad * 2,
    );
    ctx.restore();
  }

  const [a, b, c, d] = panelFrame(phi);
  // Negative determinant means the panel has rotated past edge-on and the
  // viewer sees its back.
  const facing = a * d - b * c >= 0;

  ctx.save();
  ctx.translate(x, y);
  ctx.transform(a, b, c, d, 0, 0);
  // Post is perpendicular to the belt, so it pitches with the panel.
  ctx.strokeStyle = "#8a939c";
  ctx.lineWidth = POLE_W * scale;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -poleH - sh * 0.12);
  ctx.stroke();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(facing ? sprite.front : sprite.back, -sw / 2, -poleH - sh, sw, sh);
  ctx.restore();
}

function drawPlantShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  variant: number,
  fade: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.transform(V[0], V[1], -U[0], -U[1], 0, 0);
  ctx.filter = `blur(${Math.max(0.35, r * 0.04)}px)`;
  const g = ctx.createLinearGradient(0, 0, 0, r * 3.3);
  g.addColorStop(0, `rgba(26,33,41,${0.26 * fade})`);
  g.addColorStop(0.65, `rgba(26,33,41,${0.13 * fade})`);
  g.addColorStop(1, "rgba(26,33,41,0)");

  if (variant % 2 === 0) {
    ctx.strokeStyle = g;
    ctx.lineWidth = r * 0.58;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, r * 3.1);
    ctx.moveTo(0, r * 1.4);
    ctx.lineTo(-r * 0.85, r * 1.4);
    ctx.lineTo(-r * 0.85, r * 2.15);
    ctx.moveTo(0, r * 1.85);
    ctx.lineTo(r * 0.8, r * 1.85);
    ctx.lineTo(r * 0.8, r * 2.5);
    ctx.stroke();
  } else {
    const leaves: [number, number, number][] = [
      [-1.25, 1.15, 0.48],
      [1.25, 1.15, 0.48],
      [-0.75, 1.65, 0.54],
      [0.75, 1.65, 0.54],
      [-0.3, 2.1, 0.58],
      [0.3, 2.1, 0.58],
    ];
    ctx.fillStyle = g;
    for (const [tipX, tipY, width] of leaves) {
      ctx.beginPath();
      ctx.moveTo(-r * width * 0.5, 0);
      ctx.quadraticCurveTo(
        r * (tipX * 0.45 - width * 0.35),
        r * tipY * 0.45,
        r * tipX,
        r * tipY,
      );
      ctx.quadraticCurveTo(
        r * (tipX * 0.45 + width * 0.35),
        r * tipY * 0.45,
        r * width * 0.5,
        0,
      );
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawDesertPlant(
  ctx: CanvasRenderingContext2D,
  [x, y]: [number, number],
  scale: number,
  variant: number,
  phi: number,
  shadowFade: number,
  dark: boolean,
) {
  const r = (6.5 + (variant % 3) * 1.25) * scale;
  if (shadowFade > 0.05) {
    drawPlantShadow(ctx, x, y, r, variant, shadowFade);
  }
  const [a, b, c, d] = panelFrame(phi);
  ctx.save();
  ctx.translate(x, y);
  ctx.transform(a, b, c, d, 0, 0);
  if (variant % 2 === 0) {
    ctx.strokeStyle = dark ? "#537d6e" : "#4f7a4f";
    ctx.lineWidth = r * 0.62;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -r * 3.1);
    ctx.moveTo(0, -r * 1.4);
    ctx.lineTo(-r * 0.85, -r * 1.4);
    ctx.lineTo(-r * 0.85, -r * 2.15);
    ctx.moveTo(0, -r * 1.85);
    ctx.lineTo(r * 0.8, -r * 1.85);
    ctx.lineTo(r * 0.8, -r * 2.5);
    ctx.stroke();

    ctx.strokeStyle = dark ? "#7aa28f" : "#77a36c";
    ctx.lineWidth = r * 0.1;
    ctx.beginPath();
    ctx.moveTo(-r * 0.14, -r * 0.25);
    ctx.lineTo(-r * 0.14, -r * 2.85);
    ctx.stroke();
  } else {
    const leaves: [number, number, number][] = [
      [-1.05, 1.25, 0.5],
      [1.05, 1.25, 0.5],
      [-0.72, 1.6, 0.56],
      [0.72, 1.6, 0.56],
      [-0.4, 1.9, 0.58],
      [0.4, 1.9, 0.58],
      [0, 2.2, 0.62],
    ];
    for (let i = 0; i < leaves.length; i++) {
      const [angle, length, width] = leaves[i]!;
      ctx.fillStyle = dark
        ? i % 2 ? "#6d9181" : "#5f8274"
        : i % 2 ? "#668b70" : "#557962";
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(-r * width * 0.5, 0);
      ctx.quadraticCurveTo(-r * width * 0.5, -r * length * 0.42, 0, -r * length);
      ctx.quadraticCurveTo(r * width * 0.5, -r * length * 0.42, r * width * 0.5, 0);
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
}

function poly(ctx: CanvasRenderingContext2D, fill: string, pts: [number, number][]) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(pts[0]![0], pts[0]![1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]![0], pts[i]![1]);
  ctx.closePath();
  ctx.fill();
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}
