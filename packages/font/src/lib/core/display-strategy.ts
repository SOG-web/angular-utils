import type { FontDisplay, FontDisplayStrategy } from "./types.js";

/**
 * Generate preconnect link for font CDN
 */
export function generatePreconnectLink(url: string): string {
  const domain = new URL(url).origin;
  return `<link rel="preconnect" href="${domain}" crossorigin>`;
}

/**
 * Generate DNS prefetch link
 */
export function generatePrefetchLink(url: string): string {
  const domain = new URL(url).origin;
  return `<link rel="dns-prefetch" href="${domain}">`;
}

/**
 * Generate prefetch link for font file
 */
export function generateFontPrefetchLink(
  url: string,
  type: string = "font/woff2"
): string {
  return `<link rel="prefetch" href="${url}" as="font" type="${type}" crossorigin>`;
}

/**
 * Convert display strategy to CSS font-display value
 */
export function resolveDisplayValue(
  display?: FontDisplay,
  strategy?: FontDisplayStrategy
): FontDisplay {
  // If custom strategy is provided, use 'optional' for maximum control
  if (strategy) {
    return "optional";
  }

  return display || "swap";
}

/**
 * Generate Font Loading API code for advanced display control
 * This is used for runtime font loading with custom timing
 */
export function generateFontLoadingAPI(
  fontFamily: string,
  strategy: FontDisplayStrategy
): string {
  const { blockPeriod = 0, swapPeriod = 3000, failurePeriod = 3000 } = strategy;

  return `
// Font Loading API for ${fontFamily}
if ('fonts' in document) {
  const font = new FontFace(
    '${fontFamily}',
    'url(...)',
    { display: 'optional' }
  );
  
  const loadTimeout = ${blockPeriod + swapPeriod + failurePeriod};
  
  Promise.race([
    font.load(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Font load timeout')), loadTimeout)
    )
  ])
    .then(() => document.fonts.add(font))
    .catch(err => console.warn('Font load failed:', err));
}
  `.trim();
}

/**
 * Generate CSS for font display with fallback
 */
export function generateDisplayCSS(
  fontFamily: string,
  display: FontDisplay,
  fallback: string[] = ["system-ui"]
): string {
  const fallbackList = [fontFamily, ...fallback]
    .map((f) => `'${f}'`)
    .join(", ");

  return `
.font-${fontFamily.toLowerCase().replace(/\s+/g, "-")} {
  font-family: ${fallbackList};
}
  `.trim();
}
