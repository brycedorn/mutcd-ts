import { defineSign } from "../core/types";
import { artRender, SignArt } from "./artwork";
import { ART_W1_1_L, ART_W1_1_R } from "./generated/artwork/W1-1";
import { ART_W1_2_L, ART_W1_2_R } from "./generated/artwork/W1-2";
import { ART_W1_3_L, ART_W1_3_R } from "./generated/artwork/W1-3";
import { ART_W1_4_L, ART_W1_4_R } from "./generated/artwork/W1-4";
import { ART_W1_5_L, ART_W1_5_R } from "./generated/artwork/W1-5";
import { ART_W1_6_L, ART_W1_6_R } from "./generated/artwork/W1-6";
import { ART_W1_8_L, ART_W1_8_R } from "./generated/artwork/W1-8";

export type DirectionProps = { direction: "left" | "right" };

function directional(
  code: string,
  name: string,
  left: SignArt,
  right: SignArt,
  def: "left" | "right",
) {
  return defineSign<DirectionProps>({
    code,
    name,
    category: "warning",
    defaults: { direction: def },
    render: ({ direction }) => artRender(direction === "left" ? left : right),
  });
}

/** W1 horizontal alignment series, official 2024 artwork per direction. */
export const W1_1 = directional("W1-1", "Turn", ART_W1_1_L, ART_W1_1_R, "left");
export const W1_2 = directional("W1-2", "Curve", ART_W1_2_L, ART_W1_2_R, "left");
export const W1_3 = directional("W1-3", "Reverse Turn", ART_W1_3_L, ART_W1_3_R, "left");
export const W1_4 = directional("W1-4", "Reverse Curve", ART_W1_4_L, ART_W1_4_R, "left");
export const W1_5 = directional("W1-5", "Winding Road", ART_W1_5_L, ART_W1_5_R, "left");
export const W1_6 = directional(
  "W1-6",
  "One-Direction Large Arrow",
  ART_W1_6_L,
  ART_W1_6_R,
  "right",
);
export const W1_8 = directional(
  "W1-8",
  "Chevron Alignment",
  ART_W1_8_L,
  ART_W1_8_R,
  "right",
);
