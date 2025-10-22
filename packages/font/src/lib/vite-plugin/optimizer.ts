import type { FontImport, OptimizationResult } from "./types.js";
import { loadGoogleFontBuildTime } from "../../google/build-time-loader.js";
import { loadLocalFontBuildTime } from "../../local/build-time-loader.js";
import { GoogleFontOptions } from "../core/google-font-options.js";
import { LocalFontOptions } from "../core/types.js";

/**
 * Optimize fonts during build
 */
export async function optimizeFonts(
  fontImports: FontImport[],
  options: {
    outputDir: string;
    injectPreloads: boolean;
    injectCSS: boolean;
    subsetting: boolean;
  }
): Promise<OptimizationResult> {
  const { outputDir } = options;
  const fs = await import("node:fs");
  const path = await import("node:path");

  // Ensure output directory exists
  await fs.promises.mkdir(outputDir, { recursive: true });

  const results: OptimizationResult = {
    css: "",
    preloadLinks: [],
    files: [],
  };

  // Process each font
  for (const fontImport of fontImports) {
    console.log(`🔄 Processing ${fontImport.type} font: ${fontImport.family}`);

    try {
      if (fontImport.type === "google") {
        const result = await loadGoogleFontBuildTime(
          fontImport.family,
          fontImport.options as GoogleFontOptions,
          outputDir
        );

        results.css += result.css + "\n\n";
        results.preloadLinks.push(
          ...result.preloadLinks.split("\n").filter(Boolean)
        );
        results.files.push(...result.files);
      } else if (fontImport.type === "local") {
        const result = await loadLocalFontBuildTime(
          fontImport.options as LocalFontOptions,
          outputDir
        );

        results.css += result.css + "\n\n";
        results.preloadLinks.push(
          ...result.preloadLinks.split("\n").filter(Boolean)
        );
        results.files.push(...result.files);
      }
    } catch (error) {
      console.error(`Failed to process font ${fontImport.family}:`, error);
    }
  }

  // Write combined CSS
  if (results.css.trim()) {
    const cssPath = path.join(outputDir, "fonts.css");
    await fs.promises.writeFile(cssPath, results.css);
  }

  // Write preload links
  if (results.preloadLinks.length > 0) {
    const preloadPath = path.join(outputDir, "font-preloads.html");
    const preloadContent = results.preloadLinks.join("\n");
    await fs.promises.writeFile(preloadPath, preloadContent);
  }

  return results;
}
