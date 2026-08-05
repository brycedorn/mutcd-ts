import { renderSVG, listSigns, SIGNS } from "mutcd-ts";
import type { SignCode } from "mutcd-ts";
import { initTheme } from "./theme";
import { propControls, exampleSource, wireEditableExample } from "./controls";

initTheme();

document.getElementById("brand-title")!.innerHTML = renderSVG("D1-1", {
  lines: [{ name: "mutcd-ts", arrow: "left" }],
});

const CATEGORY_ORDER = ["regulatory", "warning", "guide", "marker", "school"];

// --- routing: signs/ is the gallery, signs/<CODE> the single-sign detail.
// In-app navigation uses pushState so back/forward never reloads; direct
// loads hit per-sign static pages generated at build time.

function parseRoute(): { base: string; code: SignCode | null } {
  const path = location.pathname.replace(/index\.html$/, "");
  const m = path.match(/^(.*\/signs)(?:\/([A-Za-z0-9-]+)\/?|\/?)$/);
  if (!m) return { base: path.replace(/\/$/, ""), code: null };
  const code = (m[2] ?? "").toUpperCase();
  return { base: m[1]!, code: code in SIGNS ? (code as SignCode) : null };
}

/** Gallery URL, without a trailing slash. */
function galleryHref(): string {
  return parseRoute().base;
}

function detailHref(code: SignCode): string {
  return `${parseRoute().base}/${code}`;
}

/** True once the user has navigated in-app; gates focus management. */
let navigated = false;

function navigate(href: string): void {
  navigated = true;
  history.pushState({}, "", href);
  route();
  window.scrollTo(0, 0);
}

/** Left-click navigates in-app; modified clicks keep browser behavior. */
function intercept(a: HTMLAnchorElement): (e: MouseEvent) => void {
  return (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    navigate(a.href);
  };
}

// --- views ---

const galleryHeader = document.querySelector<HTMLElement>(".gallery-header")!;
const galleryEl = document.getElementById("app")!;
const detailEl = document.createElement("main");
detailEl.className = "gallery detail";
detailEl.hidden = true;
galleryEl.after(detailEl);

/** Move screen-reader/keyboard context to the new view's heading. */
function focusHeading(el: HTMLElement | null): void {
  if (!navigated || !el) return;
  el.tabIndex = -1;
  el.focus({ preventScroll: true });
}

function route(): void {
  const { code } = parseRoute();
  if (code) {
    galleryEl.hidden = true;
    galleryHeader.hidden = true;
    detailEl.hidden = false;
    document.title = `mutcd-ts | ${code}`;
    buildDetail(code);
    focusHeading(detailEl.querySelector("h1"));
  } else {
    detailEl.hidden = true;
    detailEl.innerHTML = "";
    galleryEl.hidden = false;
    galleryHeader.hidden = false;
    document.title = "mutcd-ts";
    focusHeading(galleryHeader.querySelector("h1"));
  }
}

window.addEventListener("popstate", () => {
  navigated = true;
  route();
});

// The nav "Signs" link ships as "./" in the static HTML, which on a detail
// deep link points at the detail page itself; retarget it to the gallery
// and route in-app.
const navSigns = document.querySelector<HTMLAnchorElement>(
  '.nav-links a[aria-current="page"]',
);
if (navSigns) {
  navSigns.href = galleryHref();
  navSigns.onclick = intercept(navSigns);
}

// The brand and Home links ship as "../", which resolves one level too deep
// once pushState moves the URL to signs/<CODE>; pin them to the site root.
const homeHref = parseRoute().base.replace(/signs$/, "");
for (const a of document.querySelectorAll<HTMLAnchorElement>(
  '.brand, .nav-links a[href="../"]',
)) {
  a.href = homeHref;
}

// --- gallery (built once; hidden while a detail route is active) ---

const byCategory = new Map<string, ReturnType<typeof listSigns>>();
for (const sign of listSigns()) {
  const list = byCategory.get(sign.category) ?? [];
  list.push(sign);
  byCategory.set(sign.category, list);
}

