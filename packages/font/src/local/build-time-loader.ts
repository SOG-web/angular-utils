import type { LocalFontOptions, FontFile } from "../lib/core/types.js";
import { validateLocalFontFunctionCall } from "./loader.js";

/**
 * Generate CSS for local fonts with fallback support
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

  return cssRules.join("\n\n");
}

/**
 * Generate fallback font CSS for local fonts
 * Uses a simple heuristic approach similar to Google Fonts
 */
function generateLocalFontFallbackCSS(
  fontFamily: string,
  fallbackFont: string
): string {
  return `
@font-face {
  font-family: '${fontFamily} Fallback';
  src: local('${fallbackFont}');
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
  size-adjust: 100%;
}`.trim();
}

/**
 * Determine fallback font based on font family name or explicit option
 */
function determineFallbackFont(
  fontFamily: string,
  adjustFontFallback?: string | false
): string | null {
  if (adjustFontFallback === false) {
    return null;
  }

  // If explicitly specified, use it
  if (typeof adjustFontFallback === "string") {
    return adjustFontFallback;
  }

  // Auto-detect based on font name
  const lowerName = fontFamily.toLowerCase();

  if (/serif|times|georgia|garamond|baskerville|crimson|lora|merriweather|playfair/i.test(lowerName)) {
    return "Times New Roman";
  } else if (/mono|code|courier|inconsolata|source code|fira code|jetbrains|cascadia|consolas/i.test(lowerName)) {
    return "Courier New";
  } else {
    // Default to sans-serif
    return "Arial";
  }
}

/**
 * Build-time local font loader for Angular CLI builder
 * This function is only called during build time by the Angular builder
 *
 * DO NOT IMPORT THIS IN BROWSER CODE - it uses Node.js modules
 */
export async function loadLocalFontBuildTime(
  options: LocalFontOptions,
  outputPath: string
): Promise<{
  css: string;
  files: FontFile[];
  preloadLinks: string;
}> {
  // Dynamic import to avoid loading Node.js modules in browser
  const fs = await import("node:fs");
  const path = await import("node:path");

  const validated = validateLocalFontFunctionCall("localFont", options);

  // Copy font files to output directory
  const fontDir = `${outputPath}/assets/fonts/local`;
  await fs.promises.mkdir(fontDir, { recursive: true });

  const files: FontFile[] = [];

  for (const src of validated.src) {
    try {
      // Copy file to output directory
      const fileName = path.basename(src.path);
      const destPath = path.join(fontDir, fileName);

      await fs.promises.copyFile(src.path, destPath);

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
  
  let css = generateLocalFontCSS(fontFamily, {
    ...validated,
    src: validated.src.map((src) => ({
      ...src,
      path: `/assets/fonts/local/${path.basename(src.path)}`,
    })),
  });

  // Add fallback font metrics if enabled (default: based on font name)
  const fallbackFont = determineFallbackFont(
    fontFamily,
    validated.adjustFontFallback
  );

  if (fallbackFont) {
    const fallbackCSS = generateLocalFontFallbackCSS(fontFamily, fallbackFont);
    css += "\n\n" + fallbackCSS;
  }

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

