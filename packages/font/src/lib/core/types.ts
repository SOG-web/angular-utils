/**
 * Font display strategies for controlling font rendering behavior
 */
export type FontDisplay = "auto" | "block" | "swap" | "fallback" | "optional";

/**
 * CSS variable type for Tailwind integration
 */
export type CssVariable = `--${string}`;

/**
 * Backoff strategy for retries
 */
export type BackoffStrategy = "linear" | "exponential";

/**
 * CDN configuration for font sources
 */
export interface CDNConfig {
  /**
   * Base URL for CSS files
   * @default 'https://fonts.googleapis.com/css2'
   */
  cssUrl?: string;

  /**
   * Base URL for font files
   * @default 'https://fonts.gstatic.com'
   */
  fontUrl?: string;
}

/**
 * Retry strategy configuration
 */
export interface RetryStrategy {
  /**
   * Number of retry attempts
   * @default 3
   */
  attempts?: number;

  /**
   * Backoff strategy
   * @default 'exponential'
   */
  backoff?: BackoffStrategy;

  /**
   * Initial delay in milliseconds
   * @default 100
   */
  delay?: number;

  /**
   * Request timeout in milliseconds
   * @default 5000
   */
  timeout?: number;

  /**
   * Maximum delay in milliseconds
   * @default 5000
   */
  maxDelay?: number;
}

/**
 * Font display strategy with timing controls
 */
export interface FontDisplayStrategy {
  /**
   * Block period in milliseconds
   */
  blockPeriod?: number;

  /**
   * Swap period in milliseconds
   */
  swapPeriod?: number;

  /**
   * Failure period in milliseconds
   */
  failurePeriod?: number;
}

/**
 * Variable font axes configuration
 */
export interface VariableFontAxes {
  /**
   * Weight axis range [min, max]
   */
  wght?: [number, number];

  /**
   * Slant axis range [min, max]
   */
  slnt?: [number, number];

  /**
   * Width axis range [min, max]
   */
  wdth?: [number, number];

  /**
   * Custom axes (e.g., GRAD, opsz)
   */
  [axis: string]: [number, number] | undefined;
}

/**
 * Font subsetting configuration
 */
export interface FontSubsetting {
  /**
   * Specific text/characters to include
   * @example "Hello World 123"
   */
  text?: string;

  /**
   * Custom unicode range
   * @example "U+0020-007F"
   */
  unicodeRange?: string;
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
   * Advanced display strategy with timing controls
   */
  displayStrategy?: FontDisplayStrategy;

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
   * Whether to add preconnect link
   * @default false
   */
  preconnect?: boolean;

  /**
   * Whether to prefetch font files
   * @default false
   */
  prefetch?: boolean;

  /**
   * Fallback fonts
   */
  fallback?: string[];

  /**
   * Generate fallback metrics based on a system font
   * @default false
   */
  adjustFontFallback?: "Arial" | "Times New Roman" | "Courier New" | false;

  /**
   * Custom CSS declarations to add to @font-face
   */
  declarations?: Array<{ prop: string; value: string }>;

  /**
   * Font subsetting configuration (requires fontkit)
   */
  subset?: FontSubsetting;

  /**
   * Retry strategy for file operations
   */
  retry?: RetryStrategy;

  /**
   * Error callback
   */
  onError?: (error: Error) => void;

  /**
   * Retry callback
   */
  onRetry?: (attempt: number) => void;

  /**
   * Fallback font to use on error
   * @default 'system-ui'
   */
  fallbackFont?: string;
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
