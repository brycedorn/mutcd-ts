// Shared between the signs gallery/detail and the homepage playground:
// prop-input builders and the highlighted renderSVG example source.
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

function fmtValue(value: unknown): string {
  if (typeof value === "string") {
    return `<span class="tok-str">"${escapeHtml(value)}"</span>`;
  }
  if (typeof value === "number") return `<span class="tok-num">${value}</span>`;
  if (typeof value === "boolean") return `<span class="tok-kw">${value}</span>`;
  if (Array.isArray(value)) return `[${value.map(fmtValue).join(", ")}]`;
  if (value && typeof value === "object") {
    const inner = Object.entries(value)
      .map(([k, v]) => `${k}: ${fmtValue(v)}`)
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
    // Length check against the rendered text, not the highlight markup.
    const plain = oneLine.replace(/<[^>]+>/g, "");
    const wrap = multiline ?? plain.length > 44;
    const propsSrc = wrap ? `{\n  ${parts.join(",\n  ")},\n}` : oneLine;
    call = `(<span class="tok-str">"${code}"</span>, ${propsSrc})`;
  }
  return (
    `<span class="tok-kw">import</span> { renderSVG } ` +
    `<span class="tok-kw">from</span> <span class="tok-str">"mutcd-ts"</span>;\n\n` +
    `<span class="tok-kw">const</span> svg = <span class="tok-fn">renderSVG</span>${call};`
  );
}
