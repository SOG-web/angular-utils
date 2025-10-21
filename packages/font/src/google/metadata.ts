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

  const availableWeights = metadata.weights;
  const invalidWeights: number[] = [];
  const validWeights = requestedWeights
    .filter((weight) => {
      const weightStr = weight.toString();
      if (!availableWeights.includes(weightStr)) {
        invalidWeights.push(weight);
        return false;
      }
      return true;
    })
    .map((w) => w.toString());

  // If some weights are invalid, show a helpful error
  if (invalidWeights.length > 0) {
    console.warn(
      `Weight(s) ${formatAvailableValues(
        invalidWeights.map(String)
      )} not available for font \`${fontFamily}\`.\nAvailable weights: ${formatAvailableValues(
        availableWeights
      )}`
    );
  }

  if (validWeights.length === 0) {
    throwFontError(
      `No valid weights provided for font \`${fontFamily}\`.\nAvailable weights: ${formatAvailableValues(
        availableWeights
      )}`
    );
  }

  return validWeights;
}

/**
 * Validate font subsets against available subsets
 */
export function validateSubsets(
  fontFamily: string,
  requestedSubsets: string[]
): string[] {
  const metadata = getFontMetadata(fontFamily);
  if (!metadata) {
    throwFontError(
      `Unknown font \`${fontFamily}\`.\n\nYou can find all available fonts at: https://fonts.google.com`
    );
  }

  const availableSubsets = metadata.subsets;
  const invalidSubsets: string[] = [];
  const validSubsets = requestedSubsets.filter((subset) => {
    if (!availableSubsets.includes(subset)) {
      invalidSubsets.push(subset);
      return false;
    }
    return true;
  });

  // If some subsets are invalid, show a helpful error
  if (invalidSubsets.length > 0) {
    console.warn(
      `Subset(s) ${formatAvailableValues(
        invalidSubsets
      )} not available for font \`${fontFamily}\`.\nAvailable subsets: ${formatAvailableValues(
        availableSubsets
      )}`
    );
  }

  if (validSubsets.length === 0) {
    // Default to 'latin' if available
    const defaultSubset = availableSubsets.includes("latin")
      ? "latin"
      : availableSubsets[0];

    console.info(
      `No valid subsets provided for font \`${fontFamily}\`. Using default: \`${defaultSubset}\``
    );

    return [defaultSubset];
  }

  return validSubsets;
}

/**
 * Validate font styles against available styles
 */
export function validateStyles(
  fontFamily: string,
  requestedStyles: string[]
): string[] {
  const metadata = getFontMetadata(fontFamily);
  if (!metadata) {
    throwFontError(
      `Unknown font \`${fontFamily}\`.\n\nYou can find all available fonts at: https://fonts.google.com`
    );
  }

  const availableStyles = metadata.styles;
  const invalidStyles: string[] = [];
  const validStyles = requestedStyles.filter((style) => {
    if (!availableStyles.includes(style)) {
      invalidStyles.push(style);
      return false;
    }
    return true;
  });

  // If some styles are invalid, show a helpful error
  if (invalidStyles.length > 0) {
    console.warn(
      `Style(s) ${formatAvailableValues(
        invalidStyles
      )} not available for font \`${fontFamily}\`.\nAvailable styles: ${formatAvailableValues(
        availableStyles
      )}`
    );
  }

  if (validStyles.length === 0) {
    const defaultStyle = availableStyles.includes("normal")
      ? "normal"
      : availableStyles[0];

    console.info(
      `No valid styles provided for font \`${fontFamily}\`. Using default: \`${defaultStyle}\``
    );

    return [defaultStyle];
  }

  return validStyles;
}

export { googleFontsMetadata };
