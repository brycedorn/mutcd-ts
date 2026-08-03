import { renderSVG, listSigns, SIGNS } from "mutcd-ts";
import type { SignCode } from "mutcd-ts";

document.getElementById("brand-title")!.innerHTML = renderSVG("D1-1", {
  lines: [{ name: "mutcd-ts", arrow: "right" }],
});

/** Options for union-typed props (runtime defaults can't express unions). */
const ENUM_HINTS: Record<string, string[]> = {
  direction: ["left", "right"],
  movement: ["left", "right", "straight"],
  arrow: ["none", "left", "right", "both"],
};

const CATEGORY_ORDER = ["regulatory", "warning", "guide", "marker", "school"];

const app = document.getElementById("app")!;
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
  app.appendChild(h2);
  const grid = document.createElement("div");
  grid.className = "grid";
  app.appendChild(grid);
  for (const sign of signs) grid.appendChild(card(sign.code as SignCode));
}

function card(code: SignCode): HTMLElement {
  const template = SIGNS[code];
  const props: Record<string, unknown> = structuredClone(template.defaults);
  const el = document.createElement("div");
  el.className = "card";
  const title = document.createElement("div");
  title.className = "title";
  title.innerHTML = `<code>${code}</code>${template.name}`;
  const stage = document.createElement("div");
  stage.className = "stage";
  const controls = document.createElement("div");
  controls.className = "controls";
  el.append(title, stage, controls);

  const update = () => {
    try {
      stage.innerHTML = renderSVG(code, props as never);
    } catch (err) {
      stage.textContent = String(err);
    }
  };

  for (const [key, value] of Object.entries(props)) {
    const label = document.createElement("label");
    label.textContent = key;
    let input: HTMLElement;
    if (ENUM_HINTS[key]) {
      const select = document.createElement("select");
      for (const opt of ENUM_HINTS[key]) {
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
    label.appendChild(input);
    controls.appendChild(label);
  }

  update();
  return el;
}
