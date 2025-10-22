import type {
  FontDisplay,
  FontDisplayStrategy,
  VariableFontAxes,
  FontSubsetting,
  CDNConfig,
  RetryStrategy,
} from "./types.js";

/**
 * Type-safe Google Font Options with autocomplete for weights, subsets, styles, and axes
 * @template TFamily - The font family name
 * @template TWeights - Valid weights for this font family
 * @template TSubsets - Valid subsets for this font family
 * @template TStyles - Valid styles for this font family
 * @template TAxes - Valid axes for this font family (for variable fonts)
 */
export interface GoogleFontOptions<
  TFamily extends string = string,
  TWeights extends number | "variable" = number | "variable",
  TSubsets extends string = string,
  TStyles extends string = string,
  TAxes extends string = string,
> {
  /**
   * Font weights to load. Can be an array of specific weights or 'variable' for variable fonts.
   * Only valid weights for this specific font family are allowed.
   * @example [400, 700] or 'variable'
   */
  weights?: TWeights[] | (TWeights extends "variable" ? "variable" : never);

  /**
   * Font subsets to load (e.g., 'latin', 'latin-ext', 'cyrillic')
   * Only valid subsets for this specific font family are allowed.
   * @default ['latin']
   */
  subsets?: TSubsets[];

  /**
   * Font styles to load
   * Only valid styles for this specific font family are allowed.
   * @default ['normal']
   */
  styles?: TStyles[];

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
   * Whether to preload the font (adds <link rel="preload">)
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
   * For variable fonts, specify which axes to include
   * Only valid axes for this specific font family are allowed.
   */
  axes?: TAxes[];

  /**
   * Variable font axes with custom ranges
   */
  variableAxes?: VariableFontAxes;

  /**
   * Default values for variable font axes
   */
  defaultAxes?: Record<string, number>;

  /**
   * Font subsetting configuration
   */
  subset?: FontSubsetting;

  /**
   * CDN configuration
   */
  cdn?: CDNConfig;

  /**
   * Retry strategy for network requests
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
