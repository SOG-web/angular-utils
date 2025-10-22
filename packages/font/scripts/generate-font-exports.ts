#!/usr/bin/env node

/**
 * Generate font function exports from font-data.json
 * This script reads the Google Fonts metadata and generates TypeScript exports
 * for all available font families in src/google/fonts.ts
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FONT_DATA_PATH = path.join(__dirname, "../src/google/font-data.json");
const FONTS_OUTPUT_PATH = path.join(__dirname, "../src/google/fonts.ts");
const FONT_FAMILIES_OUTPUT_PATH = path.join(
  __dirname,
  "../src/google/font-families.ts"
);

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

type FontDataMap = {
  [fontFamily: string]: GoogleFontMetadata;
};

/**
 * Convert font family name to valid TypeScript identifier
 * e.g., "Roboto Mono" -> "Roboto_Mono"
 */
function formatFontFunctionName(fontFamily: string): string {
  return fontFamily.replace(/\s+/g, "_");
}

/**
 * Generate font families union type
 */
function generateFontFamiliesType(fontFamilies: string[]): string {
  const sortedFamilies = [...fontFamilies].sort();

  return `/**
 * Union type of all available Google Font families
 * Generated from font-data.json - DO NOT EDIT MANUALLY
 * Run: pnpm generate:fonts to regenerate
 */
export type GoogleFontFamily = 
${sortedFamilies.map((family) => `  | "${family}"`).join("\n")};

/**
 * Get all available font families
 */
export const ALL_FONT_FAMILIES: GoogleFontFamily[] = [
${sortedFamilies.map((family) => `  "${family}"`).join(",\n")}
] as const;

/**
 * Check if a font family is available
 */
export function isFontFamilyAvailable(fontFamily: string): fontFamily is GoogleFontFamily {
  return ALL_FONT_FAMILIES.includes(fontFamily as GoogleFontFamily);
}
`;
}

/**
 * Generate per-font metadata types using lookup tables
 */
function generatePerFontTypes(fontData: FontDataMap): string {
  const fontFamilies = Object.keys(fontData).sort();

  // Generate weights lookup table
  const weightsMap = fontFamilies
    .map((family) => {
      const metadata = fontData[family];
      const weights = metadata.weights
        .map((w) => (w === "variable" ? '"variable"' : w))
        .join(" | ");
      return `  "${family}": ${weights || 'number | "variable"'};`;
    })
    .join("\n");

  // Generate subsets lookup table
  const subsetsMap = fontFamilies
    .map((family) => {
      const metadata = fontData[family];
      const subsets = metadata.subsets.map((s) => `"${s}"`).join(" | ");
      return `  "${family}": ${subsets || "string"};`;
    })
    .join("\n");

  // Generate styles lookup table
  const stylesMap = fontFamilies
    .map((family) => {
      const metadata = fontData[family];
      const styles = metadata.styles.map((s) => `"${s}"`).join(" | ");
      return `  "${family}": ${styles || '"normal" | "italic"'};`;
    })
    .join("\n");

  // Generate axes lookup table
  const axesMap = fontFamilies
    .map((family) => {
      const metadata = fontData[family];
      if (metadata.axes && metadata.axes.length > 0) {
        const axes = metadata.axes.map((a) => `"${a.tag}"`).join(" | ");
        return `  "${family}": ${axes};`;
      }
      return `  "${family}": never;`;
    })
    .join("\n");

  return `
/**
 * Font weights lookup table
 */
type FontWeightsMap = {
${weightsMap}
};

/**
 * Font subsets lookup table
 */
type FontSubsetsMap = {
${subsetsMap}
};

/**
 * Font styles lookup table
 */
type FontStylesMap = {
${stylesMap}
};

/**
 * Font axes lookup table
 */
type FontAxesMap = {
${axesMap}
};

/**
 * Get valid weights for a specific font family
 */
export type WeightsFor<T extends GoogleFontFamily> = 
  T extends keyof FontWeightsMap ? FontWeightsMap[T] : number | "variable";

/**
 * Get valid subsets for a specific font family
 */
export type SubsetsFor<T extends GoogleFontFamily> = 
  T extends keyof FontSubsetsMap ? FontSubsetsMap[T] : string;

/**
 * Get valid styles for a specific font family
 */
export type StylesFor<T extends GoogleFontFamily> = 
  T extends keyof FontStylesMap ? FontStylesMap[T] : "normal" | "italic";

/**
 * Get valid axes for a specific font family
 */
export type AxesFor<T extends GoogleFontFamily> = 
  T extends keyof FontAxesMap ? FontAxesMap[T] : string;
`;
}

