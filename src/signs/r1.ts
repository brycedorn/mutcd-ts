import { defineSign } from "../core/types";
import { artRender } from "./artwork";
import { ART_R1_1 } from "./generated/artwork/R1-1";
import { ART_R1_2 } from "./generated/artwork/R1-2";

/** R1-1 Stop. 30x30 octagon, official 2024 artwork. */
export const R1_1 = /* @__PURE__ */ defineSign({
  code: "R1-1",
  name: "Stop",
  category: "regulatory",
  defaults: {},
  render: () => artRender(ART_R1_1),
});

/** R1-2 Yield. 36" point-down triangle, official 2024 artwork. */
export const R1_2 = /* @__PURE__ */ defineSign({
  code: "R1-2",
  name: "Yield",
  category: "regulatory",
  defaults: {},
  render: () => artRender(ART_R1_2),
});
