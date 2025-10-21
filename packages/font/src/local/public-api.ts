// Main local font exports (browser-safe, no Node.js dependencies)
export { localFont } from "./loader.js";
export { LocalFontService } from "./service.js";
export {
  getFallbackMetricsFromFontFile,
  pickFontFileForFallbackGeneration,
} from "./loader.js";

// Re-export core types for convenience
export type { LocalFontOptions, FontResult } from "../lib/core/types.js";

// Note: loadLocalFontBuildTime is NOT exported here to avoid bundling Node.js code
// Builders should import directly from "./build-time-loader.js"
