// Main local font exports
export { localFont } from "./loader";
export { LocalFontService } from "./service";
export {
  loadLocalFontBuildTime,
  getFallbackMetricsFromFontFile,
  pickFontFileForFallbackGeneration,
} from "./loader";

// Re-export core types for convenience
export type { LocalFontOptions, FontResult } from "../lib/core/types";
