import { defineSign } from "../core/types";
import { COLORS } from "../core/colors";
import { fittedText } from "../core/text";
import { artRender, artNodes, artLegendNodes } from "./artwork";
import { ART_W11_1 } from "./generated/artwork/W11-1";
import { ART_W11_2 } from "./generated/artwork/W11-2";
import { ART_W13_1P } from "./generated/artwork/W13-1P";
import { ART_W14_1 } from "./generated/artwork/W14-1";
import { ART_W14_2 } from "./generated/artwork/W14-2";
import { ART_W20_1 } from "./generated/artwork/W20-1";

export type FluorescentProps = {
  /** Fluorescent yellow-green background (school zone / ped emphasis). */
  fluorescent: boolean;
};

/** W11-1 Bicycle. Official 2024 artwork. */
export const W11_1 = defineSign<FluorescentProps>({
  code: "W11-1",
  name: "Bicycle",
  category: "warning",
  defaults: { fluorescent: false },
  render: ({ fluorescent }) =>
    artRender(ART_W11_1, fluorescent ? { yellow: "fyg" } : {}),
});

/** W11-2 Pedestrian Crossing. Official 2024 artwork. */
export const W11_2 = defineSign<FluorescentProps>({
  code: "W11-2",
  name: "Pedestrian Crossing",
  category: "warning",
  defaults: { fluorescent: false },
  render: ({ fluorescent }) =>
    artRender(ART_W11_2, fluorescent ? { yellow: "fyg" } : {}),
});

export type AdvisorySpeedProps = {
  /** Advisory speed in mph. */
  speed: number;
};

/** W13-1P Advisory Speed plaque. Official blank + MPH; parametric numerals. */
export const W13_1P = defineSign<AdvisorySpeedProps>({
  code: "W13-1P",
  name: "Advisory Speed (plaque)",
  category: "warning",
  defaults: { speed: 35 },
  render: ({ speed }) => {
    const s = 18;
    return {
      width: s,
      height: s,
      nodes: [
        ...artNodes(ART_W13_1P),
        // The artwork legend is the official "35"; other speeds use the font.
        ...(speed === 35
          ? artLegendNodes(ART_W13_1P)
          : [
              fittedText(String(speed), {
                series: "D",
                height: 8,
                x: s / 2,
                y: 10.5,
                fill: COLORS.black,
                anchor: "middle",
                maxWidth: 15,
              }),
            ]),
      ],
    };
  },
});

/** W14-1 Dead End, W14-2 No Outlet. Official 2024 artwork. */
export const W14_1 = defineSign({
  code: "W14-1",
  name: "Dead End",
  category: "warning",
  defaults: {},
  render: () => artRender(ART_W14_1),
});

export const W14_2 = defineSign({
  code: "W14-2",
  name: "No Outlet",
  category: "warning",
  defaults: {},
  render: () => artRender(ART_W14_2),
});

export type RoadWorkProps = {
  /** Distance legend, e.g. "1000 FT" or "1 MILE"; empty for AHEAD. */
  distance: string;
};

/** W20-1 Road Work. 48" orange diamond, official blank + ROAD WORK. */
export const W20_1 = defineSign<RoadWorkProps>({
  code: "W20-1",
  name: "Road Work",
  category: "warning",
  defaults: { distance: "1000 FT" },
  render: ({ distance }) => {
    const art = ART_W20_1;
    return {
      width: art.width,
      height: art.height,
      nodes: [
        ...artNodes(art),
        // The artwork legend is the official "1000 FT"; others use the font.
        ...(distance === "1000 FT"
          ? artLegendNodes(art)
          : [
              fittedText(distance || "AHEAD", {
                series: "D",
                height: 7,
                x: art.width / 2,
                y: 47.95,
                fill: COLORS.black,
                anchor: "middle",
                maxWidth: 34,
              }),
            ]),
      ],
    };
  },
});
