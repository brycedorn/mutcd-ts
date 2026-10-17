/** Glyph outline in cap-height units: y-down, origin at baseline left. */
export type GlyphData = {
  /** Advance width, in cap-height units. */
  a: number;
  /** SVG path data; empty for space. */
  d: string;
};

export type FontData = {
  series: string;
  /** Descender depth below baseline, in cap-height units. */
  descender: number;
  glyphs: Record<string, GlyphData>;
  /** Kerning adjustments keyed by character pair, in cap-height units. */
  kern: Record<string, number>;
};
