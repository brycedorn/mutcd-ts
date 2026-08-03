/**
 * SHS sign colors. sRGB approximations of the FHWA daylight color tolerance
 * charts (Pantone equivalents commonly used for digital sign artwork).
 */
export const COLORS = {
  white: "#FFFFFF",
  black: "#000000",
  /** PMS 187 */
  red: "#AF1E2D",
  /** PMS 152 */
  orange: "#E57200",
  /** PMS 116 */
  yellow: "#FFCD00",
  /** PMS 342 */
  green: "#006747",
  /** PMS 294 */
  blue: "#003F87",
  /** PMS 469 */
  brown: "#693F23",
  /** Fluorescent yellow-green (school/ped warning) */
  fyg: "#C5D92D",
} as const;

export type SignColor = keyof typeof COLORS;
