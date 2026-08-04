import type { SignTemplate } from "../core/types";
import { R1_1, R1_2 } from "./r1";
import { R2_1 } from "./r2";
import { R3_1, R3_2, R3_3, R3_4, R3_5 } from "./r3";
import { R4_1, R4_7, R5_1, R5_2 } from "./r4-r5";
import { R6_1, R6_2, R7_1, R8_3, R10_11, R11_2 } from "./r6-r11";
import { W1_1, W1_2, W1_3, W1_4, W1_5, W1_6, W1_8 } from "./w1";
import { W2_1, W2_2, W2_4, W2_5, W3_1, W3_2, W3_3 } from "./w2-w3";
import { W11_1, W11_2, W13_1P, W14_1, W14_2, W20_1 } from "./w11-w20";
import { D1_1, D1_2, D1_3, D3_1, E5_1 } from "./guide";
import { M1_1, M1_4, M1_5 } from "./markers";
import { S1_1 } from "./school";

/** All sign templates keyed by MUTCD code. */
export const SIGNS = {
  "R1-1": R1_1,
  "R1-2": R1_2,
  "R2-1": R2_1,
  "R3-1": R3_1,
  "R3-2": R3_2,
  "R3-3": R3_3,
  "R3-4": R3_4,
  "R3-5": R3_5,
  "R4-1": R4_1,
  "R4-7": R4_7,
  "R5-1": R5_1,
  "R5-2": R5_2,
  "R6-1": R6_1,
  "R6-2": R6_2,
  "R7-1": R7_1,
  "R8-3": R8_3,
  "R10-11": R10_11,
  "R11-2": R11_2,
  "W1-1": W1_1,
  "W1-2": W1_2,
  "W1-3": W1_3,
  "W1-4": W1_4,
  "W1-5": W1_5,
  "W1-6": W1_6,
  "W1-8": W1_8,
  "W2-1": W2_1,
  "W2-2": W2_2,
  "W2-4": W2_4,
  "W2-5": W2_5,
  "W3-1": W3_1,
  "W3-2": W3_2,
  "W3-3": W3_3,
  "W11-1": W11_1,
  "W11-2": W11_2,
  "W13-1P": W13_1P,
  "W14-1": W14_1,
  "W14-2": W14_2,
  "W20-1": W20_1,
  "D1-1": D1_1,
  "D1-2": D1_2,
  "D1-3": D1_3,
  "D3-1": D3_1,
  "E5-1": E5_1,
  "M1-1": M1_1,
  "M1-4": M1_4,
  "M1-5": M1_5,
  "S1-1": S1_1,
} as const;

export type SignCode = keyof typeof SIGNS;

/** Props type for a given sign code. */
export type SignProps<C extends SignCode> = (typeof SIGNS)[C] extends SignTemplate<infer P>
  ? P
  : never;

export function listSigns(): {
  code: SignCode;
  name: string;
  category: string;
  defaults: object;
}[] {
  return (Object.keys(SIGNS) as SignCode[]).map((code) => {
    const t = SIGNS[code];
    return { code, name: t.name, category: t.category, defaults: t.defaults };
  });
}

export type { SpeedLimitProps } from "./r2";
export type { LaneUseProps } from "./r3";
export type { OneWayProps, NoParkingProps, RoadClosedProps } from "./r6-r11";
export type { DirectionProps } from "./w1";
export type { FluorescentProps, AdvisorySpeedProps, RoadWorkProps } from "./w11-w20";
export type { DestinationLine, StreetNameProps, ExitGoreProps } from "./guide";
export type { RouteProps } from "./markers";
export type { SchoolProps } from "./school";
export type { SignArt } from "./artwork";

export {
  R1_1,
  R1_2,
  R2_1,
  R3_1,
  R3_2,
  R3_3,
  R3_4,
  R3_5,
  R4_1,
  R4_7,
  R5_1,
  R5_2,
  R6_1,
  R6_2,
  R7_1,
  R8_3,
  R10_11,
  R11_2,
  W1_1,
  W1_2,
  W1_3,
  W1_4,
  W1_5,
  W1_6,
  W1_8,
  W2_1,
  W2_2,
  W2_4,
  W2_5,
  W3_1,
  W3_2,
  W3_3,
  W11_1,
  W11_2,
  W13_1P,
  W14_1,
  W14_2,
  W20_1,
  D1_1,
  D1_2,
  D1_3,
  D3_1,
  E5_1,
  M1_1,
  M1_4,
  M1_5,
  S1_1,
};
