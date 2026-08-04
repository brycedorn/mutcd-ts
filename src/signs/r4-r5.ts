import { defineSign } from "../core/types";
import { artRender } from "./artwork";
import { ART_R4_1 } from "./generated/artwork/R4-1";
import { ART_R4_7 } from "./generated/artwork/R4-7";
import { ART_R5_1 } from "./generated/artwork/R5-1";
import { ART_R5_2 } from "./generated/artwork/R5-2";

/** R4-1 Do Not Pass. 24x30, official 2024 artwork. */
export const R4_1 = /* @__PURE__ */ defineSign({
  code: "R4-1",
  name: "Do Not Pass",
  category: "regulatory",
  defaults: {},
  render: () => artRender(ART_R4_1),
});

/** R4-7 Keep Right. 24x30, official 2024 artwork. */
export const R4_7 = /* @__PURE__ */ defineSign({
  code: "R4-7",
  name: "Keep Right",
  category: "regulatory",
  defaults: {},
  render: () => artRender(ART_R4_7),
});

/** R5-1 Do Not Enter. 30x30, official 2024 artwork. */
export const R5_1 = /* @__PURE__ */ defineSign({
  code: "R5-1",
  name: "Do Not Enter",
  category: "regulatory",
  defaults: {},
  render: () => artRender(ART_R5_1),
});

/** R5-2 No Trucks. 24x24, official 2024 artwork. */
export const R5_2 = /* @__PURE__ */ defineSign({
  code: "R5-2",
  name: "No Trucks",
  category: "regulatory",
  defaults: {},
  render: () => artRender(ART_R5_2),
});