/**
 * Generate the fonts.ts file content
 */
function generateFontsFile(fontFamilies: string[]): string {
  const sortedFamilies = [...fontFamilies].sort();

  // Generate individual typed export statements
  const exports = sortedFamilies
    .map((fontFamily) => {
      const functionName = formatFontFunctionName(fontFamily);

      return `/**
 * ${fontFamily} font with type-safe options
 */
export const ${functionName} = (
  options?: GoogleFontOptions<
    "${fontFamily}",
    WeightsFor<"${fontFamily}">,
    SubsetsFor<"${fontFamily}">,
    StylesFor<"${fontFamily}">,
    AxesFor<"${fontFamily}">
  >
): FontResult => createGoogleFont("${fontFamily}", options);`;
    })
    .join("\n\n");

  return `import type { FontResult } from "../lib/core/types.js";
import type { GoogleFontOptions } from "../lib/core/google-font-options.js";
import type { 
  WeightsFor, 
  SubsetsFor, 
  StylesFor, 
  AxesFor 
} from "./font-families.js";
import { createGoogleFont } from "./loader.js";

/**
 * Type-safe Google Font functions
 * Generated from font-data.json - DO NOT EDIT MANUALLY
 * Run: pnpm generate:fonts to regenerate
 * 
 * Each function provides autocomplete for valid weights, subsets, styles, and axes
 * specific to that font family.
 */

${exports}

// Export the service
export { GoogleFontService } from "./service";

// Export utilities (loadGoogleFontBuildTime is not exported here to avoid bundling Node.js code)
export { getAllFontFamilies, isFontAvailable } from "./metadata";
`;
}

/**
 * Main execution
 */
function main() {
  try {
    console.log("🔍 Reading font-data.json...");

    // Read font data
    const fontDataContent = fs.readFileSync(FONT_DATA_PATH, "utf-8");
    const fontData: FontDataMap = JSON.parse(fontDataContent);

    // Get all font families
    const fontFamilies = Object.keys(fontData);

    console.log(`✅ Found ${fontFamilies.length} font families`);
    console.log(`📝 Generating font families type...`);

    // Generate font families type
    const fontFamiliesContent =
      generateFontFamiliesType(fontFamilies) + generatePerFontTypes(fontData);
    fs.writeFileSync(FONT_FAMILIES_OUTPUT_PATH, fontFamiliesContent, "utf-8");

    console.log(`📝 Generating exports for fonts.ts...`);

    // Generate the file content
    const fileContent = generateFontsFile(fontFamilies);

    // Write to file
    fs.writeFileSync(FONTS_OUTPUT_PATH, fileContent, "utf-8");

    console.log(`✅ Successfully generated ${FONTS_OUTPUT_PATH}`);
    console.log(`✅ Successfully generated ${FONT_FAMILIES_OUTPUT_PATH}`);
    console.log(`📊 Exported ${fontFamilies.length} font functions`);

    // Show some examples
    const examples = fontFamilies.slice(0, 5).map(formatFontFunctionName);
    console.log(`\n📦 Example exports: ${examples.join(", ")}...`);
  } catch (error) {
    console.error("❌ Error generating font exports:", error);
    process.exit(1);
  }
}

main();
