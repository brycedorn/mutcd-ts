import { defineSign } from "../core/types";
import { COLORS } from "../core/colors";
import { fittedText } from "../core/text";
import { CHAIN_D } from "../font/series";
import { artNodes, artRender } from "./artwork";
import { ART_S1_1 } from "./generated/artwork/S1-1";
import { ART_S5_1 } from "./generated/artwork/S5-1";

export type SchoolProps = {
  /** Standard fluorescent yellow-green; false renders legacy yellow. */
  fluorescent: boolean;
};

/** S1-1 School. 36x36 pentagon, official 2024 artwork. */
export const S1_1 = /* @__PURE__ */ defineSign<SchoolProps>({
  code: "S1-1",
  name: "School",
  category: "school",
  defaults: { fluorescent: true },
  render: ({ fluorescent }) =>
    artRender(ART_S1_1, fluorescent ? {} : { fyg: "yellow" }),
});

export type SchoolSpeedProps = {
  /** Speed value in mph. */
  speed: number;
  /** Standard fluorescent yellow-green header; false renders legacy yellow. */
  fluorescent: boolean;
};

/** S5-1 School Speed Limit When Flashing. 24x48, parametric numerals. */
export const S5_1 = /* @__PURE__ */ defineSign<SchoolSpeedProps>({
  code: "S5-1",
  name: "School Speed Limit When Flashing",
  category: "school",
  defaults: { speed: 20, fluorescent: true },
  render: ({ speed, fluorescent }) => ({
    width: ART_S5_1.width,
    height: ART_S5_1.height,
    nodes: [
      ...artNodes(ART_S5_1, fluorescent ? {} : { fyg: "yellow" }),
      fittedText(String(speed), {
        fonts: CHAIN_D,
        height: 10,
        x: ART_S5_1.width / 2,
        y: 34,
        fill: COLORS.black,
        anchor: "middle",
        maxWidth: 20,
      }),
    ],
  }),
});
