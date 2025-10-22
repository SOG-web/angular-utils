import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
} from "@angular-devkit/architect";
import { JsonObject } from "@angular-devkit/core";
import { loadGoogleFontBuildTime } from "../../../google/build-time-loader.js";
import { loadLocalFontBuildTime } from "../../../local/build-time-loader.js";
import { scanForFontImports, FontImport } from "./font-scanner.js";
import fs from "node:fs";
import path from "node:path";

export interface FontBuilderOptions extends JsonObject {
  outputPath: string;
  projectRoot: string;
  sourceRoot: string;
  fontFile: string;
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

      // 2. Clean up old font files before downloading new ones
      const fontsDir = `${outputPath}/assets/fonts`;
      try {
        await fs.promises.rm(fontsDir, { recursive: true, force: true });
        context.logger.info("🧹 Cleaned up old font files");
      } catch (error) {
        // Directory might not exist, which is fine
      }

      // 3. Process each font
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

      // 4. Generate combined CSS with utility classes and variables
      context.logger.info("🎨 Generating optimized CSS...");
      let combinedCSS = processedFonts.map((font) => font.css).join("\n\n");

      // 5. Add CSS variables to :root (no class conflicts with Tailwind)
      combinedCSS +=
        "\n\n/* CSS Variables - Use with Tailwind or custom classes */\n:root {\n";
      for (const fontImport of fontImports) {
        // Process both Google fonts and local fonts
        if (fontImport.options.variable) {
          const varName = fontImport.options.variable;
          const fontStack = [
            `'${fontImport.family}'`,
            ...(fontImport.options.fallback || []),
          ].join(", ");

          combinedCSS += `  ${varName}: ${fontStack};\n`;
        }
      }
      combinedCSS += "}\n";

      // 6. Write CSS to output
      const cssPath = `${outputPath}/assets/fonts.css`;
      await fs.promises.mkdir(`${outputPath}/assets`, { recursive: true });
      await fs.promises.writeFile(cssPath, combinedCSS);

      // 7. Generate preload links
      const preloadLinks = processedFonts
        .map((font) => font.preloadLinks)
        .filter((links) => links.trim())
        .join("\n");

      if (preloadLinks) {
        const preloadPath = `${outputPath}/assets/font-preloads.html`;
        await fs.promises.writeFile(preloadPath, preloadLinks);
      }

      // 8. Inject font CSS and preload links into index.html
      await injectFontResources(sourceRoot, preloadLinks, context);

      // 9. Inject Tailwind configuration if requested
      if (options.injectTailwind) {
        const version =
          typeof options.injectTailwind === "string"
            ? options.injectTailwind
            : "v4"; // Default to v4
        await injectTailwindSetup(
          sourceRoot,
          projectRoot,
          fontImports,
          version as "v3" | "v4",
          typeof options.tailwindFile === "string"
            ? options.tailwindFile
            : undefined,
          context
        );
      }

      // 10. Update angular.json assets if needed
      await updateAngularAssets(projectRoot, outputPath);

