<!-- 729b8bcd-9702-4b6f-bdff-8de4c2a0216d 0d10e543-7a1a-4f7e-a4af-8fe70b3fb190 -->
# Font Package v2.0 Enhancement Plan

## Overview

Implement improvements for AnalogJS/Vite support, font subsetting, display strategies, variable fonts, TypeScript enhancements, error handling, and CDN options (v2.0.0).

## Changes Included

### 1. Vite Plugin Support (for AnalogJS)

Create `packages/font/src/lib/vite-plugin/` with full build-time optimization for Vite/AnalogJS projects.

**New files:**

- `index.ts` - Main Vite plugin factory
- `scanner.ts` - Scan for font imports in Vite modules  
- `optimizer.ts` - Download/optimize fonts during build
- `types.ts` - Plugin configuration types

**Plugin capabilities:**

- Hook into Vite `buildStart` lifecycle
- Scan source files for font declarations
- Download Google Fonts, copy local fonts
- Generate optimized CSS with subsetting
- Inject preload links into HTML
- Works seamlessly with AnalogJS SSR

### 4. Font Subsetting Support

Reduce font file sizes by 80-90% using character subsetting.

**For Google Fonts:**

```typescript
Inter({
  subset: {
    text: "Hello World 123", // Only these characters
    // OR
    unicodeRange: "U+0020-007F" // Custom range
  }
})
```

Uses Google Fonts API `text` parameter.

**For Local Fonts:**

Uses `fontkit` library to subset TTF/OTF files at build time.

**Implementation:**

- Create `packages/font/src/lib/subsetting/index.ts`
- Add subsetting logic to both Vite plugin and Angular CLI builder
- Update `GoogleFontOptions` and `LocalFontOptions` with `subset` field

### 5. Font Display Strategies

Enhanced control over font loading behavior with custom timing and preconnect.

**New options in `GoogleFontOptions`:**

```typescript
{
  display: "optional" | "block" | "swap" | "fallback",
  displayStrategy: {
    blockPeriod?: number; // ms to block text rendering
    swapPeriod?: number;  // ms to show fallback before swap
    failurePeriod?: number; // ms before giving up
  },
  preconnect: boolean, // Add DNS prefetch/preconnect
  prefetch: boolean    // Prefetch font files
}
```

**Implementation:**

- Update `types.ts` with `FontDisplayStrategy` interface
- Add preconnect/prefetch link generation
- Support Font Loading API for advanced control
- Add display strategy helpers in `font-utils.ts`

### 6. Variable Font Optimization  

Full support for variable font axes with range configuration.

**Enhanced `GoogleFontOptions`:**

```typescript
{
  variableAxes: {
    wght: [100, 900],  // Weight range
    slnt: [-10, 0],    // Slant range
    wdth: [75, 125]    // Width range
  },
  defaultAxes: { wght: 400, slnt: 0 }
}
```

**Implementation:**

- Update `GoogleFontOptions` with `variableAxes` field
- Modify `getFontAxes()` to build proper Google Fonts URL
- Generate CSS with font-variation-settings
- Add validation for supported axes per font

### 10. Better TypeScript Support

Strict typing with autocomplete using `font-data.json` metadata (no Google API needed).

**Generate types from `font-data.json`:**

```typescript
// Generated font-families.ts
export type GoogleFontFamily = 
  | "Inter" 
  | "Roboto"
  | "Roboto Mono"
  // ... all 1890 fonts
  ;

// Per-font metadata types
export type WeightsFor<T extends GoogleFontFamily> = 
  T extends "Inter" ? 400 | 700 | 900 | "variable" :
  T extends "Roboto" ? 100 | 300 | 400 | 500 | 700 | 900 :
  // ... generated for all fonts
  never;

export type SubsetsFor<T extends GoogleFontFamily> = 
  T extends "Inter" ? "latin" | "latin-ext" | "cyrillic" :
  // ... generated for all fonts
  never;
```

**Update loader with strict types:**

```typescript
export function createGoogleFont<T extends GoogleFontFamily>(
  fontFamily: T,
  options?: GoogleFontOptions<T>
): FontResult

interface GoogleFontOptions<T extends GoogleFontFamily> {
  weights?: WeightsFor<T>[];  // Autocomplete only valid weights
  subsets?: SubsetsFor<T>[];  // Autocomplete only valid subsets
  // ...
}
```

**Implementation:**

- Generate all types from `font-data.json` in build script
- No Google API calls for metadata - all validation is local
- Full autocomplete for weights, subsets, styles, and variable axes

