/**
 * Font display strategies for controlling font rendering behavior
 */
export type FontDisplay = "auto" | "block" | "swap" | "fallback" | "optional";

/**
 * CSS variable type for Tailwind integration
 */
export type CssVariable = `--${string}`;

/**
 * Options for loading Google Fonts
 */
export interface GoogleFontOptions {
  /**
   * Font weights to load. Can be an array of specific weights or 'variable' for variable fonts.
   * @example [400, 700] or 'variable'
   */
  weights?: number[] | "variable";

  /**
   * Font subsets to load (e.g., 'latin', 'latin-ext', 'cyrillic')
   * @default ['latin']
   */
  subsets?: string[];

  /**
   * Font display strategy
   * @default 'swap'
   */
  display?: FontDisplay;

  /**
   * Whether to preload the font (adds <link rel="preload">)
   * @default true
   */
  preload?: boolean;

  /**
   * Fallback fonts to use while the font loads
   * @example ['system-ui', 'arial']
   */
  fallback?: string[];

  /**
   * Whether to generate size-adjust fallback metrics
   * @default true
   */
  adjustFontFallback?: boolean;

  /**
   * CSS variable name for Tailwind integration
   * @example '--font-inter'
   */
  variable?: string;

  /**
   * Font styles to load
   * @default ['normal']
   */
  styles?: string[];

  /**
   * For variable fonts, specify which axes to include
   */
  axes?: string[];
}

/**
 * Options for loading local fonts
 */
export interface LocalFontOptions {
  /**
   * Source font file(s). Can be a single path or array of font descriptors
   */
  src:
    | string
    | Array<{
        path: string;
        weight?: string;
        style?: string;
      }>;

  /**
   * Font display strategy
   * @default 'swap'
   */
  display?: FontDisplay;

  /**
   * Font weight descriptor
   */
  weight?: string;

  /**
   * Font style descriptor
   */
  style?: string;

  /**
   * CSS variable name for Tailwind integration
   */
  variable?: string;

  /**
   * Whether to preload the font
   * @default true
   */
  preload?: boolean;

  /**
   * Fallback fonts
   */
  fallback?: string[];

  /**
   * Generate fallback metrics based on a system font
   * @default false
   */
  adjustFontFallback?: "Arial" | "Times New Roman" | false;

  /**
   * Custom CSS declarations to add to @font-face
   */
  declarations?: Array<{ prop: string; value: string }>;
}

/**
 * Result returned by font loader functions
 */
export interface FontResult {
  /**
   * CSS class name to apply the font
   */
  className: string;

  /**
   * Inline style object with fontFamily
   */
  style: {
    fontFamily: string;
    fontWeight?: number;
    fontStyle?: string;
  };

  /**
   * CSS variable for Tailwind integration (if variable option was set)
   */
  variable?: string;
}

/**
 * Metadata for a Google Font
 */
export interface GoogleFontMetadata {
  weights: string[];
  styles: string[];
  subsets: string[];
  axes?: Array<{
    tag: string;
    min: number;
    max: number;
    defaultValue: number;
  }>;
}

/**
 * Font file descriptor for processing
 */
export interface FontFile {
  /**
   * URL or path to the font file
   */
  url: string;

  /**
   * Font format (woff2, woff, ttf, otf, etc.)
   */
  format: string;

  /**
   * Whether this font should be preloaded
   */
  preload: boolean;

  /**
   * Font weight
   */
  weight?: string;

  /**
   * Font style
   */
  style?: string;

  /**
   * Subset identifier (for Google Fonts)
   */
  subset?: string;
}

/**
 * Adjust font fallback metrics
 */
export interface AdjustFontFallback {
  fallbackFont: string;
  ascentOverride?: string;
  descentOverride?: string;
  lineGapOverride?: string;
  sizeAdjust?: string;
}

/**
 * Internal font data structure
 */
export interface FontData {
  family: string;
  files: FontFile[];
  display: FontDisplay;
  fallback?: string[];
  adjustFontFallback?: AdjustFontFallback;
  variable?: string;
  weight?: string;
  style?: string;
}
