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
   * Path to fonts declaration file (relative to Vite root)
   * If not provided, will auto-discover in common locations:
   * - src/fonts.ts
   * - src/app/fonts.ts
   * - src/lib/fonts.ts
   * - src/config/fonts.ts
   * @default undefined (auto-discover)
   */
  fontsFile?: string;

  /**
   * Output directory for optimized fonts
   * @default "dist/assets"
   */
  outputDir?: string;

  /**
   * Whether to generate preload links file
   * @default true
   */
  injectPreloads?: boolean;

  /**
   * Whether to generate CSS file
   * @default true
   */
  injectCSS?: boolean;

  /**
   * Whether to enable font subsetting
   * @default true
   */
  subsetting?: boolean;

  /**
   * Path to index.html (relative to Vite root)
   * If not provided, will look in src/index.html
   * Set to false to disable HTML injection entirely
   * @default undefined (auto-discover)
   */
  indexHtml?: string | false;

  /**
   * Path to main styles file (relative to Vite root)
   * If not provided, will auto-discover in common locations
   * Only used when injectTailwind is enabled
   * @default undefined (auto-discover)
   */
  stylesFile?: string;

  /**
   * Path to Tailwind config file (relative to Vite root)
   * If not provided, will auto-discover in common locations
   * Only used when injectTailwind is 'v3'
   * @default undefined (auto-discover)
   */
  tailwindFile?: string;

  /**
   * Whether to inject Tailwind configuration
   * - false: No Tailwind injection
   * - 'v3': Inject into tailwind.config.js
   * - 'v4': Inject @theme into styles file
   * - true: Auto-detect version (defaults to v4)
   * @default false
   */
  injectTailwind?: boolean | "v3" | "v4";

  /**
   * Whether to inject font CSS and preload links into HTML
   * @default true
   */
  injectHTML?: boolean;
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
