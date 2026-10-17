import { defineSign } from "../core/types";
import { artRender } from "./artwork";
import { ART_W8_1 } from "./generated/artwork/W8-1";
import { ART_W8_5 } from "./generated/artwork/W8-5";
import { ART_W10_1 } from "./generated/artwork/W10-1";

/** W8-1 Bump, official 2024 artwork. */
export const W8_1 = /* @__PURE__ */ defineSign({
  code: "W8-1",
  name: "Bump",
  category: "warning",
  defaults: {},
  render: () => artRender(ART_W8_1),
});

/** W8-5 Slippery When Wet, official 2024 artwork. */
export const W8_5 = /* @__PURE__ */ defineSign({
  code: "W8-5",
  name: "Slippery When Wet",
  category: "warning",
  defaults: {},
  render: () => artRender(ART_W8_5),
});

/** W10-1 Grade Crossing Advance Warning, official 2024 artwork. */
export const W10_1 = /* @__PURE__ */ defineSign({
  code: "W10-1",
  name: "Grade Crossing Advance Warning",
  category: "warning",
  defaults: {},
  render: () => artRender(ART_W10_1),
});