### 13. Better Error Handling & Recovery

Configurable retry with exponential backoff and error callbacks.

**New `RetryStrategy` interface:**

```typescript
{
  retry: {
    attempts: 3,
    backoff: "exponential" | "linear",
    delay: 100,      // Initial delay (ms)
    timeout: 5000,   // Request timeout
    maxDelay: 5000   // Max backoff delay
  },
  onError: (error: Error) => void,
  onRetry: (attempt: number) => void,
  fallbackFont: "system-ui" // Font to use on failure
}
```

**Implementation:**

- Update `packages/font/src/lib/core/retry.ts`
- Add timeout support with AbortController
- Add configurable backoff strategies
- Wire into all font loaders
- Update `GoogleFontOptions` and `LocalFontOptions`

### 14. CDN Options

Support custom CDN URLs with Google Fonts as default.

**New `CDNConfig` type:**

```typescript
{
  cdn: {
    cssUrl: "https://fonts.googleapis.com/css2", // default
    fontUrl: "https://fonts.gstatic.com",        // default
    // OR custom:
    cssUrl: "https://my-cdn.com/fonts",
    fontUrl: "https://my-cdn.com/files"
  }
}
```

**Create `packages/font/src/lib/core/cdn-config.ts`:**

- Default Google CDN configuration
- CDN resolver function
- Support for custom proxy/mirror

**Implementation:**

- Add `cdn` field to `GoogleFontOptions`
- Update `getGoogleFontsUrl()` to use CDN config
- Update fetch logic to resolve URLs from config

## Files to Create

- `packages/font/src/lib/vite-plugin/index.ts`
- `packages/font/src/lib/vite-plugin/scanner.ts`
- `packages/font/src/lib/vite-plugin/optimizer.ts`
- `packages/font/src/lib/vite-plugin/types.ts`
- `packages/font/src/lib/subsetting/index.ts`
- `packages/font/src/lib/subsetting/google.ts`
- `packages/font/src/lib/subsetting/local.ts`
- `packages/font/src/lib/core/cdn-config.ts`
- `packages/font/src/lib/core/display-strategy.ts`
- `packages/font/src/google/font-families.ts`
- `packages/font/MIGRATION_V2.md`

## Files to Modify

- `packages/font/src/lib/core/types.ts` - Add all new types
- `packages/font/src/lib/core/retry.ts` - Enhanced retry with timeout
- `packages/font/src/google/loader.ts` - Use new options
- `packages/font/src/google/build-time-loader.ts` - Add subsetting
- `packages/font/src/google/font-utils.ts` - CDN resolution, variable axes
- `packages/font/src/local/build-time-loader.ts` - Add subsetting
- `packages/font/src/lib/builders/optimize/index.ts` - Add subsetting support
- `packages/font/package.json` - v2.0.0, add vite export
- `packages/font/README.md` - Document all new features
- `scripts/generate-font-exports.ts` - Generate GoogleFontFamily type

## Key Implementation Details

**Vite Plugin Usage:**

```typescript
// vite.config.ts
import { angularFontPlugin } from '@angular-utils/font/vite';

export default {
  plugins: [
    angularFontPlugin({
      fontsFile: 'src/fonts.ts',
      outputDir: 'dist/client/assets'
    })
  ]
}
```

**Package.json exports:**

```json
{
  "exports": {
    "./vite": "./dist/lib/vite-plugin/index.js",
    "./google": "./dist/google/index.js",
    "./local": "./dist/local/index.js"
  },
  "peerDependencies": {
    "vite": ">=5.0.0"
  },
  "peerDependenciesMeta": {
    "vite": { "optional": true }
  }
}
```

### To-dos

- [ ] Update core type system with new interfaces for variable fonts, CDN config, retry strategy, and performance metrics
- [ ] Generate GoogleFontFamily union type from font-data.json for TypeScript autocomplete
- [ ] Implement CDN configuration system with Google defaults and custom URL support
- [ ] Add variable font axis support in GoogleFontOptions and loader logic
- [ ] Create Vite plugin for AnalogJS build-time font optimization
- [ ] Implement font subsetting using fontkit for local fonts and Google API text parameter
- [ ] Create performance monitoring service for tracking font load times and Web Vitals
- [ ] Enhance error handling with configurable retry strategies and callbacks
- [ ] Update Google and local font loaders to use new CDN config, subsetting, and error handling
- [ ] Update package.json to v2.0.0, add new exports, and update dependencies
- [ ] Update README and create migration guide for v2.0.0