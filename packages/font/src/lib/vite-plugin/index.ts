import type { Plugin } from "vite";
import type { ViteFontPluginOptions } from "./types.js";
import { scanForFontImports } from "./scanner.js";
import { optimizeFonts } from "./optimizer.js";

/**
 * Vite plugin for Angular font optimization
 * Supports both Google Fonts and local fonts with subsetting
 */
export function angularFontPlugin(options: ViteFontPluginOptions = {}): Plugin {
  const {
    fontsFile = "src/fonts.ts",
    outputDir = "dist/assets",
    injectPreloads = true,
    injectCSS = true,
    subsetting = true,
  } = options;

  return {
    name: "angular-font-plugin",
    async buildStart() {
      console.log("🔤 Starting font optimization...");

      try {
        // 1. Scan for font imports
        console.log("📁 Scanning for font imports...");
        const fontImports = await scanForFontImports(fontsFile);

        if (fontImports.length === 0) {
          console.log("✅ No font imports found, skipping optimization");
          return;
        }

        console.log(`📦 Found ${fontImports.length} font imports`);

        // 2. Optimize fonts
        console.log("🎨 Optimizing fonts...");
        const results = await optimizeFonts(fontImports, {
          outputDir,
          injectPreloads,
          injectCSS,
          subsetting,
        });

        console.log("✅ Font optimization completed!");
        console.log(`📄 Generated CSS: ${outputDir}/fonts.css`);

        if (results.preloadLinks.length > 0) {
          console.log(
            `🔗 Generated ${results.preloadLinks.length} preload links`
          );
        }
      } catch (error) {
        console.error("❌ Font optimization failed:", error);
        throw error;
      }
    },
  };
}

/**
 * Default export for easier importing
 */
export default angularFontPlugin;
