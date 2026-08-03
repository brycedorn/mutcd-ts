import { defineSign } from "../core/types";
import { artRender } from "./artwork";
import { ART_W2_1 } from "./generated/artwork/W2-1";
import { ART_W2_2_L, ART_W2_2_R } from "./generated/artwork/W2-2";
import { ART_W2_4 } from "./generated/artwork/W2-4";
import { ART_W2_5 } from "./generated/artwork/W2-5";
import { ART_W3_1 } from "./generated/artwork/W3-1";
import { ART_W3_2 } from "./generated/artwork/W3-2";
import { ART_W3_3 } from "./generated/artwork/W3-3";
import type { DirectionProps } from "./w1";

/** W2-1 Crossroad. Official 2024 artwork. */
export const W2_1 = defineSign({
  code: "W2-1",
  name: "Crossroad",
  category: "warning",
  defaults: {},
  render: () => artRender(ART_W2_1),
});

/** W2-2 Side Road (perpendicular). Official 2024 artwork per direction. */
export const W2_2 = defineSign<DirectionProps>({
  code: "W2-2",
  name: "Side Road",
  category: "warning",
  defaults: { direction: "right" },
  render: ({ direction }) =>
    artRender(direction === "right" ? ART_W2_2_R : ART_W2_2_L),
});

/** W2-4 T-Intersection. Official 2024 artwork. */
export const W2_4 = defineSign({
  code: "W2-4",
  name: "T-Intersection",
  category: "warning",
  defaults: {},
  render: () => artRender(ART_W2_4),
});

/** W2-5 Y-Intersection. Official 2024 artwork. */
export const W2_5 = defineSign({
  code: "W2-5",
  name: "Y-Intersection",
  category: "warning",
  defaults: {},
  render: () => artRender(ART_W2_5),
});

/** W3-1 Stop Ahead. Official 2024 artwork. */
export const W3_1 = defineSign({
  code: "W3-1",
  name: "Stop Ahead",
  category: "warning",
  defaults: {},
  render: () => artRender(ART_W3_1),
});

/** W3-2 Yield Ahead. Official 2024 artwork. */
export const W3_2 = defineSign({
  code: "W3-2",
  name: "Yield Ahead",
  category: "warning",
  defaults: {},
  render: () => artRender(ART_W3_2),
});

/** W3-3 Signal Ahead. Official 2024 artwork. */
export const W3_3 = defineSign({
  code: "W3-3",
  name: "Signal Ahead",
  category: "warning",
  defaults: {},
  render: () => artRender(ART_W3_3),
});
