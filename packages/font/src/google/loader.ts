import type { FontResult } from "../lib/core/types.js";
import { GoogleFontOptions } from "../lib/core/google-font-options.js";
import type {
  GoogleFontFamily,
  WeightsFor,
  SubsetsFor,
  StylesFor,
  AxesFor,
} from "./font-families.js";
import {
  validateWeights,
  validateSubsets,
  validateStyles,
} from "./metadata.js";
import { generateFontClassName } from "../lib/core/css-generator.js";
import {
  createFontResult,
  generateFontKey,
  fontRegistry,
} from "../lib/core/font-loader.js";

/**
 * Create a Google Font configuration with strict typing
 * Provides autocomplete for weights, subsets, styles, and axes based on the specific font family
 */
export function createGoogleFont<T extends GoogleFontFamily>(
  fontFamily: T,
  options: GoogleFontOptions<
    T,
    WeightsFor<T>,
    SubsetsFor<T>,
    StylesFor<T>,
    AxesFor<T>
  > = {} as GoogleFontOptions<
    T,
    WeightsFor<T>,
    SubsetsFor<T>,
    StylesFor<T>,
    AxesFor<T>
  >
): FontResult {
  // Validate and normalize options
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

// Build-time loader has been moved to build-time-loader.ts
// This keeps Node.js dependencies out of the browser bundle
