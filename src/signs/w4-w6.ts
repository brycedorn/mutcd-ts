import { defineSign } from "../core/types";
import { artRender } from "./artwork";
import type { SignArt } from "./artwork";
import type { DirectionProps } from "./w1";
import { ART_W4_1_L, ART_W4_1_R } from "./generated/artwork/W4-1";
import { ART_W4_2_L, ART_W4_2_R } from "./generated/artwork/W4-2";
import { ART_W5_1 } from "./generated/artwork/W5-1";
import { ART_W5_2 } from "./generated/artwork/W5-2";
import { ART_W6_1 } from "./generated/artwork/W6-1";
import { ART_W6_2 } from "./generated/artwork/W6-2";
import { ART_W6_3 } from "./generated/artwork/W6-3";

function directional(
  code: string,
  name: string,
  left: SignArt,
  right: SignArt,
) {
  return defineSign<DirectionProps>({
    code,
    name,
    category: "warning",
    defaults: { direction: "right" },
    render: ({ direction }) => artRender(direction === "left" ? left : right),
  });
}

/** W4-1 Merge, official 2024 artwork per direction. */
export const W4_1 = /* @__PURE__ */ directional(
  "W4-1",
  "Merge",
  ART_W4_1_L,
  ART_W4_1_R,
);

/** W4-2 Lane Ends, official 2024 artwork per direction. */
export const W4_2 = /* @__PURE__ */ directional(
  "W4-2",
  "Lane Ends",
  ART_W4_2_L,
  ART_W4_2_R,
);

/** W5-1 Road Narrows, official 2024 artwork. */
export const W5_1 = /* @__PURE__ */ defineSign({
  code: "W5-1",
  name: "Road Narrows",
  category: "warning",
  defaults: {},
  render: () => artRender(ART_W5_1),
});

/** W5-2 Narrow Bridge, official 2024 artwork. */
export const W5_2 = /* @__PURE__ */ defineSign({
  code: "W5-2",
  name: "Narrow Bridge",
  category: "warning",
  defaults: {},
  render: () => artRender(ART_W5_2),
});

/** W6-1 Divided Highway, official 2024 artwork. */
export const W6_1 = /* @__PURE__ */ defineSign({
  code: "W6-1",
  name: "Divided Highway",
  category: "warning",
  defaults: {},
  render: () => artRender(ART_W6_1),
});

/** W6-2 Divided Highway Ends, official 2024 artwork. */
export const W6_2 = /* @__PURE__ */ defineSign({
  code: "W6-2",
  name: "Divided Highway Ends",
  category: "warning",
  defaults: {},
  render: () => artRender(ART_W6_2),
});

/** W6-3 Two-Way Traffic, official 2024 artwork. */
export const W6_3 = /* @__PURE__ */ defineSign({
  code: "W6-3",
  name: "Two-Way Traffic",
  category: "warning",
  defaults: {},
  render: () => artRender(ART_W6_3),
});
