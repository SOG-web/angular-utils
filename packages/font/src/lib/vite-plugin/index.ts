import type { Plugin, ResolvedConfig } from "vite";
import type { ViteFontPluginOptions } from "./types.js";
import { scanForFontImports } from "./scanner.js";
import { optimizeFonts } from "./optimizer.js";
import {
  findFontsFile,
  findIndexHtml,
  findMainStylesFile,
} from "../core/file-discovery.js";
import {
  injectFontResources,
  injectTailwindV3,
  injectTailwindV4,
  type FontImportForInjection,
} from "../core/injection-utils.js";
import path from "node:path";
import fs from "node:fs";

/**
 * Vite plugin for Angular font optimization
 * Supports both Google Fonts and local fonts with subsetting
 */
export function angularFontPlugin(options: ViteFontPluginOptions = {}): Plugin {
  const {
    fontsFile,
    outputDir = "dist/assets",
    injectPreloads = true,
    injectCSS = true,
    subsetting = true,
    indexHtml,
    stylesFile,
    tailwindFile,
    injectTailwind = false,
    injectHTML = true,
  } = options;

  let config: ResolvedConfig;
  let resolvedFontsFile: string | null = null;
  let preloadLinksCache: string[] = [];
  let fontImportsCache: FontImportForInjection[] = [];

  return {
    name: "angular-font-plugin",
    enforce: "pre", // Run before other plugins to avoid TypeScript compilation issues

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    async buildStart() {
      console.log("🔤 Starting font optimization...");

      try {
        const root = config.root;

        // 1. Discover or use provided fonts file
        console.log("📁 Scanning for font imports...");
        resolvedFontsFile = fontsFile
          ? path.resolve(root, fontsFile)
          : findFontsFile(path.join(root, "src"));

        if (!resolvedFontsFile || !fs.existsSync(resolvedFontsFile)) {
          console.log("✅ No fonts file found, skipping optimization");
          return;
        }

        const fontImports = await scanForFontImports(resolvedFontsFile);

        if (fontImports.length === 0) {
          console.log("✅ No font imports found, skipping optimization");
          return;
        }

        console.log(`📦 Found ${fontImports.length} font imports`);

        // Cache font imports for HTML injection
        fontImportsCache = fontImports.map((f) => ({
          family: f.family,
          options: {
            variable: (f.options as any).variable,
            fallback: (f.options as any).fallback,
          },
        }));

        // 2. Optimize fonts
        console.log("🎨 Optimizing fonts...");
        const results = await optimizeFonts(fontImports, {
          outputDir,
          injectPreloads,
          injectCSS,
          subsetting,
        });

        console.log("✅ Font optimization completed!");

        // Cache preload links for HTML injection
        preloadLinksCache = results.preloadLinks;

        // 3. Add CSS variables to generated CSS
        if (injectCSS && results.css.trim()) {
          let enhancedCSS = results.css;

          // Add CSS variables to :root
          const hasVariables = fontImportsCache.some((f) => f.options.variable);
          if (hasVariables) {
            enhancedCSS +=
              "\n\n/* CSS Variables - Use with Tailwind or custom classes */\n:root {\n";
            for (const font of fontImportsCache) {
              if (font.options.variable) {
                const varName = font.options.variable;
                const fontStack = [
                  `'${font.family}'`,
                  ...(font.options.fallback || []),
                ].join(", ");

                enhancedCSS += `  ${varName}: ${fontStack};\n`;
              }
            }
            enhancedCSS += "}\n";
          }

          // Write enhanced CSS
          const cssPath = path.join(outputDir, "fonts.css");
          await fs.promises.writeFile(cssPath, enhancedCSS);

          console.log(`✅ Enhanced CSS written to: ${cssPath}`);
        }

        // 4. Inject Tailwind configuration if requested
        if (injectTailwind && fontImportsCache.length > 0) {
          const sourceRoot = path.join(root, "src");
          const version =
            typeof injectTailwind === "string" ? injectTailwind : "v4";

          if (version === "v4") {
            const resolvedStylesFile = stylesFile
              ? path.resolve(root, stylesFile)
              : undefined;
            injectTailwindV4(
              sourceRoot,
              root,
              fontImportsCache,
              resolvedStylesFile
            );
            console.log(`✅ Tailwind v4 configuration injected`);
          } else if (version === "v3") {
            const resolvedTailwindFile = tailwindFile
              ? path.resolve(root, tailwindFile)
              : undefined;
            injectTailwindV3(root, fontImportsCache, resolvedTailwindFile);

            console.log(`✅ Tailwind v3 configuration injected`);
          }
        }

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

    transformIndexHtml(html) {
      // Skip HTML processing if disabled
      if (injectHTML === false || indexHtml === false) {
        return html;
      }

      // Only inject if we have processed fonts
      if (preloadLinksCache.length === 0) {
        return html;
      }

      try {
        const root = config.root;

        // Discover or use provided index.html path
        const resolvedIndexHtml = indexHtml
          ? path.resolve(root, indexHtml)
          : findIndexHtml(path.join(root, "src"));

        if (!resolvedIndexHtml || !fs.existsSync(resolvedIndexHtml)) {
          return html;
        }

        // Inject font resources using idempotent markers
        const preloadLinksStr = preloadLinksCache.join("\n  ");
        injectFontResources(resolvedIndexHtml, preloadLinksStr);

        // Return the modified HTML
        return fs.readFileSync(resolvedIndexHtml, "utf8");
      } catch (error) {
        console.error("Failed to inject font resources into HTML:", error);
        return html;
      }
    },
    apply: "build",
  };
}

/**
 * Default export for easier importing
 */
export default angularFontPlugin;
