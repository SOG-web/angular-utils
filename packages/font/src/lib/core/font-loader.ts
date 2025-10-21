import type { FontResult } from "./types";
import { generateFontClassName } from "./css-generator";

/**
 * Font registry to track loaded fonts and prevent duplicates
 */
class FontRegistry {
  private fonts = new Map<string, FontResult>();
  private cssInjected = new Set<string>();

  register(key: string, result: FontResult): void {
    this.fonts.set(key, result);
  }

  get(key: string): FontResult | undefined {
    return this.fonts.get(key);
  }

  has(key: string): boolean {
    return this.fonts.has(key);
  }

  markCSSInjected(key: string): void {
    this.cssInjected.add(key);
  }

  isCSSInjected(key: string): boolean {
    return this.cssInjected.has(key);
  }
}

export const fontRegistry = new FontRegistry();

/**
 * Create a font result object
 */
export function createFontResult(
  family: string,
  className: string,
  variable?: string,
  weight?: number,
  style?: string
): FontResult {
  const result: FontResult = {
    className,
    style: {
      fontFamily: family,
    },
  };

  if (weight !== undefined) {
    result.style.fontWeight = weight;
  }

  if (style !== undefined) {
    result.style.fontStyle = style;
  }

  if (variable) {
    result.variable = variable;
  }

  return result;
}

/**
 * Generate a cache key for a font configuration
 */
export function generateFontKey(
  family: string,
  options: Record<string, any>
): string {
  const optionsStr = JSON.stringify(
    Object.keys(options)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = options[key];
          return acc;
        },
        {} as Record<string, any>
      )
  );
  return `${family}:${optionsStr}`;
}

/**
 * Inject CSS into the document (client-side only)
 */
export function injectCSS(css: string, id: string): void {
  if (typeof document === "undefined") {
    return; // Skip on server-side
  }

  // Check if already injected
  if (document.getElementById(id)) {
    return;
  }

  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Generate a unique ID for CSS injection
 */
export function generateCSSId(family: string): string {
  return `font-${family.toLowerCase().replace(/\s+/g, "-")}`;
}

/**
 * Format font family name (e.g., "Roboto Mono" -> "Roboto_Mono" for function names)
 */
export function formatFontFunctionName(family: string): string {
  return family.replace(/\s+/g, "_");
}

/**
 * Parse font family from function name (e.g., "Roboto_Mono" -> "Roboto Mono")
 */
export function parseFontFamily(functionName: string): string {
  return functionName.replace(/_/g, " ");
}

/**
 * Validate font display value
 */
export function validateDisplay(
  display?: string
): "auto" | "block" | "swap" | "fallback" | "optional" {
  const validDisplays = ["auto", "block", "swap", "fallback", "optional"];
  if (display && !validDisplays.includes(display)) {
    console.warn(
      `Invalid font display value: "${display}". Using "swap" instead.`
    );
    return "swap";
  }
  return (display as any) || "swap";
}

/**
 * Validate and normalize weights
 */
export function normalizeWeights(
  weights?: number[] | "variable"
): number[] | "variable" {
  if (weights === "variable") {
    return "variable";
  }

  if (!weights || weights.length === 0) {
    return [400];
  }

  // Validate weights are in valid range (100-900)
  return weights.filter((w) => {
    if (w < 100 || w > 900 || w % 100 !== 0) {
      console.warn(`Invalid font weight: ${w}. Skipping.`);
      return false;
    }
    return true;
  });
}

/**
 * Normalize subsets
 */
export function normalizeSubsets(subsets?: string[]): string[] {
  if (!subsets || subsets.length === 0) {
    return ["latin"];
  }
  return subsets;
}

/**
 * Check if we're running in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Check if we're running on the server
 */
export function isServer(): boolean {
  return !isBrowser();
}
