import { defineSign } from "../core/types";
import { COLORS } from "../core/colors";
import { fittedText } from "../core/text";
import { CHAIN_D } from "../font/series";
import { artNodes, artLegendNodes } from "./artwork";
import { ART_R2_1 } from "./generated/artwork/R2-1";

export type SpeedLimitProps = {
  /** Speed value in mph. */
  speed: number;
};

/** R2-1 Speed Limit. 24x30 official blank + SPEED LIMIT; parametric numerals. */
export const R2_1 = /* @__PURE__ */ defineSign<SpeedLimitProps>({
  code: "R2-1",
  name: "Speed Limit",
  category: "regulatory",
  defaults: { speed: 50 },
  render: ({ speed }) => {
    const w = 24;
    const h = 30;
    return {
      width: w,
      height: h,
      nodes: [
        ...artNodes(ART_R2_1),
        // The artwork legend is the official "50"; other speeds use the font.
        ...(speed === 50
          ? artLegendNodes(ART_R2_1)
          : [
              fittedText(String(speed), {
                fonts: CHAIN_D,
                height: 10,
                x: w / 2,
                y: 26,
                fill: COLORS.black,
                anchor: "middle",
                maxWidth: 20,
              }),
            ]),
      ],
    };
  },
});
