import { renderSVG, SIGNS } from "mutcd-ts";
import type { SignCode } from "mutcd-ts";
import { startHeroAnimation } from "./hero";
import { initTheme } from "./theme";
import {
  propControls,
  exampleSource,
  wireEditableExample,
  ENUM_HINTS,
} from "./controls";

initTheme();

document.getElementById("brand-title")!.innerHTML = renderSVG("D1-1", {
  lines: [{ name: "mutcd-ts", arrow: "right" }],
});

// --- install copy button ---
const copyBtn = document.getElementById("copy-install") as HTMLButtonElement;
copyBtn.onclick = async () => {
  await navigator.clipboard.writeText("npm install mutcd-ts");
  copyBtn.textContent = "Copied!";
  setTimeout(() => (copyBtn.textContent = "Copy"), 1400);
};

// --- hero animation ---
startHeroAnimation(document.getElementById("hero-canvas") as HTMLCanvasElement);

// --- sign preview grid ---
const PREVIEW: SignCode[] = [
  "R1-1",
  "R1-2",
  "R2-1",
  "R3-2",
  "R5-1",
  "R6-1",
  "R7-1",
  "W1-2",
  "W2-1",
  "W3-1",
  "W11-2",
  "W20-1",
  "M1-1",
  "M1-4",
  "S1-1",
  "D3-1",
];

const grid = document.getElementById("sign-grid")!;
for (const code of PREVIEW) {
  const cell = document.createElement("a");
  cell.className = "sign-cell";
  cell.href = `signs/${code}`;
  cell.title = SIGNS[code].name;
  const art = document.createElement("div");
  art.className = "sign-cell-art";
  art.innerHTML = renderSVG(code);
  const label = document.createElement("span");
  label.className = "code";
  label.textContent = code;
  cell.append(art, label);
  grid.appendChild(cell);
}

// --- playground ---
type Example = {
  code: SignCode;
  props: Record<string, unknown>;
  enums?: Record<string, string[]>;
  multiline?: boolean;
};

const EXAMPLES: Example[] = [
  { code: "R2-1", props: { speed: 45 } },
  {
    code: "D3-1",
    props: { name: "Wyngate", suffix: "Dr" },
    multiline: true,
  },
  {
    code: "R7-1",
    props: { lines: ["8:30 AM", "TO", "5:30 PM"], arrow: "right" },
    enums: { arrow: ["none", "left", "right", "both"] },
    multiline: true,
  },
  { code: "M1-1", props: { route: "80" } },
];

const tabs = document.getElementById("example-tabs")!;
const codeEl = document.getElementById("example-code")!;
const controlsEl = document.getElementById("example-controls")!;
const stageEl = document.getElementById("example-stage")!;
const exampleCopyBtn = document.getElementById("copy-example");

if (!(exampleCopyBtn instanceof HTMLButtonElement)) {
  throw new Error("Example copy button not found");
}

exampleCopyBtn.onclick = async () => {
  await navigator.clipboard.writeText(codeEl.textContent ?? "");
  exampleCopyBtn.textContent = "Copied!";
  setTimeout(() => (exampleCopyBtn.textContent = "Copy"), 1400);
};

let active = 0;

function renderStage() {
  const ex = EXAMPLES[active]!;
  try {
    stageEl.innerHTML = renderSVG(ex.code, ex.props as never);
  } catch (err) {
    stageEl.textContent = String(err);
  }
}

function exampleCode(): string {
  const ex = EXAMPLES[active]!;
  return exampleSource(ex.code, ex.props, ex.multiline ?? false);
}

function renderExample() {
  codeEl.innerHTML = exampleCode();
  renderStage();
}

codeEl.setAttribute("aria-label", "Editable renderSVG example");
wireEditableExample({
  codeEl,
  code: () => EXAMPLES[active]!.code,
  props: () => EXAMPLES[active]!.props,
  normalize: exampleCode,
  onApply: () => {
    renderStage();
    renderControls();
  },
});

function renderControls() {
  const ex = EXAMPLES[active]!;
  controlsEl.innerHTML = "";
  controlsEl.appendChild(
    propControls(ex.props, renderExample, { ...ENUM_HINTS, ...ex.enums }),
  );
}

for (let i = 0; i < EXAMPLES.length; i++) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = EXAMPLES[i]!.code;
  btn.className = i === active ? "active" : "";
  btn.onclick = () => {
    active = i;
    for (const b of tabs.children) b.classList.remove("active");
    btn.classList.add("active");
    renderControls();
    renderExample();
  };
  tabs.appendChild(btn);
}

renderControls();
renderExample();