      context.logger.info("✅ Font optimization completed successfully!");
      context.logger.info(`📄 Generated CSS: ${cssPath}`);
      if (preloadLinks) {
        context.logger.info(`🔗 Preload links injected into index.html`);
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
 * Inject font CSS and preload links into index.html
 */
async function injectFontResources(
  sourceRoot: string,
  preloadLinks: string,
  context: BuilderContext
): Promise<void> {
  try {
    const indexPath = path.join(sourceRoot, "index.html");
    if (!fs.existsSync(indexPath)) {
      context.logger.warn(`index.html not found at ${indexPath}`);
      return;
    }

    let indexContent = fs.readFileSync(indexPath, "utf8");

    // 1. Add fonts.css link if not present
    if (!indexContent.includes('href="assets/fonts.css"')) {
      const fontCssLink = `  <link rel="stylesheet" href="assets/fonts.css">`;

      if (indexContent.includes("<!-- Font CSS -->")) {
        // Replace existing font CSS section
        indexContent = indexContent.replace(
          /<!-- Font CSS -->[\s\S]*?<!-- End Font CSS -->/,
          `<!-- Font CSS -->\n${fontCssLink}\n  <!-- End Font CSS -->`
        );
      } else {
        // Add before </head>
        const headCloseIndex = indexContent.indexOf("</head>");
        if (headCloseIndex !== -1) {
          const cssSection = `  <!-- Font CSS -->\n${fontCssLink}\n  <!-- End Font CSS -->\n`;
          indexContent =
            indexContent.slice(0, headCloseIndex) +
            cssSection +
            indexContent.slice(headCloseIndex);
        }
      }
      context.logger.info(`✅ Injected fonts.css link into index.html`);
    }

    // 2. Add preload links if provided
    if (preloadLinks) {
      if (indexContent.includes("<!-- Font Preloads -->")) {
        // Replace existing preload section
        indexContent = indexContent.replace(
          /<!-- Font Preloads -->[\s\S]*?<!-- End Font Preloads -->/,
          `<!-- Font Preloads -->\n  ${preloadLinks}\n  <!-- End Font Preloads -->`
        );
      } else {
        // Add preload links before </head>
        const headCloseIndex = indexContent.indexOf("</head>");
        if (headCloseIndex !== -1) {
          const preloadSection = `  <!-- Font Preloads -->\n  ${preloadLinks}\n  <!-- End Font Preloads -->\n`;
          indexContent =
            indexContent.slice(0, headCloseIndex) +
            preloadSection +
            indexContent.slice(headCloseIndex);
        }
      }
      context.logger.info(`✅ Injected font preloads into index.html`);
    }

    fs.writeFileSync(indexPath, indexContent, "utf8");
  } catch (error: any) {
    context.logger.warn(
      `Failed to inject font resources into index.html:`,
      error
    );
  }
}

/**
 * Inject Tailwind CSS configuration for fonts
 */
async function injectTailwindSetup(
  sourceRoot: string,
  projectRoot: string,
  fontImports: FontImport[],
  version: "v3" | "v4",
  customTailwindFile: string | undefined,
  context: BuilderContext
): Promise<void> {
  try {
    if (version === "v4") {
      await injectTailwindV4(
        sourceRoot,
        projectRoot,
        fontImports,
        customTailwindFile,
        context
      );
    } else {
      await injectTailwindV3(
        projectRoot,
        fontImports,
        customTailwindFile,
        context
      );
    }
  } catch (error: any) {
    context.logger.warn(`Failed to inject Tailwind configuration:`, error);
  }
}

/**
 * Inject Tailwind v4 @theme configuration
 */
async function injectTailwindV4(
  sourceRoot: string,
  projectRoot: string,
  fontImports: FontImport[],
  customFile: string | undefined,
  context: BuilderContext
): Promise<void> {
  // Find the main styles file
  const stylesFile = customFile || findMainStylesFile(sourceRoot, projectRoot);
  if (!stylesFile || !fs.existsSync(stylesFile)) {
    context.logger.warn("Styles file not found for Tailwind injection");
    return;
  }

  let stylesContent = fs.readFileSync(stylesFile, "utf8");

  // Build theme configuration - only generate unique font names
  const fontConfig: string[] = [];

  for (const f of fontImports.filter((f) => f.options.variable)) {
    const varName = f.options.variable;
    const fallbacks = f.options.fallback || ["system-ui", "sans-serif"];
    const fontStack = `var(${varName}), ${fallbacks.join(", ")}`;
    const uniqueName = f.family.toLowerCase().replace(/\s+/g, "-");

    // Only add unique font name - let Tailwind handle sans/serif/mono
    fontConfig.push(`  --font-family-${uniqueName}: ${fontStack};`);
  }

  // Add helper comment for standard Tailwind classes
  const helperComment = `  /* To use standard Tailwind classes (font-sans, font-serif), add them here:
   * --font-family-sans: var(--font-inter), system-ui, sans-serif;
   * --font-family-serif: var(--font-playfair-display), serif;
   */`;

  const themeBlock = `
/* Font Configuration - Generated by angular-fonts */
@theme {
${helperComment}
${fontConfig.join("\n")}
}
`;

  // Check if theme block already exists
  if (
    stylesContent.includes(
      "/* Font Configuration - Generated by angular-fonts */"
    )
  ) {
    // Replace existing
    stylesContent = stylesContent.replace(
      /\/\* Font Configuration - Generated by @angular-utils\/font \*\/[\s\S]*?@theme \{[\s\S]*?\}\n/,
      themeBlock
    );
  } else {
    // Add after @import 'tailwindcss';
    if (stylesContent.includes("@import 'tailwindcss'")) {
      stylesContent = stylesContent.replace(
        /@import 'tailwindcss';/,
        `@import 'tailwindcss';${themeBlock}`
      );
    } else {
      // Add at the end
      stylesContent += `\n${themeBlock}`;
    }
  }

  fs.writeFileSync(stylesFile, stylesContent, "utf8");
  context.logger.info(
    `✅ Injected Tailwind v4 configuration into ${path.basename(stylesFile)}`
  );
}

/**
 * Inject Tailwind v3 configuration
 */
async function injectTailwindV3(
  projectRoot: string,
  fontImports: FontImport[],
  customFile: string | undefined,
  context: BuilderContext
): Promise<void> {
  const configFile = customFile || findTailwindConfig(projectRoot);
  if (!configFile || !fs.existsSync(configFile)) {
    context.logger.warn(
      "tailwind.config.js not found for Tailwind v3 injection"
    );
    return;
  }

  let configContent = fs.readFileSync(configFile, "utf8");

  // Build fontFamily configuration - only generate unique font names
  const fontFamilies: string[] = [];

  for (const f of fontImports.filter((f) => f.options.variable)) {
    const varName = f.options.variable;
    const fallbacks = f.options.fallback || ["system-ui", "sans-serif"];
    const fontStack = `['var(${varName})', ${fallbacks.map((fb) => `'${fb}'`).join(", ")}]`;
    const uniqueName = f.family.toLowerCase().replace(/\s+/g, "-");

    // Only add unique font name - let user configure sans/serif/mono manually
    fontFamilies.push(`        '${uniqueName}': ${fontStack},`);
  }

  // Add helper comment
  const helperComment = `        // To use standard Tailwind classes (font-sans, font-serif), add them here:
        // sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        // serif: ['var(--font-playfair-display)', 'serif'],`;

  const fontConfig = `      fontFamily: {
${helperComment}
${fontFamilies.join("\n")}
      },`;

  // Insert into theme.extend or create it
  if (configContent.includes("extend:")) {
    // Add to existing extend
    if (configContent.includes("fontFamily:")) {
      // Replace existing fontFamily
      configContent = configContent.replace(
        /fontFamily:\s*\{[^}]*\},?/,
        fontConfig
      );
    } else {
      // Add fontFamily to extend
      configContent = configContent.replace(
        /(extend:\s*\{)/,
        `$1\n${fontConfig}`
      );
    }
  } else {
    // Create theme.extend
    configContent = configContent.replace(
      /(module\.exports\s*=\s*\{)/,
      `$1\n  theme: {\n    extend: {\n${fontConfig}\n    }\n  },`
    );
  }

  fs.writeFileSync(configFile, configContent, "utf8");
  context.logger.info(
    `✅ Injected Tailwind v3 configuration into ${path.basename(configFile)}`
  );
}

/**
 * Find the main styles file
 */
function findMainStylesFile(
  sourceRoot: string,
  projectRoot: string
): string | null {
  const possibleFiles = [
    path.join(sourceRoot, "styles.css"),
    path.join(sourceRoot, "styles.scss"),
    path.join(sourceRoot, "styles.sass"),
    path.join(sourceRoot, "styles.less"),
    path.join(sourceRoot, "global.css"),
    path.join(sourceRoot, "app/globals.css"),
  ];

  for (const file of possibleFiles) {
    if (fs.existsSync(file)) {
      return file;
    }
  }

  return null;
}

/**
 * Find Tailwind config file
 */
function findTailwindConfig(projectRoot: string): string | null {
  const possibleFiles = [
    path.join(projectRoot, "tailwind.config.js"),
    path.join(projectRoot, "tailwind.config.ts"),
    path.join(projectRoot, "tailwind.config.cjs"),
    path.join(projectRoot, "tailwind.config.mjs"),
  ];

  for (const file of possibleFiles) {
    if (fs.existsSync(file)) {
      return file;
    }
  }

  return null;
}

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
        input: "node_modules/angular-fonts/dist/assets",
        output: "assets/fonts",
      },
    ];

    // Check if font assets are already configured
    const hasFontAssets = buildOptions.assets.some(
      (asset: any) => asset.input && asset.input.includes("angular-fonts")
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
