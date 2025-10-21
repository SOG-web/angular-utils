import type { CDNConfig } from "./types.js";

/**
 * Default CDN configuration for Google Fonts
 */
export const DEFAULT_CDN_CONFIG: Required<CDNConfig> = {
  cssUrl: "https://fonts.googleapis.com/css2",
  fontUrl: "https://fonts.gstatic.com",
};

/**
 * Resolved CDN configuration
 */
export interface ResolvedCDNConfig {
  cssUrl: string;
  fontUrl: string;
}

/**
 * Resolve CDN configuration with defaults
 */
export function resolveCDNConfig(config?: CDNConfig): ResolvedCDNConfig {
  return {
    cssUrl: config?.cssUrl || DEFAULT_CDN_CONFIG.cssUrl,
    fontUrl: config?.fontUrl || DEFAULT_CDN_CONFIG.fontUrl,
  };
}

/**
 * Build Google Fonts CSS URL with CDN config
 */
export function buildGoogleFontsCSSUrl(
  baseUrl: string,
  fontFamily: string,
  params: Record<string, string>
): string {
  const url = new URL(baseUrl);

  // Add font family
  url.searchParams.set("family", fontFamily);

  // Add additional parameters
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

/**
 * Replace Google Font URLs with custom CDN URLs
 */
export function replaceFontUrls(css: string, customFontUrl?: string): string {
  if (!customFontUrl) {
    return css;
  }

  // Replace Google Fonts URLs with custom CDN
  const googleFontUrlPattern = /https:\/\/fonts\.gstatic\.com/g;
  return css.replace(googleFontUrlPattern, customFontUrl);
}
