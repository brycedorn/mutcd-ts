// Shared between the signs gallery/detail and the homepage playground:
// prop-input builders and the highlighted renderSVG example source.
import { renderSVG } from "mutcd-ts";
import type { SignCode } from "mutcd-ts";

/** Options for union-typed props (runtime defaults can't express unions). */
export const ENUM_HINTS: Record<string, string[]> = {
  direction: ["left", "right"],
  movement: ["left", "right", "straight"],
  arrow: ["none", "left", "right", "both"],
};

/**
 * Inputs for every entry in `props`, mutating it and calling `update` on
 * change. Returns a fragment of `<label>key<span.control-input>…</span></label>`
 * rows; the caller supplies the container (and with it the styling).
 */
export function propControls(
  props: Record<string, unknown>,
  update: () => void,
  enums: Record<string, string[]> = ENUM_HINTS,
): DocumentFragment {
  const frag = document.createDocumentFragment();
  for (const [key, value] of Object.entries(props)) {
    const label = document.createElement("label");
    label.textContent = key;
    let input: HTMLElement;
    if (enums[key]) {
      const select = document.createElement("select");
      for (const opt of enums[key]) {
        const o = document.createElement("option");
        o.value = opt;
        o.textContent = opt;
        o.selected = opt === value;
        select.appendChild(o);
      }
      select.onchange = () => {
        props[key] = select.value;
        update();
      };
      input = select;
    } else if (typeof value === "boolean") {
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = value;
      cb.onchange = () => {
        props[key] = cb.checked;
        update();
      };
      input = cb;
    } else if (typeof value === "number") {
      const num = document.createElement("input");
      num.type = "number";
      num.value = String(value);
      num.oninput = () => {
        props[key] = Number(num.value) || 0;
        update();
      };
      input = num;
    } else if (Array.isArray(value)) {
      const txt = document.createElement("input");
      txt.type = "text";
      txt.value = JSON.stringify(value);
      txt.oninput = () => {
        try {
          props[key] = JSON.parse(txt.value);
          update();
        } catch {
          // Ignore until the JSON parses.
        }
      };
      input = txt;
    } else {
      const txt = document.createElement("input");
      txt.type = "text";
      txt.value = String(value);
      txt.oninput = () => {
        props[key] = txt.value;
        update();
      };
      input = txt;
    }
    const inputSlot = document.createElement("span");
    inputSlot.className = "control-input";
    inputSlot.appendChild(input);
    label.appendChild(inputSlot);
    frag.appendChild(label);
  }
  return frag;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Rendered-text length of highlighted markup (tags stripped). */
function plainLength(html: string): number {
  return html.replace(/<[^>]+>/g, "").length;
}

function fmtValue(value: unknown, indent = 1): string {
  if (typeof value === "string") {
    return `<span class="tok-str">"${escapeHtml(value)}"</span>`;
  }
  if (typeof value === "number") return `<span class="tok-num">${value}</span>`;
  if (typeof value === "boolean") return `<span class="tok-kw">${value}</span>`;
  if (Array.isArray(value)) {
    const oneLine = `[${value.map((v) => fmtValue(v, indent)).join(", ")}]`;
    if (plainLength(oneLine) <= 40) return oneLine;
    const pad = "  ".repeat(indent + 1);
    const items = value.map((v) => pad + fmtValue(v, indent + 1)).join(",\n");
    return `[\n${items},\n${"  ".repeat(indent)}]`;
  }
  if (value && typeof value === "object") {
    const inner = Object.entries(value)
      .map(([k, v]) => `${k}: ${fmtValue(v, indent)}`)
      .join(", ");
    return `{ ${inner} }`;
  }
  return String(value);
}

/**
 * Highlighted import + renderSVG snippet (innerHTML). Props format one line
 * when short; `multiline` forces the choice.
 */
export function exampleSource(
  code: SignCode,
  props: Record<string, unknown>,
  multiline?: boolean,
): string {
  const parts = Object.entries(props).map(([k, v]) => `${k}: ${fmtValue(v)}`);
  let call = `(<span class="tok-str">"${code}"</span>)`;
  if (parts.length > 0) {
    const oneLine = `{ ${parts.join(", ")} }`;
    // Wrap when the whole `const svg = renderSVG("CODE", {...});` line runs
    // long; length checks use rendered text, not the highlight markup.
    const callLen = plainLength(oneLine) + code.length + 27;
    const wrap = multiline ?? (callLen > 60 || oneLine.includes("\n"));
    const propsSrc = wrap ? `{\n  ${parts.join(",\n  ")},\n}` : oneLine;
    call = `(<span class="tok-str">"${code}"</span>, ${propsSrc})`;
  }
  return (
    `<span class="tok-kw">import</span> { renderSVG } ` +
    `<span class="tok-kw">from</span> <span class="tok-str">"mutcd-ts"</span>;\n\n` +
    `<span class="tok-kw">const</span> svg = <span class="tok-fn">renderSVG</span>${call};`
  );
}

/**
 * Parse a (possibly user-edited) example snippet back into a props object.
 * Returns null while the text isn't a valid `renderSVG("CODE", {...})` call.
 */
/**
 * Make an example code block editable: typed edits that parse and render
 * cleanly replace the contents of `props()` and fire `onApply` (which should
 * re-render the sign and rebuild the prop inputs, but leave the code text as
 * typed so the caret stays put). Blur restores `normalize()`'s highlighting.
 */
export function wireEditableExample(opts: {
  codeEl: HTMLElement;
  code: () => SignCode;
  props: () => Record<string, unknown>;
  normalize: () => string;
  onApply: () => void;
}): void {
  const { codeEl } = opts;
  // Prefer plaintext-only (Chrome/Safari) so pasted markup can't land in
  // the tree; Firefox throws on it and falls back to "true".
  try {
    codeEl.contentEditable = "plaintext-only";
  } catch {
    codeEl.contentEditable = "true";
  }
  codeEl.spellcheck = false;
  codeEl.addEventListener("input", () => {
    const parsed = parseExample(codeEl.textContent ?? "");
    if (!parsed) return;
    try {
      renderSVG(opts.code(), parsed as never);
    } catch {
      return; // Mid-edit props; keep the last good render.
    }
    const props = opts.props();
    for (const key of Object.keys(props)) delete props[key];
    Object.assign(props, parsed);
    opts.onApply();
  });
  codeEl.addEventListener("blur", () => {
    codeEl.innerHTML = opts.normalize();
  });
}

export function parseExample(text: string): Record<string, unknown> | null {
  const m = text.match(
    /renderSVG\(\s*["'][\w-]+["']\s*(?:,\s*([\s\S]*?))?\)\s*;?\s*$/,
  );
  if (!m) return null;
  if (!m[1]) return {};
  try {
    // The snippet is a JS object literal (unquoted keys), not JSON; evaluate
    // it. This is the user's own browser evaluating their own typed input.
    const value = new Function(`"use strict"; return (${m[1]});`)() as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
  } catch {
    return null;
  }
}
