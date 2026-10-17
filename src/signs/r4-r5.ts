import { defineSign } from "../core/types";
import { artRender } from "./artwork";
import { ART_R4_1 } from "./generated/artwork/R4-1";
import { ART_R4_7 } from "./generated/artwork/R4-7";
import { ART_R4_8 } from "./generated/artwork/R4-8";
import { ART_R5_1 } from "./generated/artwork/R5-1";
import { ART_R5_1a } from "./generated/artwork/R5-1a";
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

/** R4-8 Keep Left. 24x30, official 2024 artwork. */
export const R4_8 = /* @__PURE__ */ defineSign({
  code: "R4-8",
  name: "Keep Left",
  category: "regulatory",
  defaults: {},
  render: () => artRender(ART_R4_8),
});

/** R5-1 Do Not Enter. 30x30, official 2024 artwork. */
export const R5_1 = /* @__PURE__ */ defineSign({
  code: "R5-1",
  name: "Do Not Enter",
  category: "regulatory",
  defaults: {},
  render: () => artRender(ART_R5_1),
});

/** R5-1a Wrong Way. 30x18, official 2024 artwork. */
export const R5_1a = /* @__PURE__ */ defineSign({
  code: "R5-1a",
  name: "Wrong Way",
  category: "regulatory",
  defaults: {},
  render: () => artRender(ART_R5_1a),
});

/** R5-2 No Trucks. 24x24, official 2024 artwork. */
export const R5_2 = /* @__PURE__ */ defineSign({
  code: "R5-2",
  name: "No Trucks",
  category: "regulatory",
  defaults: {},
  render: () => artRender(ART_R5_2),
});
