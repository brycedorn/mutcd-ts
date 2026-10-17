// Series B-E only, so text-bearing signs never pull the EM/F outlines.
// The full six-series map lives in ./fonts.ts.
import { seriesB } from "./generated/series-B";
import { seriesC } from "./generated/series-C";
import { seriesD2024 } from "./generated/series-D-shs2024";
import { seriesE } from "./generated/series-E";
import type { FontData } from "./types";

export { seriesB, seriesC, seriesE };
/** Series D mixed case traced from official 2024 artwork (Roadgeek fallback). */
export const seriesD = seriesD2024;

/** Step-down chains for fitText: preferred series first, then narrower ones. */
export const CHAIN_C: FontData[] = [seriesC, seriesB];
export const CHAIN_D: FontData[] = [seriesD, seriesC, seriesB];
export const CHAIN_E: FontData[] = [seriesE, seriesD, seriesC, seriesB];
