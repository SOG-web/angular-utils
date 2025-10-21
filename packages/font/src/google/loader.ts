import type {
  GoogleFontOptions,
  FontResult,
  FontFile,
} from "../lib/core/types.js";
import {
  validateWeights,
  validateSubsets,
  validateStyles,
} from "./metadata.js";
import {
  getGoogleFontsUrl,
  getFontAxes,
  findFontFilesInCss,
} from "./font-utils.js";
import {
  generateFontClassName,
  generatePreloadLinks,
} from "../lib/core/css-generator.js";
import {
  createFontResult,
  generateFontKey,
  fontRegistry,
} from "../lib/core/font-loader.js";

/**
 * Create a Google Font configuration
 */
export function createGoogleFont(
  fontFamily: string,
  options: GoogleFontOptions = {}
): FontResult {
  // Validate and normalize options
  const weights = validateWeights(fontFamily, options.weights || [400]);
  const subsets = validateSubsets(fontFamily, options.subsets || ["latin"]);
  const styles = validateStyles(fontFamily, options.styles || ["normal"]);

  const display = options.display || "swap";
  const preload = options.preload !== false;
  const fallback = options.fallback || [];
  const variable = options.variable;

  // Generate cache key
  const cacheKey = generateFontKey(fontFamily, {
    weights,
    subsets,
    styles,
    display,
    preload,
    fallback,
    variable,
  });

  // Check if already loaded
  if (fontRegistry.has(cacheKey)) {
    return fontRegistry.get(cacheKey)!;
  }

  // Generate font result
  const className = generateFontClassName(fontFamily, variable);
  const result = createFontResult(fontFamily, className, variable);

  // Register the font
  fontRegistry.register(cacheKey, result);

  // NOTE: Fonts are loaded via CSS at build time by the Angular builder
  // No runtime loading happens - this is a pure function that only returns metadata

  return result;
}

/**
 * Build-time font loader for Angular CLI builder
 * This function is only called during build time by the Angular builder
 */
export async function loadGoogleFontBuildTime(
  fontFamily: string,
  options: GoogleFontOptions,
  outputPath: string
): Promise<{
  css: string;
  files: FontFile[];
  preloadLinks: string;
}> {
  // Dynamic import to avoid loading Node.js modules in browser
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { fetchCSSFromGoogleFonts, fetchFontFile } = await import(
    "./fetch-resource.js"
  );

  // Validate options
  const weights = validateWeights(fontFamily, options.weights || [400]);
  const subsets = validateSubsets(fontFamily, options.subsets || ["latin"]);
  const styles = validateStyles(fontFamily, options.styles || ["normal"]);

  // Generate Google Fonts URL
  const axes = getFontAxes(fontFamily, weights, styles);
  const url = getGoogleFontsUrl(fontFamily, axes, options.display || "swap");

  // Fetch CSS
  const css = await fetchCSSFromGoogleFonts(url, fontFamily, false);

  // Find font files
  const fontFiles = findFontFilesInCss(css, subsets);

  // Download font files
  const downloadedFiles: FontFile[] = [];
  const fontDir = `${outputPath}/assets/fonts/${fontFamily.toLowerCase().replace(/\s+/g, "-")}`;

  // Ensure directory exists
  await fs.promises.mkdir(fontDir, { recursive: true });

  for (const fontFile of fontFiles) {
    try {
      const fontBuffer = await fetchFontFile(fontFile.googleFontFileUrl, false);
      const fileName = fontFile.googleFontFileUrl.split("/").pop()!;
      const filePath = path.join(fontDir, fileName);

      await fs.promises.writeFile(filePath, fontBuffer);

      downloadedFiles.push({
        url: `/assets/fonts/${fontFamily.toLowerCase().replace(/\s+/g, "-")}/${fileName}`,
        format: fileName.split(".").pop()!,
        preload: fontFile.preloadFontFile,
      });
    } catch (error) {
      console.error(
        `Failed to download font file: ${fontFile.googleFontFileUrl}`,
        error
      );
    }
  }

  // Generate optimized CSS
  let optimizedCSS = css;
  for (const fontFile of fontFiles) {
    const fileName = fontFile.googleFontFileUrl.split("/").pop()!;
    const localPath = `/assets/fonts/${fontFamily.toLowerCase().replace(/\s+/g, "-")}/${fileName}`;
    optimizedCSS = optimizedCSS.replace(fontFile.googleFontFileUrl, localPath);
  }

  // Generate preload links
  const preloadLinks = generatePreloadLinks(downloadedFiles);

  return {
    css: optimizedCSS,
    files: downloadedFiles,
    preloadLinks,
  };
}
