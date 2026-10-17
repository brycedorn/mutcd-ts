import { defineSign } from "../core/types";
import { artRender } from "./artwork";
import { ART_R15_1 } from "./generated/artwork/R15-1";

/** R15-1 Grade Crossing crossbuck assembly, official 2024 artwork. */
export const R15_1 = /* @__PURE__ */ defineSign({
  code: "R15-1",
  name: "Grade Crossing (Crossbuck)",
  category: "regulatory",
  defaults: {},
  render: () => artRender(ART_R15_1),
});
