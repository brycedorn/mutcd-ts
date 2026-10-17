import type { SvgNode } from "./svg";

export type SignCategory =
  | "regulatory"
  | "warning"
  | "guide"
  | "school"
  | "marker";

export type SignRender = {
  /** Sign face width in inches. */
  width: number;
  /** Sign face height in inches. */
  height: number;
  nodes: SvgNode[];
};

export type SignTemplate<P extends object = Record<string, never>> = {
  code: string;
  name: string;
  category: SignCategory;
  defaults: P;
  render: (props: P) => SignRender;
};

/** Helper preserving prop type inference when defining templates. */
export function defineSign<P extends object>(t: SignTemplate<P>): SignTemplate<P> {
  return t;
}
