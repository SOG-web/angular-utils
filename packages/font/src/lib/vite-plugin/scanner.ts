import type { FontImport } from "./types.js";
import {
  scanCreateGoogleFontPattern,
  scanLocalFontImports as scanLocalFontImportsCore,
  type FontImportBase,
} from "../core/font-scanner-core.js";

/**
 * Scan TypeScript file for font imports
 * Looks for createGoogleFont() and localFont() calls
 */
export async function scanForFontImports(
  fontsFile: string
): Promise<FontImport[]> {
  const fs = await import("node:fs");

  try {
    // Check if fonts file exists
    if (!fs.existsSync(fontsFile)) {
      console.warn(`Fonts file not found: ${fontsFile}`);
      return [];
    }

    const content = fs.readFileSync(fontsFile, "utf8");
    const fontImports: FontImport[] = [];

    // Scan for Google Font imports using createGoogleFont() pattern
    const googleFontImports = scanCreateGoogleFontPattern(content, fontsFile, {
      includeMetadata: false,
      validateGoogleFonts: true,
    }) as FontImportBase[];
    fontImports.push(...googleFontImports);

    // Scan for local font imports
    const localFontImports = scanLocalFontImportsCore(content, fontsFile, {
      includeMetadata: false,
    }) as FontImportBase[];
    fontImports.push(...localFontImports);

    return fontImports;
  } catch (error) {
    console.error("Failed to scan font imports:", error);
    return [];
  }
}
