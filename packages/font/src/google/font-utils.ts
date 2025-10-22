import fontData from "./font-data.json" with { type: "json" };
import type { VariableFontAxes } from "../lib/core/types.js";

/**
 * Find all font files in the CSS response and determine which files should be preloaded.
 * In Google Fonts responses, the @font-face's subset is above it in a comment.
 * Walk through the CSS from top to bottom, keeping track of the current subset.
 */
export function findFontFilesInCss(css: string, subsetsToPreload?: string[]) {
  // Find font files to download
  const fontFiles: Array<{
    googleFontFileUrl: string;
    preloadFontFile: boolean;
  }> = [];

  // Keep track of the current subset
  let currentSubset = "";
  for (const line of css.split("\n")) {
    const newSubset = /\/\* (.+?) \*\//.exec(line)?.[1];
    if (newSubset) {
      // Found new subset in a comment above the next @font-face declaration
      currentSubset = newSubset;
    } else {
      const googleFontFileUrl = /src: url\((.+?)\)/.exec(line)?.[1];
      if (
        googleFontFileUrl &&
        !fontFiles.some(
          (foundFile) => foundFile.googleFontFileUrl === googleFontFileUrl
        )
      ) {
        // Found the font file in the @font-face declaration.
        fontFiles.push({
          googleFontFileUrl,
          preloadFontFile: !!subsetsToPreload?.includes(currentSubset),
        });
      }
    }
  }

  return fontFiles;
}

/**
 * Generate Google Fonts URL for fetching CSS
 */
export function getGoogleFontsUrl(
  fontFamily: string,
  axes: {
    wght?: string[];
    ital?: string[];
    variableAxes?: [string, string][];
  },
  display: string,
  baseUrl: string = "https://fonts.googleapis.com/css2"
): string {
  const params = new URLSearchParams();

  // Add font family
  params.set("family", fontFamily);

  // Add weights
  if (axes.wght) {
    params.set("wght", axes.wght.join(";"));
  }

  // Add italic styles
  if (axes.ital) {
    params.set("ital", axes.ital.join(";"));
  }

  // Add variable axes
  if (axes.variableAxes) {
    for (const [tag, value] of axes.variableAxes) {
      params.set(tag, value);
    }
  }

  // Add display
  params.set("display", display);

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Parse font axes from weights and styles using font metadata
 * This ensures we use the actual supported weight ranges for variable fonts
 */
export function getFontAxes(
  fontFamily: string,
  weights: string[],
  styles: string[],
  selectedVariableAxes?: string[],
  customVariableAxes?: VariableFontAxes
): {
  wght?: string[];
  ital?: string[];
  variableAxes?: [string, string][];
} {
  const axes: {
    wght?: string[];
    ital?: string[];
    variableAxes?: [string, string][];
  } = {};

  // Handle weights
  if (weights.includes("variable")) {
    // For variable fonts, get the actual weight range from metadata
    const metadata = (fontData as any)[fontFamily];

    if (metadata?.axes) {
      const wghtAxis = metadata.axes.find((axis: any) => axis.tag === "wght");
      if (wghtAxis) {
        // Use custom range if provided, otherwise use metadata range
        if (customVariableAxes?.wght) {
          axes.wght = [
            `${customVariableAxes.wght[0]}..${customVariableAxes.wght[1]}`,
          ];
        } else {
          axes.wght = [`${wghtAxis.min}..${wghtAxis.max}`];
        }
      } else {
        // Fallback to default range
        axes.wght = customVariableAxes?.wght
          ? [`${customVariableAxes.wght[0]}..${customVariableAxes.wght[1]}`]
          : ["100..900"];
      }
    } else {
      axes.wght = customVariableAxes?.wght
        ? [`${customVariableAxes.wght[0]}..${customVariableAxes.wght[1]}`]
        : ["100..900"];
    }
  } else {
    axes.wght = weights;
  }

  // Handle styles (italic)
  // Make sure the order is correct, otherwise Google Fonts will return an error
  // If only normal is set, we can skip returning the ital axis as normal is the default
  const hasItalic = styles.includes("italic");
  const hasNormal = styles.includes("normal");

  if (hasItalic) {
    // Use custom slant range if provided
    if (customVariableAxes?.slnt) {
      axes.ital = [
        `${customVariableAxes.slnt[0]}..${customVariableAxes.slnt[1]}`,
      ];
    } else {
      axes.ital = hasNormal ? ["0", "1"] : ["1"];
    }
  }

  // Handle additional variable axes
  if (
    selectedVariableAxes &&
    selectedVariableAxes.length > 0 &&
    weights.includes("variable")
  ) {
    const metadata = (fontData as any)[fontFamily];

    if (metadata?.axes) {
      axes.variableAxes = selectedVariableAxes
        .map((axisTag) => {
          const axisData = metadata.axes.find(
            (axis: any) => axis.tag === axisTag
          );
          if (axisData && axisData.tag !== "wght") {
            // Use custom range if provided
            const customRange =
              customVariableAxes?.[axisData.tag as keyof VariableFontAxes];
            if (customRange && Array.isArray(customRange)) {
              return [axisData.tag, `${customRange[0]}..${customRange[1]}`] as [
                string,
                string,
              ];
            }
            return [axisData.tag, `${axisData.min}..${axisData.max}`] as [
              string,
              string,
            ];
          }
          return null;
        })
        .filter((axis): axis is [string, string] => axis !== null);
    }
  }

  // Add custom variable axes not in selectedVariableAxes
  if (customVariableAxes && weights.includes("variable")) {
    const customAxes: [string, string][] = [];

    for (const [axisTag, range] of Object.entries(customVariableAxes)) {
      if (Array.isArray(range) && axisTag !== "wght" && axisTag !== "slnt") {
        customAxes.push([axisTag, `${range[0]}..${range[1]}`]);
      }
    }

    if (customAxes.length > 0) {
      axes.variableAxes = [...(axes.variableAxes || []), ...customAxes];
    }
  }

  return axes;
}

/**
 * Sort font variant values for consistent ordering
 * Handles complex formats like "ital,wght" used in Google Fonts API
 *
 * Based on next-font's implementation for proper variant sorting
 */
export function sortFontsVariantValues(valA: string, valB: string): number {
  // If both values contain commas, it indicates they are in "ital,wght" format
  if (valA.includes(",") && valB.includes(",")) {
    // Split the values into prefix and suffix
    const [aPrefix, aSuffix] = valA.split(",", 2);
    const [bPrefix, bSuffix] = valB.split(",", 2);

    // Compare the prefixes (ital values)
    if (aPrefix === bPrefix) {
      // If prefixes are equal, then compare the suffixes (wght values)
      return parseInt(aSuffix, 10) - parseInt(bSuffix, 10);
    } else {
      // If prefixes are different, then compare the prefixes directly
      return parseInt(aPrefix, 10) - parseInt(bPrefix, 10);
    }
  }

  // If values are not in "ital,wght" format, then directly compare them as integers
  const aNum = parseInt(valA, 10);
  const bNum = parseInt(valB, 10);

  // If both are numbers, compare numerically
  if (!isNaN(aNum) && !isNaN(bNum)) {
    return aNum - bNum;
  }

  // Otherwise, compare as strings (for cases like "normal", "italic")
  if (valA === "normal" && valB !== "normal") return -1;
  if (valB === "normal" && valA !== "normal") return 1;

  return valA.localeCompare(valB);
}
