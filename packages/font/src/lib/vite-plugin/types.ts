import type { GoogleFontOptions } from "../core/google-font-options.js";
import type { LocalFontOptions } from "../core/types.js";

/**
 * Font import detected by scanner
 */
export interface FontImport {
  type: "google" | "local";
  family: string;
  options: GoogleFontOptions | LocalFontOptions;
}

/**
 * Vite plugin configuration options
 */
export interface ViteFontPluginOptions {
  /**
   * Path to fonts declaration file
   * @default "src/fonts.ts"
   */
  fontsFile?: string;

  /**
   * Output directory for optimized fonts
   * @default "dist/assets"
   */
  outputDir?: string;

  /**
   * Whether to inject preload links
   * @default true
   */
  injectPreloads?: boolean;

  /**
   * Whether to inject CSS
   * @default true
   */
  injectCSS?: boolean;

  /**
   * Whether to enable font subsetting
   * @default true
   */
  subsetting?: boolean;
}

/**
 * Result of font optimization
 */
export interface OptimizationResult {
  css: string;
  preloadLinks: string[];
  files: Array<{
    url: string;
    format: string;
    preload: boolean;
  }>;
}
