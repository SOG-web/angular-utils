// Main local font exports
export { localFont } from "./loader.js";
export { LocalFontService } from "./service.js";
export {
  loadLocalFontBuildTime,
  getFallbackMetricsFromFontFile,
  pickFontFileForFallbackGeneration,
} from "./loader.js";

// Re-export core types for convenience
export type { LocalFontOptions, FontResult } from "../lib/core/types.js";
