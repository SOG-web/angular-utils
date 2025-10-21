import fs from "node:fs";
import path from "node:path";
import type {
  LocalFontOptions,
  FontResult,
  FontFile,
  AdjustFontFallback,
} from "../lib/core/types";
import {
  generateFontClassName,
  generateCompleteCSS,
} from "../lib/core/css-generator";
import {
  createFontResult,
  generateFontKey,
  fontRegistry,
  injectCSS,
  generateCSSId,
} from "../lib/core/font-loader";

// Import fontkit for font analysis
let fontkit: any;
try {
  fontkit = require("fontkit");
} catch (error) {
  console.warn("fontkit not available, fallback metrics will not be generated");
}

/**
 * Calculate average character width from font metrics
 */
function calcAverageWidth(font: any): number | undefined {
  const testString = "abcxyzABCXYZ1234567890";
  let totalWidth = 0;
  let count = 0;

  for (const char of testString) {
    const glyph = font.getGlyph(char);
    if (glyph) {
      totalWidth += glyph.advanceWidth;
      count++;
    }
  }

  return count > 0 ? totalWidth / count : undefined;
}

/**
 * Format override value for CSS
 */
function formatOverrideValue(val: number): string {
  return `${Math.round(val * 100)}%`;
}

/**
 * Get fallback metrics from font file
 */
export function getFallbackMetricsFromFontFile(
  font: any,
  category = "serif"
): AdjustFontFallback {
  const metrics = font.metrics;
  const avgWidth = calcAverageWidth(font);

  // Determine fallback font based on category
  const fallbackFont = category === "serif" ? "Times New Roman" : "Arial";

  // Calculate size adjustment based on average width
  const sizeAdjust = avgWidth
    ? formatOverrideValue(avgWidth / metrics.unitsPerEm)
    : undefined;

  return {
    fallbackFont,
    ascentOverride: formatOverrideValue(metrics.ascent / metrics.unitsPerEm),
    descentOverride: formatOverrideValue(
      Math.abs(metrics.descent) / metrics.unitsPerEm
    ),
    lineGapOverride: formatOverrideValue(metrics.lineGap / metrics.unitsPerEm),
    sizeAdjust,
  };
}

/**
 * Pick the best font file for fallback generation
 */
export function pickFontFileForFallbackGeneration<
  T extends { style?: string; weight?: string },
>(fontFiles: T[]): T {
  // Prefer normal style, normal weight
  const normalNormal = fontFiles.find(
    (f) =>
      (f.style === "normal" || !f.style) &&
      (f.weight === "400" || f.weight === "normal" || !f.weight)
  );

  if (normalNormal) return normalNormal;

  // Prefer normal style
  const normalStyle = fontFiles.find((f) => f.style === "normal" || !f.style);
  if (normalStyle) return normalStyle;

  // Prefer normal weight
  const normalWeight = fontFiles.find(
    (f) => f.weight === "400" || f.weight === "normal" || !f.weight
  );
  if (normalWeight) return normalWeight;

  // Return first file
  return fontFiles[0];
}

/**
 * Validate local font function call
 */
export function validateLocalFontFunctionCall(
  functionName: string,
  fontData: any
): {
  src: Array<{
    path: string;
    weight?: string;
    style?: string;
    ext: string;
    format: string;
  }>;
  display: string;
  weight?: string;
  style?: string;
  fallback?: string[];
  preload: boolean;
  variable?: string;
  adjustFontFallback?: string | false;
  declarations?: Array<{ prop: string; value: string }>;
} {
  if (!fontData || typeof fontData !== "object") {
    throw new Error(`${functionName}() requires an object as its argument`);
  }

  const {
    src,
    display = "swap",
    weight,
    style,
    fallback,
    preload = true,
    variable,
    adjustFontFallback,
    declarations,
  } = fontData;

  if (!src) {
    throw new Error(`${functionName}() requires a \`src\` property`);
  }

  // Normalize src to array format
  const srcArray = Array.isArray(src) ? src : [{ path: src, weight, style }];

  // Validate and normalize each source
  const normalizedSrc = srcArray.map((item, index) => {
    if (typeof item === "string") {
      return {
        path: item,
        weight,
        style,
        ext: path.extname(item).slice(1),
        format: getFontFormat(path.extname(item)),
      };
    }

    if (typeof item !== "object" || !item.path) {
      throw new Error(
        `${functionName}() src[${index}] must be a string or object with a \`path\` property`
      );
    }

    return {
      path: item.path,
      weight: item.weight || weight,
      style: item.style || style,
      ext: path.extname(item.path).slice(1),
      format: getFontFormat(path.extname(item.path)),
    };
  });

  return {
    src: normalizedSrc,
    display,
    weight,
    style,
    fallback,
    preload,
    variable,
    adjustFontFallback,
    declarations,
  };
}

/**
 * Get font format from file extension
 */
function getFontFormat(ext: string): string {
  const formatMap: Record<string, string> = {
    ".woff2": "woff2",
    ".woff": "woff",
    ".ttf": "truetype",
    ".otf": "opentype",
    ".eot": "embedded-opentype",
  };

  return formatMap[ext.toLowerCase()] || "truetype";
}

/**
 * Create a local font configuration
 */
