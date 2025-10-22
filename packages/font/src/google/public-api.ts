// Main Google Fonts exports (browser-safe, no Node.js dependencies)
export * from "./fonts.js";
export * from "./service.js";
export * from "./loader.js";
export * from "./metadata.js";
export * from "./font-utils.js";
export * from "./get-fallback-font-override-metrics.js";
export * from "./font-families.js";

// Re-export core utilities for convenience
export * from "../lib/core/format-available-values.js";
export * from "../lib/core/font-error.js";
export * from "../lib/core/retry.js";

// Re-export core types for convenience
export type { FontResult } from "../lib/core/types.js";
export type { GoogleFontOptions } from "../lib/core/google-font-options.js";

// Note: loadGoogleFontBuildTime is NOT exported here to avoid bundling Node.js code
// Builders should import directly from "./build-time-loader.js"
