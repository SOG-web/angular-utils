import type {
  GoogleFontOptions,
  FontResult,
  FontFile,
} from "../lib/core/types";
import { validateWeights, validateSubsets, validateStyles } from "./metadata";
import {
  getGoogleFontsUrl,
  getFontAxes,
  findFontFilesInCss,
} from "./font-utils";
import { fetchCSSFromGoogleFonts, fetchFontFile } from "./fetch-resource";
import {
  generateFontClassName,
  generatePreloadLinks,
} from "../lib/core/css-generator";
import {
  createFontResult,
  generateFontKey,
  fontRegistry,
  injectCSS,
  generateCSSId,
} from "../lib/core/font-loader";
import fs from "node:fs";
import path from "node:path";

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

  // For build-time optimization, this would be handled by the Angular builder
  // For runtime, we can load fonts dynamically
  if (typeof window !== "undefined") {
    loadGoogleFontRuntime(fontFamily, {
      weights,
      subsets,
      styles,
      display,
      preload,
      fallback,
      variable,
    });
  }

  return result;
}

/**
 * Load Google Font at runtime (client-side only)
 */
async function loadGoogleFontRuntime(
  fontFamily: string,
  options: {
    weights: string[];
    subsets: string[];
    styles: string[];
    display: string;
    preload: boolean;
    fallback: string[];
    variable?: string;
  }
): Promise<void> {
  try {
    // Generate Google Fonts URL
    const axes = getFontAxes(fontFamily, options.weights, options.styles);
    const url = getGoogleFontsUrl(fontFamily, axes, options.display);

    // Fetch CSS
    const css = await fetchCSSFromGoogleFonts(url, fontFamily, true);

    // Find font files
    const fontFiles = findFontFilesInCss(css, options.subsets);

    // Generate optimized CSS with local font paths
    const optimizedCSS = generateOptimizedCSS(
      fontFamily,
      css,
      fontFiles,
      options
    );

    // Inject CSS
    const cssId = generateCSSId(fontFamily);
    injectCSS(optimizedCSS, cssId);

    // Mark as injected
    fontRegistry.markCSSInjected(generateFontKey(fontFamily, options));
  } catch (error) {
    console.error(`Failed to load Google Font "${fontFamily}":`, error);
  }
}

/**
 * Generate optimized CSS for Google Fonts
 */
function generateOptimizedCSS(
  fontFamily: string,
  originalCSS: string,
  fontFiles: Array<{ googleFontFileUrl: string; preloadFontFile: boolean }>,
  options: {
    display: string;
    fallback: string[];
    variable?: string;
  }
): string {
  // Replace Google Fonts URLs with local paths
  let optimizedCSS = originalCSS;

  for (const fontFile of fontFiles) {
    const localPath = `/assets/fonts/${fontFamily.toLowerCase().replace(/\s+/g, "-")}/${fontFile.googleFontFileUrl.split("/").pop()}`;
    optimizedCSS = optimizedCSS.replace(fontFile.googleFontFileUrl, localPath);
  }

  // Add CSS variable if specified
  if (options.variable) {
    const fontStack = [`'${fontFamily}'`, ...options.fallback].join(", ");

    optimizedCSS += `\n\n.${generateFontClassName(fontFamily, options.variable)} {
  ${options.variable}: ${fontStack};
}`;
  }

  return optimizedCSS;
}

/**
 * Build-time font loader for Angular CLI builder
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
