import type { FontFile } from "../lib/core/types.js";
import type { GoogleFontOptions } from "../lib/core/google-font-options.js";
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
import { generatePreloadLinks } from "../lib/core/css-generator.js";
import { resolveCDNConfig } from "../lib/core/cdn-config.js";
import { retryWithStrategy } from "../lib/core/retry.js";
import { subsetGoogleFont } from "../lib/subsetting/google.js";

/**
 * Build-time font loader for Angular CLI builder
 * This function is only called during build time by the Angular builder
 *
 * DO NOT IMPORT THIS IN BROWSER CODE - it uses Node.js modules
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
  const weights = validateWeights(
    fontFamily,
    (options.weights || [400]) as number[] | "variable"
  );
  const subsets = validateSubsets(
    fontFamily,
    (options.subsets || ["latin"]) as string[]
  );
  const styles = validateStyles(
    fontFamily,
    (options.styles || ["normal"]) as string[]
  );

  // Resolve CDN configuration
  const cdnConfig = resolveCDNConfig(options.cdn);

  // Generate Google Fonts URL with subsetting
  const axes = getFontAxes(fontFamily, weights, styles);
  let url = getGoogleFontsUrl(
    fontFamily,
    axes,
    options.display || "swap",
    cdnConfig.cssUrl
  );

  // Apply subsetting if specified
  if (options.subset) {
    url = subsetGoogleFont(fontFamily, url, options.subset);
  }

  // Fetch CSS with retry strategy
  const css = await retryWithStrategy(
    () => fetchCSSFromGoogleFonts(url, fontFamily, false),
    options.retry,
    options.onRetry,
    options.onError
  );

  // Find font files
  const fontFiles = findFontFilesInCss(css, subsets);

  // Download font files
  const downloadedFiles: FontFile[] = [];
  const fontDir = `${outputPath}/assets/fonts/${fontFamily.toLowerCase().replace(/\s+/g, "-")}`;

  // Clean up old font files before downloading new ones
  try {
    await fs.promises.rm(fontDir, { recursive: true, force: true });
  } catch (error) {
    // Directory might not exist, which is fine
  }

  // Ensure directory exists
  await fs.promises.mkdir(fontDir, { recursive: true });

  for (const fontFile of fontFiles) {
    try {
      const fontBuffer = await retryWithStrategy(
        () => fetchFontFile(fontFile.googleFontFileUrl, false),
        options.retry,
        options.onRetry,
        options.onError
      );

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
    // Use replaceAll to replace all occurrences (important for variable fonts where the same file is used for multiple weights)
    optimizedCSS = optimizedCSS.replaceAll(
      fontFile.googleFontFileUrl,
      localPath
    );
  }

  // Add fallback font metrics if enabled (default: true)
  if (options.adjustFontFallback !== false) {
    const { getFallbackFontOverrideMetrics, generateFallbackFontCSS } =
      await import("./get-fallback-font-override-metrics.js");

    const metrics = getFallbackFontOverrideMetrics(fontFamily);
    if (metrics) {
      const fallbackCSS = generateFallbackFontCSS(fontFamily, metrics);
      optimizedCSS += "\n\n" + fallbackCSS;
    }
  }

  // Generate preload links
  const preloadLinks = generatePreloadLinks(downloadedFiles);

  return {
    css: optimizedCSS,
    files: downloadedFiles,
    preloadLinks,
  };
}
