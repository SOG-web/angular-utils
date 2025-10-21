import type { FontData, FontFile, AdjustFontFallback } from "./types";

/**
 * Generate @font-face CSS declarations for a font
 */
export function generateFontFaceCSS(fontData: FontData): string {
  const cssRules: string[] = [];

  // Group font files by weight and style
  const fileGroups = groupFontFiles(fontData.files);

  for (const group of fileGroups) {
    const srcDeclarations = group.files
      .map((file) => `url('${file.url}') format('${file.format}')`)
      .join(",\n       ");

    const fontFace = `@font-face {
  font-family: '${fontData.family}';
  font-style: ${group.style || fontData.style || "normal"};
  font-weight: ${group.weight || fontData.weight || "400"};
  font-display: ${fontData.display};
  src: ${srcDeclarations};
${group.subset ? `  unicode-range: ${group.subset};` : ""}
}`;

    cssRules.push(fontFace);
  }

  // Add fallback font adjustments if provided
  if (fontData.adjustFontFallback) {
    cssRules.push(generateFallbackFontCSS(fontData.adjustFontFallback));
  }

  return cssRules.join("\n\n");
}

/**
 * Generate CSS class for the font
 */
export function generateFontClassName(
  family: string,
  variable?: string
): string {
  const sanitized = family.toLowerCase().replace(/\s+/g, "-");
  return variable
    ? `font-${sanitized}`
    : `__${sanitized}_${generateHash(family)}`;
}

/**
 * Generate CSS variable declaration
 */
export function generateCSSVariable(
  variable: string,
  family: string,
  fallback?: string[]
): string {
  const fontStack = [`'${family}'`, ...(fallback || [])].join(", ");

  return `${variable}: ${fontStack};`;
}

/**
 * Generate complete CSS including class and variable
 */
export function generateCompleteCSS(fontData: FontData): string {
  const fontFaceCSS = generateFontFaceCSS(fontData);
  const className = generateFontClassName(fontData.family, fontData.variable);

  let css = fontFaceCSS;

  // Add CSS variable if specified
  if (fontData.variable) {
    const fontStack = [
      `'${fontData.family}'`,
      ...(fontData.fallback || []),
    ].join(", ");

    css += `\n\n.${className} {
  ${fontData.variable}: ${fontStack};
}`;
  } else {
    // Add direct class
    const fontStack = [
      `'${fontData.family}'`,
      ...(fontData.fallback || []),
    ].join(", ");

    css += `\n\n.${className} {
  font-family: ${fontStack};
}`;
  }

  return css;
}

/**
 * Generate fallback font CSS with size adjustments
 */
function generateFallbackFontCSS(fallback: AdjustFontFallback): string {
  const declarations: string[] = [];

  if (fallback.ascentOverride) {
    declarations.push(`  ascent-override: ${fallback.ascentOverride};`);
  }
  if (fallback.descentOverride) {
    declarations.push(`  descent-override: ${fallback.descentOverride};`);
  }
  if (fallback.lineGapOverride) {
    declarations.push(`  line-gap-override: ${fallback.lineGapOverride};`);
  }
  if (fallback.sizeAdjust) {
    declarations.push(`  size-adjust: ${fallback.sizeAdjust};`);
  }

  if (declarations.length === 0) {
    return "";
  }

  return `@font-face {
  font-family: '${fallback.fallbackFont}';
${declarations.join("\n")}
}`;
}

/**
 * Group font files by weight, style, and subset
 */
function groupFontFiles(files: FontFile[]): Array<{
  files: FontFile[];
  weight?: string;
  style?: string;
  subset?: string;
}> {
  const groups = new Map<string, FontFile[]>();

  for (const file of files) {
    const key = `${file.weight || "default"}_${file.style || "normal"}_${file.subset || "default"}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(file);
  }

  return Array.from(groups.entries()).map(([key, files]) => {
    const [weight, style, subset] = key.split("_");
    return {
      files,
      weight: weight !== "default" ? weight : undefined,
      style: style !== "normal" ? style : undefined,
      subset: subset !== "default" ? subset : undefined,
    };
  });
}

/**
 * Generate a simple hash for unique class names
 */
function generateHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 6);
}

/**
 * Generate preload link tags for fonts
 */
export function generatePreloadLinks(files: FontFile[]): string {
  return files
    .filter((file) => file.preload)
    .map((file) => {
      return `<link rel="preload" href="${file.url}" as="font" type="font/${file.format}" crossorigin="anonymous">`;
    })
    .join("\n");
}
