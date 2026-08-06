import { renderSVG } from "mutcd-ts";
import type { SignCode } from "mutcd-ts";
import { initTheme } from "./theme";

initTheme();

document.getElementById("brand-title")!.innerHTML = renderSVG("D1-1", {
  lines: [{ name: "mutcd-ts", arrow: "left" }],
});

const signs: Array<[string, SignCode]> = [
  ["fidelity-sign-r1-1", "R1-1"],
  ["fidelity-sign-r11-2", "R11-2"],
  ["fidelity-sign-w13-1p", "W13-1P"],
  ["fidelity-sign-w11-1", "W11-1"],
];

for (const [id, code] of signs) {
  document.getElementById(id)!.innerHTML = renderSVG(code);
}