export function localFont(options: LocalFontOptions): FontResult {
  // Validate options
  const validated = validateLocalFontFunctionCall("localFont", options);

  // Generate cache key
  const cacheKey = generateFontKey("local", {
    src: validated.src,
    display: validated.display,
    weight: validated.weight,
    style: validated.style,
    fallback: validated.fallback,
    preload: validated.preload,
    variable: validated.variable,
    adjustFontFallback: validated.adjustFontFallback,
  });

  // Check if already loaded
  if (fontRegistry.has(cacheKey)) {
    return fontRegistry.get(cacheKey)!;
  }

  // Generate font family name from first file path
  const fontFamily = path.basename(
    validated.src[0].path,
    path.extname(validated.src[0].path)
  );

  // Generate font result
  const className = generateFontClassName(fontFamily, validated.variable);
  const result = createFontResult(fontFamily, className, validated.variable);

  // Register the font
  fontRegistry.register(cacheKey, result);

  // For build-time optimization, this would be handled by the Angular builder
  // For runtime, we can load fonts dynamically
  if (typeof window !== "undefined") {
    loadLocalFontRuntime(fontFamily, validated);
  }

  return result;
}

/**
 * Load local font at runtime (client-side only)
 */
async function loadLocalFontRuntime(
  fontFamily: string,
  options: {
    src: Array<{
      path: string;
      weight?: string;
      style?: string;
      ext: string;
      format: string;
    }>;
    display: string;
    weight?: string;
    style?: string;
    fallback?: string[];
    preload: boolean;
    variable?: string;
    adjustFontFallback?: string | false;
    declarations?: Array<{ prop: string; value: string }>;
  }
): Promise<void> {
  try {
    // Generate CSS for local fonts
    const css = generateLocalFontCSS(fontFamily, options);

    // Inject CSS
    const cssId = generateCSSId(fontFamily);
    injectCSS(css, cssId);

    // Mark as injected
    fontRegistry.markCSSInjected(generateFontKey("local", options));
  } catch (error) {
    console.error(`Failed to load local font "${fontFamily}":`, error);
  }
}

/**
 * Generate CSS for local fonts
 */
function generateLocalFontCSS(
  fontFamily: string,
  options: {
    src: Array<{
      path: string;
      weight?: string;
      style?: string;
      ext: string;
      format: string;
    }>;
    display: string;
    weight?: string;
    style?: string;
    fallback?: string[];
    variable?: string;
    adjustFontFallback?: string | false;
    declarations?: Array<{ prop: string; value: string }>;
  }
): string {
  const cssRules: string[] = [];

  // Group sources by weight and style
  const groupedSources = new Map<string, typeof options.src>();

  for (const src of options.src) {
    const key = `${src.weight || "normal"}_${src.style || "normal"}`;
    if (!groupedSources.has(key)) {
      groupedSources.set(key, []);
    }
    groupedSources.get(key)!.push(src);
  }

  // Generate @font-face rules
  for (const [key, sources] of groupedSources) {
    const [weight, style] = key.split("_");

    const srcDeclarations = sources
      .map((src) => `url('${src.path}') format('${src.format}')`)
      .join(",\n       ");

    let fontFace = `@font-face {
  font-family: '${fontFamily}';
  font-style: ${style};
  font-weight: ${weight};
  font-display: ${options.display};
  src: ${srcDeclarations};`;

    // Add custom declarations
    if (options.declarations) {
      for (const decl of options.declarations) {
        fontFace += `\n  ${decl.prop}: ${decl.value};`;
      }
    }

    fontFace += "\n}";
    cssRules.push(fontFace);
  }

  // Add CSS variable if specified
  if (options.variable) {
    const fontStack = [`'${fontFamily}'`, ...(options.fallback || [])].join(
      ", "
    );

    cssRules.push(`\n.${generateFontClassName(fontFamily, options.variable)} {
  ${options.variable}: ${fontStack};
}`);
  }

  return cssRules.join("\n\n");
}

/**
 * Build-time local font loader for Angular CLI builder
 */
export async function loadLocalFontBuildTime(
  options: LocalFontOptions,
  outputPath: string
): Promise<{
  css: string;
  files: FontFile[];
  preloadLinks: string;
}> {
  const validated = validateLocalFontFunctionCall("localFont", options);

  // Copy font files to output directory
  const fontDir = `${outputPath}/assets/fonts/local`;
  await fs.promises.mkdir(fontDir, { recursive: true });

  const files: FontFile[] = [];

  for (const src of validated.src) {
    try {
      // Copy file to output directory
      const fileName = path.basename(src.path);
      const outputPath = path.join(fontDir, fileName);

      await fs.promises.copyFile(src.path, outputPath);

      files.push({
        url: `/assets/fonts/local/${fileName}`,
        format: src.format,
        preload: validated.preload,
        weight: src.weight,
        style: src.style,
      });
    } catch (error) {
      console.error(`Failed to copy font file: ${src.path}`, error);
    }
  }

  // Generate CSS with updated paths
  const fontFamily = path.basename(
    validated.src[0].path,
    path.extname(validated.src[0].path)
  );
  const css = generateLocalFontCSS(fontFamily, {
    ...validated,
    src: validated.src.map((src) => ({
      ...src,
      path: `/assets/fonts/local/${path.basename(src.path)}`,
    })),
  });

  // Generate preload links
  const preloadLinks = files
    .filter((file) => file.preload)
    .map(
      (file) =>
        `<link rel="preload" href="${file.url}" as="font" type="font/${file.format}" crossorigin="anonymous">`
    )
    .join("\n");

  return {
    css,
    files,
    preloadLinks,
  };
}
