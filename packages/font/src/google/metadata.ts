import fontData from "./font-data.json" with { type: "json" };
import { formatAvailableValues } from "../lib/core/format-available-values.js";
import { throwFontError } from "../lib/core/font-error.js";

/**
 * Google Font metadata structure
 */
interface GoogleFontMetadata {
  weights: string[];
  styles: string[];
  subsets: string[];
  axes?: Array<{
    tag: string;
    min: number;
    max: number;
    defaultValue: number;
  }>;
}

/**
 * Type for the font data JSON
 */
type FontDataMap = {
  [fontFamily: string]: GoogleFontMetadata;
};

const googleFontsMetadata = fontData as FontDataMap;

/**
 * Get metadata for a specific Google Font
 */
export function getFontMetadata(
  fontFamily: string
): GoogleFontMetadata | undefined {
  return googleFontsMetadata[fontFamily];
}

/**
 * Check if a font exists in Google Fonts
 */
export function isFontAvailable(fontFamily: string): boolean {
  return fontFamily in googleFontsMetadata;
}

/**
 * Get all available Google Fonts
 */
export function getAllFontFamilies(): string[] {
  return Object.keys(googleFontsMetadata);
}

/**
 * Validate font weights against available weights
 */
export function validateWeights(
  fontFamily: string,
  requestedWeights: number[] | "variable"
): string[] {
  const metadata = getFontMetadata(fontFamily);
  if (!metadata) {
    throwFontError(
      `Unknown font \`${fontFamily}\`.\n\nYou can find all available fonts at: https://fonts.google.com`
    );
  }

  if (requestedWeights === "variable") {
    if (!metadata.axes || !metadata.axes.some((axis) => axis.tag === "wght")) {
      throwFontError(
        `Font \`${fontFamily}\` does not support variable weights.\nAvailable weights: ${formatAvailableValues(
          metadata.weights
        )}`
      );
    }
    return ["variable"];
  }

  // TypeScript types ensure weights are valid at compile-time
  // Just convert numbers to strings for API consumption
  return requestedWeights.map((w) => w.toString());
}

/**
 * Normalize subsets (TypeScript types ensure validity at compile-time)
 */
export function validateSubsets(
  fontFamily: string,
  requestedSubsets: string[]
): string[] {
  // TypeScript types ensure subsets are valid at compile-time
  // Just return them as-is
  return requestedSubsets;
}

/**
 * Normalize styles (TypeScript types ensure validity at compile-time)
 */
export function validateStyles(
  fontFamily: string,
  requestedStyles: string[]
): string[] {
  // TypeScript types ensure styles are valid at compile-time
  // Just return them as-is
  return requestedStyles;
}

export { googleFontsMetadata };
