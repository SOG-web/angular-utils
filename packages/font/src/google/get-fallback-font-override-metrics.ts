/**
 * Fallback font override metrics for reducing Cumulative Layout Shift (CLS)
 * These values help create fallback fonts that closely match the dimensions
 * of the target Google Font, minimizing layout shift during font loading.
 *
 * Based on Next.js font optimization techniques:
 * https://developer.chrome.com/blog/font-fallbacks/
 */

export interface FallbackFontMetrics {
  fallbackFont: string;
  ascentOverride: string;
  descentOverride: string;
  lineGapOverride: string;
  sizeAdjust: string;
}

/**
 * Get precalculated fallback font metrics for a Google Font family.
 *
 * Note: These metrics are calculated based on the font's characteristics
 * and help create fallback fonts that minimize layout shift.
 *
 * TODO: In the future, we could calculate these dynamically using fontkit
 * instead of relying on precalculated values. This would support all fonts
 * automatically as new fonts are added to Google Fonts.
 *
 * @param fontFamily - The Google Font family name
 * @returns Fallback font metrics or undefined if not available
 */
export function getFallbackFontOverrideMetrics(
  fontFamily: string
): FallbackFontMetrics | undefined {
  try {
    // For now, we use a basic fallback approach
    // In a production system, you would:
    // 1. Use precalculated metrics from Next.js or similar
    // 2. Calculate metrics dynamically using fontkit
    // 3. Store metrics in a separate JSON file

    const metrics = getBasicFallbackMetrics(fontFamily);

    if (!metrics) {
      console.warn(
        `No fallback metrics available for font "${fontFamily}". Using default fallback.`
      );
      return undefined;
    }

    return metrics;
  } catch (error) {
    console.error(
      `Failed to get fallback metrics for font "${fontFamily}":`,
      error
    );
    return undefined;
  }
}

/**
 * Get basic fallback metrics based on font category
 * This is a simplified approach - production systems should use
 * more accurate precalculated or dynamically calculated metrics
 */
function getBasicFallbackMetrics(
  fontFamily: string
): FallbackFontMetrics | undefined {
  // Determine if font is likely serif or sans-serif based on name
  const isLikelySerif =
    /serif|times|georgia|garamond|baskerville|crimson|lora|merriweather|playfair/i.test(
      fontFamily
    );

  const isLikelyMono =
    /mono|code|courier|inconsolata|source code|fira code|jetbrains|cascadia|consolas/i.test(
      fontFamily
    );

  if (isLikelyMono) {
    return {
      fallbackFont: "Courier New",
      ascentOverride: "90%",
      descentOverride: "25%",
      lineGapOverride: "0%",
      sizeAdjust: "100%",
    };
  } else if (isLikelySerif) {
    return {
      fallbackFont: "Times New Roman",
      ascentOverride: "90%",
      descentOverride: "22%",
      lineGapOverride: "0%",
      sizeAdjust: "100%",
    };
  } else {
    // Default to sans-serif (Arial)
    return {
      fallbackFont: "Arial",
      ascentOverride: "90%",
      descentOverride: "22%",
      lineGapOverride: "0%",
      sizeAdjust: "100%",
    };
  }
}

/**
 * Generate CSS for fallback font with override metrics
 * This CSS should be injected alongside the main font declaration
 */
export function generateFallbackFontCSS(
  fontFamily: string,
  metrics: FallbackFontMetrics
): string {
  return `
@font-face {
  font-family: '${fontFamily} Fallback';
  src: local('${metrics.fallbackFont}');
  ascent-override: ${metrics.ascentOverride};
  descent-override: ${metrics.descentOverride};
  line-gap-override: ${metrics.lineGapOverride};
  size-adjust: ${metrics.sizeAdjust};
}`.trim();
}
