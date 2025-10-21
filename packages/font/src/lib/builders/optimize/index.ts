import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
} from "@angular-devkit/architect";
import { JsonObject } from "@angular-devkit/core";
import { loadGoogleFontBuildTime } from "../../../google/loader";
import { loadLocalFontBuildTime } from "../../../local/loader";
import { scanForFontImports } from "./font-scanner";
import fs from "node:fs";
import path from "node:path";

export interface FontBuilderOptions extends JsonObject {
  outputPath: string;
  projectRoot: string;
  sourceRoot: string;
  fontFile?: string | undefined;
  assets?: string[];
  styles?: string[];
}

/**
 * Angular CLI builder for font optimization
 */
export default createBuilder<FontBuilderOptions>(
  async (options, context): Promise<BuilderOutput> => {
    const { outputPath, projectRoot, sourceRoot, fontFile } = options;

    try {
      context.logger.info("🔤 Starting font optimization...");

      // 1. Scan source files for font imports
      context.logger.info("📁 Scanning for font imports...");
      const fontImports = await scanForFontImports(
        sourceRoot,
        projectRoot,
        fontFile
      );

      if (fontImports.length === 0) {
        context.logger.info("✅ No font imports found, skipping optimization");
        return { success: true };
      }

      context.logger.info(`📦 Found ${fontImports.length} font imports`);

      // 2. Process each font
      const processedFonts: Array<{
        type: "google" | "local";
        family: string;
        css: string;
        files: any[];
        preloadLinks: string;
      }> = [];

      for (const fontImport of fontImports) {
        context.logger.info(
          `🔄 Processing ${fontImport.type} font: ${fontImport.family}`
        );

        if (fontImport.type === "google") {
          const result = await loadGoogleFontBuildTime(
            fontImport.family,
            fontImport.options,
            outputPath
          );
          processedFonts.push({
            type: "google",
            family: fontImport.family,
            ...result,
          });
        } else if (fontImport.type === "local") {
          const result = await loadLocalFontBuildTime(
            fontImport.options,
            outputPath
          );
          processedFonts.push({
            type: "local",
            family: fontImport.family,
            ...result,
          });
        }
      }

      // 3. Generate combined CSS
      context.logger.info("🎨 Generating optimized CSS...");
      const combinedCSS = processedFonts.map((font) => font.css).join("\n\n");

      // 4. Write CSS to output
      const cssPath = `${outputPath}/assets/fonts.css`;
      await fs.promises.mkdir(`${outputPath}/assets`, { recursive: true });
      await fs.promises.writeFile(cssPath, combinedCSS);

      // 5. Generate preload links
      const preloadLinks = processedFonts
        .map((font) => font.preloadLinks)
        .filter((links) => links.trim())
        .join("\n");

      if (preloadLinks) {
        const preloadPath = `${outputPath}/assets/font-preloads.html`;
        await fs.promises.writeFile(preloadPath, preloadLinks);
      }

      // 6. Update angular.json assets if needed
      await updateAngularAssets(projectRoot, outputPath);

      context.logger.info("✅ Font optimization completed successfully!");
      context.logger.info(`📄 Generated CSS: ${cssPath}`);
      if (preloadLinks) {
        context.logger.info(
          `🔗 Generated preload links: ${outputPath}/assets/font-preloads.html`
        );
      }

      return { success: true };
    } catch (error: any) {
      context.logger.error("❌ Font optimization failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
);

/**
 * Update angular.json to include font assets
 */
async function updateAngularAssets(
  projectRoot: string,
  outputPath: string
): Promise<void> {
  try {
    const angularJsonPath = path.join(projectRoot, "angular.json");
    if (!fs.existsSync(angularJsonPath)) {
      return; // Skip if no angular.json
    }

    const angularJson = JSON.parse(
      fs.readFileSync(angularJsonPath, "utf8")
    ) as any;

    // Find the project configuration
    const projectName = Object.keys(angularJson.projects || {})[0];
    if (!projectName) return;

    const project = angularJson.projects[projectName];
    if (!project?.architect?.build?.options) return;

    const buildOptions = project.architect.build.options;

    // Add font assets if not already present
    if (!buildOptions.assets) {
      buildOptions.assets = [];
    }

    const fontAssets = [
      {
        glob: "**/*",
        input: "node_modules/@angular-utils/font/dist/assets",
        output: "assets/fonts",
      },
    ];

    // Check if font assets are already configured
    const hasFontAssets = buildOptions.assets.some(
      (asset: any) => asset.input && asset.input.includes("@angular-utils/font")
    );

    if (!hasFontAssets) {
      buildOptions.assets.push(...fontAssets);

      // Write back to angular.json
      fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));
    }
  } catch (error) {
    console.warn("Failed to update angular.json:", error);
  }
}
