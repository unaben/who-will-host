import { CSSProperties } from "react";
import { DARK, DARK_LUMINANCE, HEX_COLOR, WHITE } from "@/constants";

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/**
 * Picks white or near-black text, whichever reads better on a group's colour.
 * White wins on indigo or pink, dark wins on amber or lime.
 */
export function readableTextOn(hex: string): string {
  if (!HEX_COLOR.test(hex)) return WHITE;
  const fill = luminance(hex);
  const whiteContrast = 1.05 / (fill + 0.05);
  const darkContrast = (fill + 0.05) / (DARK_LUMINANCE + 0.05);
  return whiteContrast >= darkContrast ? WHITE : DARK;
}

/** Sets the colour variables a card or the form paints itself with. */
export const paint = (color: string) =>
  ({
    "--accent": color,
    "--on-accent": readableTextOn(color),
  }) as CSSProperties;