for (const category of CATEGORY_ORDER) {
  const signs = byCategory.get(category);
  if (!signs) continue;
  const h2 = document.createElement("h2");
  h2.className = "category";
  h2.textContent = category;
  galleryEl.appendChild(h2);
  const grid = document.createElement("div");
  grid.className = "grid";
  galleryEl.appendChild(grid);
  for (const sign of signs) grid.appendChild(card(sign.code as SignCode));
}

route();

function card(code: SignCode): HTMLElement {
  const template = SIGNS[code];
  const props: Record<string, unknown> = structuredClone(template.defaults);
  const el = document.createElement("div");
  el.className = "card";
  const title = document.createElement("div");
  title.className = "title";
  const link = document.createElement("a");
  link.className = "card-link";
  link.href = detailHref(code);
  link.innerHTML = `<code>${code}</code>${template.name}`;
  link.onclick = intercept(link);
  title.appendChild(link);
  const stage = document.createElement("div");
  stage.className = "stage";
  el.append(title, stage);

  // The whole card navigates, except the prop controls (and the title link,
  // which handles itself and keeps native modified-click behavior).
  el.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    if (t.closest(".controls") || t.closest("a")) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    navigate(link.href);
  });

  const update = () => {
    try {
      stage.innerHTML = renderSVG(code, props as never);
    } catch (err) {
      stage.textContent = String(err);
    }
  };

  el.appendChild(controlsBox(props, update));
  update();
  return el;
}

function controlsBox(props: Record<string, unknown>, update: () => void): HTMLElement {
  const box = document.createElement("div");
  box.className = "controls";
  box.appendChild(propControls(props, update));
  return box;
}

// --- sign detail ---

function buildDetail(code: SignCode): void {
  const template = SIGNS[code];
  const props: Record<string, unknown> = structuredClone(template.defaults);
  detailEl.innerHTML = "";

  const back = document.createElement("a");
  back.className = "back-link";
  back.href = galleryHref();
  back.textContent = "\u2190 All signs";
  back.onclick = intercept(back);

  const head = document.createElement("div");
  head.className = "detail-head";
  const h1 = document.createElement("h1");
  h1.innerHTML = `<code>${code}</code>${template.name}`;
  const cat = document.createElement("span");
  cat.className = "detail-category";
  cat.textContent = template.category;
  head.append(h1, cat);

  const grid = document.createElement("div");
  grid.className = "detail-grid";
  const stage = document.createElement("div");
  stage.className = "detail-stage";
  const side = document.createElement("div");
  side.className = "detail-side";
  grid.append(stage, side);

  const wrap = document.createElement("div");
  wrap.className = "codeblock-wrap";
  const pre = document.createElement("pre");
  pre.className = "codeblock";
  const codeEl = document.createElement("code");
  codeEl.setAttribute("aria-label", `Editable renderSVG example for ${code}`);
  pre.appendChild(codeEl);
  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "code-copy";
  copy.textContent = "Copy";
  copy.onclick = async () => {
    await navigator.clipboard.writeText(codeEl.textContent ?? "");
    copy.textContent = "Copied!";
    setTimeout(() => (copy.textContent = "Copy"), 1400);
  };
  wrap.append(pre, copy);

  const renderStage = () => {
    try {
      stage.innerHTML = renderSVG(code, props as never);
    } catch (err) {
      stage.textContent = String(err);
    }
  };

  // From the prop inputs: re-render and rewrite the (unfocused) code block.
  const update = () => {
    renderStage();
    codeEl.innerHTML = exampleSource(code, props);
  };

  let controls = controlsBox(props, update);

  wireEditableExample({
    codeEl,
    code: () => code,
    props: () => props,
    normalize: () => exampleSource(code, props),
    onApply: () => {
      renderStage();
      const fresh = controlsBox(props, update);
      controls.replaceWith(fresh);
      controls = fresh;
    },
  });

  side.appendChild(wrap);
  side.appendChild(controls);
  detailEl.append(back, head, grid);
  update();
}
