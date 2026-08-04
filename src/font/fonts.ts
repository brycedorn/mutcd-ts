// Convenience registry of all six series; importing it costs the full set.
import { seriesEM } from "./generated/series-EM";
import { seriesF } from "./generated/series-F";
import type { FontSeries } from "./layout";
import { seriesB, seriesC, seriesD, seriesE } from "./series";
import type { FontData } from "./types";

export const FONTS: Record<FontSeries, FontData> = {
  B: seriesB,
  C: seriesC,
  D: seriesD,
  E: seriesE,
  EM: seriesEM,
  F: seriesF,
};

export function getFont(series: FontSeries): FontData {
  return FONTS[series];
}
