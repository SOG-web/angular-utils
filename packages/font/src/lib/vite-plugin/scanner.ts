import type { FontImport } from "./types.js";

/**
 * Scan TypeScript file for font imports
 * Looks for createGoogleFont() and localFont() calls
 */
export async function scanForFontImports(
  fontsFile: string
): Promise<FontImport[]> {
  const fs = await import("node:fs");
  const path = await import("node:path");

  try {
    // Check if fonts file exists
    if (!fs.existsSync(fontsFile)) {
      console.warn(`Fonts file not found: ${fontsFile}`);
      return [];
    }

    const content = fs.readFileSync(fontsFile, "utf8");
    const fontImports: FontImport[] = [];

    // Parse Google Font imports
    const googleFontRegex =
      /createGoogleFont\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*(\{[^}]*\})\s*\)/g;
    let match;

    while ((match = googleFontRegex.exec(content)) !== null) {
      const [, fontFamily, optionsStr] = match;

      try {
        // Parse options (simple JSON parsing)
        const options = JSON.parse(optionsStr);

        fontImports.push({
          type: "google",
          family: fontFamily,
          options,
        });
      } catch (error) {
        console.warn(`Failed to parse options for ${fontFamily}:`, error);
      }
    }

    // Parse local font imports
    const localFontRegex = /localFont\s*\(\s*(\{[^}]*\})\s*\)/g;

    while ((match = localFontRegex.exec(content)) !== null) {
      const [, optionsStr] = match;

      try {
        const options = JSON.parse(optionsStr);

        // Extract font family from src path or variable name
        const family = extractFontFamilyFromOptions(options);

        fontImports.push({
          type: "local",
          family,
          options,
        });
      } catch (error) {
        console.warn("Failed to parse local font options:", error);
      }
    }

    return fontImports;
  } catch (error) {
    console.error("Failed to scan font imports:", error);
    return [];
  }
}

/**
 * Extract font family name from local font options
 */
function extractFontFamilyFromOptions(options: any): string {
  // Try to get from variable name
  if (options.variable) {
    return options.variable.replace("--font-", "").replace(/-/g, " ");
  }

  // Try to get from src path
  if (options.src) {
    if (typeof options.src === "string") {
      const filename = options.src.split("/").pop()?.split(".")[0];
      return filename || "custom-font";
    } else if (Array.isArray(options.src) && options.src.length > 0) {
      const filename = options.src[0].path.split("/").pop()?.split(".")[0];
      return filename || "custom-font";
    }
  }

  return "custom-font";
}
