import type { FontSubsetting } from "../core/types.js";

/**
 * Build Google Fonts URL with subsetting parameters
 */
export function buildGoogleFontsUrlWithSubset(
  baseUrl: string,
  fontFamily: string,
  params: Record<string, string>,
  subset?: FontSubsetting
): string {
  const url = new URL(baseUrl);

  // Add font family
  url.searchParams.set("family", fontFamily);

  // Add subsetting parameters
  if (subset?.text) {
    url.searchParams.set("text", subset.text);
  }

  if (subset?.unicodeRange) {
    url.searchParams.set("unicode_range", subset.unicodeRange);
  }

  // Add additional parameters
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

/**
 * Subset Google Font by adding text parameter to URL
 * This reduces font file size by only including specified characters
 */
export function subsetGoogleFont(
  fontFamily: string,
  cssUrl: string,
  subset?: FontSubsetting
): string {
  if (!subset?.text && !subset?.unicodeRange) {
    return cssUrl;
  }

  const url = new URL(cssUrl);

  if (subset.text) {
    url.searchParams.set("text", subset.text);
  }

  if (subset.unicodeRange) {
    url.searchParams.set("unicode_range", subset.unicodeRange);
  }

  return url.toString();
}

/**
 * Extract characters from text for subsetting
 */
export function extractUniqueCharacters(text: string): string {
  return [...new Set(text)].join("");
}

/**
 * Generate common character sets for subsetting
 */
export const COMMON_CHARACTER_SETS = {
  /**
   * Basic Latin characters (A-Z, a-z, 0-9, basic punctuation)
   */
  basicLatin:
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?;:",

  /**
   * Extended Latin with accents
   */
  latinExtended:
    "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ",

  /**
   * Numbers and common symbols
   */
  numbers: "0123456789+-=()[]{}.,!?;:'\"@#$%^&*",

  /**
   * Common punctuation
   */
  punctuation: ".,!?;:'\"()[]{}/\\-_=+*&^%$#@~`|<>",
} as const;
