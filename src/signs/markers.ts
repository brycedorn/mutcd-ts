import { defineSign } from "../core/types";
import { COLORS } from "../core/colors";
import { el } from "../core/svg";
import { fitText } from "../font/layout";
import { artNodes, artLegendNodes } from "./artwork";
import type { SignArt } from "./artwork";
import { ART_M1_1 } from "./generated/artwork/M1-1";
import { ART_M1_4 } from "./generated/artwork/M1-4";
import { ART_M1_5 } from "./generated/artwork/M1-5";

export type RouteProps = {
  /** Route number, e.g. "80" or "101". */
  route: string;
};

/** Official legend when the route matches the artwork default, else font. */
function routeNumerals(
  art: SignArt,
  route: string,
  artRoute: string,
  font: () => string,
): string[] {
  return route === artRoute ? artLegendNodes(art) : [font()];
}

/** M1-1 Interstate Route shield. 24x24 official artwork; parametric numerals. */
export const M1_1 = defineSign<RouteProps>({
  code: "M1-1",
  name: "Interstate Route",
  category: "marker",
  defaults: { route: "80" },
  render: ({ route }) => ({
    width: 24,
    height: 24,
    nodes: [
      ...artNodes(ART_M1_1),
      ...routeNumerals(ART_M1_1, route, "20", () =>
        el("path", {
          d: fitText(route, {
            series: "D",
            height: 11,
            x: 12,
            y: 17.5,
            anchor: "middle",
            maxWidth: 17.6,
          }).d,
          fill: COLORS.white,
        }),
      ),
    ],
  }),
});

/** M1-4 US Route shield. 24x24 official artwork; parametric numerals. */
export const M1_4 = defineSign<RouteProps>({
  code: "M1-4",
  name: "US Route",
  category: "marker",
  defaults: { route: "101" },
  render: ({ route }) => ({
    width: 24,
    height: 24,
    nodes: [
      ...artNodes(ART_M1_4),
      ...routeNumerals(ART_M1_4, route, "40", () =>
        el("path", {
          d: fitText(route, {
            series: "D",
            height: 12,
            x: 12,
            y: 17.5,
            anchor: "middle",
            maxWidth: 20.3,
          }).d,
          fill: COLORS.black,
        }),
      ),
    ],
  }),
});

/** M1-5 State Route (generic square). 24x24 official artwork; parametric numerals. */
export const M1_5 = defineSign<RouteProps>({
  code: "M1-5",
  name: "State Route",
  category: "marker",
  defaults: { route: "26" },
  render: ({ route }) => ({
    width: 24,
    height: 24,
    nodes: [
      ...artNodes(ART_M1_5),
      ...routeNumerals(ART_M1_5, route, "21", () =>
        el("path", {
          d: fitText(route, {
            series: "C",
            height: 12,
            x: 12,
            y: 18,
            anchor: "middle",
            maxWidth: 14,
          }).d,
          fill: COLORS.black,
        }),
      ),
    ],
  }),
});
