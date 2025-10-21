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
 * Generate the fonts.ts file content
 */
function generateFontsFile(fontFamilies: string[]): string {
  const sortedFamilies = [...fontFamilies].sort();

  // Generate individual export statements
  const exports = sortedFamilies
    .map((fontFamily) => {
      const functionName = formatFontFunctionName(fontFamily);

      // Check if identifier needs bracket notation
      if (functionName.includes("_") || functionName.includes("-")) {
        return `export const ${functionName} = fontFunctions["${functionName}"];`;
      } else {
        return `export const ${functionName} = fontFunctions.${functionName};`;
      }
    })
    .join("\n");

  return `import type { GoogleFontOptions, FontResult } from "../lib/core/types";
import { createGoogleFont } from "./loader";
import { formatFontFunctionName } from "../lib/core/font-loader";
import { getAllFontFamilies } from "./metadata";

/**
 * Generate individual font functions for all available Google Fonts
 * This creates functions like Inter(), Roboto(), etc.
 */

// Get all available font families
const fontFamilies = getAllFontFamilies();

// Generate font functions dynamically
const fontFunctions: Record<
  string,
  (options?: GoogleFontOptions) => FontResult
> = {};

for (const fontFamily of fontFamilies) {
  const functionName = formatFontFunctionName(fontFamily);
  fontFunctions[functionName] = (options?: GoogleFontOptions) =>
    createGoogleFont(fontFamily, options);
}

// Export individual font functions
// Generated from font-data.json - DO NOT EDIT MANUALLY
// Run: pnpm generate:fonts to regenerate
${exports}

// Export the service
export { GoogleFontService } from "./service";

// Export utilities
export { loadGoogleFontBuildTime } from "./loader";
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
    console.log(`📝 Generating exports for fonts.ts...`);

    // Generate the file content
    const fileContent = generateFontsFile(fontFamilies);

    // Write to file
    fs.writeFileSync(FONTS_OUTPUT_PATH, fileContent, "utf-8");

    console.log(`✅ Successfully generated ${FONTS_OUTPUT_PATH}`);
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
