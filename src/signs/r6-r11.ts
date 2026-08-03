import { defineSign } from "../core/types";
import { COLORS } from "../core/colors";
import { textStack, fittedText } from "../core/text";
import { arrow } from "../symbols/arrows";
import { artRender, artNodes, artLegendNodes } from "./artwork";
import { ART_R6_1_L, ART_R6_1_R } from "./generated/artwork/R6-1";
import { ART_R6_2_L, ART_R6_2_R } from "./generated/artwork/R6-2";
import { ART_R7_1 } from "./generated/artwork/R7-1";
import { ART_R8_3 } from "./generated/artwork/R8-3";
import { ART_R10_11 } from "./generated/artwork/R10-11";
import { ART_R11_2 } from "./generated/artwork/R11-2";

export type OneWayProps = {
  direction: "left" | "right";
};

/** R6-1 One Way (horizontal). 36x12, official 2024 artwork per direction. */
export const R6_1 = defineSign<OneWayProps>({
  code: "R6-1",
  name: "One Way",
  category: "regulatory",
  defaults: { direction: "right" },
  render: ({ direction }) =>
    artRender(direction === "right" ? ART_R6_1_R : ART_R6_1_L),
});

/** R6-2 One Way (vertical). 18x24, official 2024 artwork per direction. */
export const R6_2 = defineSign<OneWayProps>({
  code: "R6-2",
  name: "One Way (vertical)",
  category: "regulatory",
  defaults: { direction: "right" },
  render: ({ direction }) =>
    artRender(direction === "right" ? ART_R6_2_R : ART_R6_2_L),
});

export type NoParkingProps = {
  /** Legend lines below "NO PARKING", e.g. ["8:30 AM", "TO", "5:30 PM"]. */
  lines: string[];
  arrow: "left" | "right" | "both" | "none";
};

/** R7-1 style No Parking: official blank + NO PARKING; parametric times/arrow. */
export const R7_1 = defineSign<NoParkingProps>({
  code: "R7-1",
  name: "No Parking (times)",
  category: "regulatory",
  defaults: { lines: ["ANY", "TIME"], arrow: "none" },
  render: ({ lines, arrow: arrowDir }) => {
    const w = 12;
    const h = 18;
    // Two lines follow official ANY TIME metrics; longer stacks shrink to
    // fit between PARKING (ends 8.75) and the arrow row / border.
    const zoneTop = 9.375;
    const zoneBottom = arrowDir === "none" ? 16.9 : 14.4;
    let lineH = 2;
    let gap = 0.625;
    if (lines.length > 2) {
      lineH = Math.min(2, (zoneBottom - zoneTop) / (lines.length + 0.3 * (lines.length - 1)));
      gap = 0.3 * lineH;
    }
    const nodes = [
      ...artNodes(ART_R7_1),
      ...textStack(
        lines.map((t) => ({ text: t, height: lineH })),
        { cx: w / 2, top: zoneTop, gap, fill: COLORS.red, series: "C" },
      ),
    ];
    if (arrowDir !== "none") {
      const y = 15.5;
      if (arrowDir === "both") {
        nodes.push(
          arrow(w / 2 - 3, y, 180, COLORS.red, { length: 4, shaft: 0.7, headLength: 1.5, headWidth: 2 }),
          arrow(w / 2 + 3, y, 0, COLORS.red, { length: 4, shaft: 0.7, headLength: 1.5, headWidth: 2 }),
        );
      } else {
        nodes.push(
          arrow(w / 2, y, arrowDir === "right" ? 0 : 180, COLORS.red, {
            length: 7.75,
            shaft: 0.75,
            headLength: 1.625,
            headWidth: 2,
          }),
        );
      }
    }
    return { width: w, height: h, nodes };
  },
});

/** R8-3 No Parking (symbol). 24x24, official 2024 artwork. */
export const R8_3 = defineSign({
  code: "R8-3",
  name: "No Parking (symbol)",
  category: "regulatory",
  defaults: {},
  render: () => artRender(ART_R8_3),
});

/** R10-11 No Turn On Red. 24x30, official 2024 artwork. */
export const R10_11 = defineSign({
  code: "R10-11",
  name: "No Turn On Red",
  category: "regulatory",
  defaults: {},
  render: () => artRender(ART_R10_11),
});

export type RoadClosedProps = {
  /** Optional legend override, e.g. ["ROAD CLOSED", "TO THRU TRAFFIC"]. */
  lines: string[];
};

/** R11-2 Road Closed. 48x30 official blank; parametric legend. */
export const R11_2 = defineSign<RoadClosedProps>({
  code: "R11-2",
  name: "Road Closed",
  category: "regulatory",
  defaults: { lines: ["ROAD", "CLOSED"] },
  render: ({ lines }) => {
    const w = 48;
    const h = 30;
    return {
      width: w,
      height: h,
      nodes: [
        ...artNodes(ART_R11_2),
        // The artwork legend is the official ROAD CLOSED; overrides use the font.
        ...(lines.length === 2 && lines[0] === "ROAD" && lines[1] === "CLOSED"
          ? artLegendNodes(ART_R11_2)
          : lines.map((t, i) =>
              fittedText(t, {
                series: "D",
                height: 8,
                x: w / 2,
                y: 13 + i * 12,
                fill: COLORS.black,
                anchor: "middle",
                maxWidth: 43,
              }),
            )),
      ],
    };
  },
});
