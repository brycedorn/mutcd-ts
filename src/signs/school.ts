import { defineSign } from "../core/types";
import { artRender } from "./artwork";
import { ART_S1_1 } from "./generated/artwork/S1-1";

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
