import { defineSign } from "../core/types";
import { COLORS } from "../core/colors";
import { el } from "../core/svg";
import { panel } from "../core/shapes";
import { text } from "../core/text";
import { seriesD } from "../font/series";
import { upArrowPath } from "../symbols/arrows";
import { artRender } from "./artwork";
import { ART_R3_1 } from "./generated/artwork/R3-1";
import { ART_R3_2 } from "./generated/artwork/R3-2";
import { ART_R3_3 } from "./generated/artwork/R3-3";
import { ART_R3_4 } from "./generated/artwork/R3-4";
import { ART_R3_5_L, ART_R3_5_R } from "./generated/artwork/R3-5";

/** R3-1 No Right Turn, R3-2 No Left Turn, R3-4 No U-Turn. Official artwork. */
export const R3_1 = /* @__PURE__ */ defineSign({
  code: "R3-1",
  name: "No Right Turn",
  category: "regulatory",
  defaults: {},
  render: () => artRender(ART_R3_1),
});

export const R3_2 = /* @__PURE__ */ defineSign({
  code: "R3-2",
  name: "No Left Turn",
  category: "regulatory",
  defaults: {},
  render: () => artRender(ART_R3_2),
});

export const R3_4 = /* @__PURE__ */ defineSign({
  code: "R3-4",
  name: "No U-Turn",
  category: "regulatory",
  defaults: {},
  render: () => artRender(ART_R3_4),
});

/** R3-3 No Turns. 24x24 word message, official artwork. */
export const R3_3 = /* @__PURE__ */ defineSign({
  code: "R3-3",
  name: "No Turns",
  category: "regulatory",
  defaults: {},
  render: () => artRender(ART_R3_3),
});

export type LaneUseProps = {
  /** Which movement the lane requires. */
  movement: "left" | "right" | "straight";
};

/** R3-5 Mandatory Movement Lane Control. 30x36, arrow + ONLY. */
export const R3_5 = /* @__PURE__ */ defineSign<LaneUseProps>({
  code: "R3-5",
  name: "Mandatory Movement Lane Control",
  category: "regulatory",
  defaults: { movement: "left" },
  render: ({ movement }) => {
    if (movement !== "straight") {
      return artRender(movement === "left" ? ART_R3_5_L : ART_R3_5_R);
    }
    // Through-only (R3-5a) variant stays procedural: no official artwork source.
    const w = 30;
    const h = 36;
    const box = 16;
    const d = upArrowPath({
      width: box,
      height: box,
      shaft: box * 0.18,
      headLength: box * 0.3,
      headWidth: box * 0.42,
    });
    return {
      width: w,
      height: h,
      nodes: [
        ...panel(w, h, {
          bg: COLORS.white,
          border: COLORS.black,
          borderWidth: 0.75,
          radius: 1.875,
          indent: 0.5,
        }),
        el("path", { d, fill: COLORS.black, transform: `translate(${(w - box) / 2} 4)` }),
        text("ONLY", {
          font: seriesD,
          height: 6,
          x: w / 2,
          y: 30.5,
          fill: COLORS.black,
          anchor: "middle",
        }),
      ],
    };
  },
});
