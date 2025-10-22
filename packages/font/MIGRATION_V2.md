# Migration Guide: v1.0.0 → v2.0.0

This guide helps you migrate from `@angular-utils/font` v1.0.0 to v2.0.0.

## Breaking Changes

### 1. Enhanced TypeScript Types

**Before (v1.0.0):**

```typescript
import { Inter } from "@angular-utils/font/google";

const inter = Inter({
  weights: [400, 700], // No autocomplete
  subsets: ["latin"], // No validation
});
```

**After (v2.0.0):**

```typescript
import { Inter } from "@angular-utils/font/google";
import type { GoogleFontFamily } from "@angular-utils/font/google/font-families";

// Now with strict typing and autocomplete
const inter = Inter({
  weights: [400, 700], // ✅ Autocomplete for valid weights
  subsets: ["latin"], // ✅ Autocomplete for valid subsets
});
```

### 2. New Required Options

Some options now have stricter defaults. Update your font configurations:

**Before:**

```typescript
const inter = Inter({
  weights: [400, 700],
  subsets: ["latin"],
});
```

**After:**

```typescript
const inter = Inter({
  weights: [400, 700],
  subsets: ["latin"],
  // New optional features available:
  subset: {
    text: "Hello World", // Font subsetting
  },
  cdn: {
    cssUrl: "https://my-cdn.com/fonts", // Custom CDN
  },
  retry: {
    attempts: 3,
    backoff: "exponential",
  },
});
```

## New Features

### 1. Vite Plugin Support (AnalogJS)

**New:** Use with AnalogJS/Vite projects:

```typescript
// vite.config.ts
import { angularFontPlugin } from "@angular-utils/font/vite";

export default {
  plugins: [
    angularFontPlugin({
      fontsFile: "src/fonts.ts",
      outputDir: "dist/client/assets",
    }),
  ],
};
```

### 2. Font Subsetting

**New:** Reduce font file sizes by 80-90%:

```typescript
// Google Fonts
const inter = Inter({
  subset: {
    text: "Hello World 123", // Only these characters
    // OR
    unicodeRange: "U+0020-007F", // Custom range
  },
});

// Local Fonts
const customFont = localFont({
  src: "./fonts/my-font.ttf",
  subset: {
    text: "Custom text",
  },
});
```

### 3. Enhanced Display Strategies

**New:** Advanced font loading control:

```typescript
const inter = Inter({
  display: "optional",
  displayStrategy: {
    blockPeriod: 0, // ms to block text rendering
    swapPeriod: 3000, // ms to show fallback before swap
    failurePeriod: 3000, // ms before giving up
  },
  preconnect: true, // Add DNS prefetch/preconnect
  prefetch: true, // Prefetch font files
});
```

### 4. Variable Font Optimization

**New:** Full support for variable font axes:

```typescript
const inter = Inter({
  weights: "variable",
  variableAxes: {
    wght: [100, 900], // Weight range
    slnt: [-10, 0], // Slant range
    wdth: [75, 125], // Width range
  },
  defaultAxes: { wght: 400, slnt: 0 },
});
```

### 5. CDN Configuration

**New:** Use custom CDN providers:

```typescript
const inter = Inter({
  cdn: {
    cssUrl: "https://fonts.googleapis.com/css2", // default
    fontUrl: "https://fonts.gstatic.com", // default
    // OR custom:
    cssUrl: "https://my-cdn.com/fonts",
    fontUrl: "https://my-cdn.com/files",
  },
});
```

### 6. Enhanced Error Handling

**New:** Configurable retry with callbacks:

```typescript
const inter = Inter({
  retry: {
    attempts: 3,
    backoff: "exponential",
    delay: 100, // Initial delay (ms)
    timeout: 5000, // Request timeout
    maxDelay: 5000, // Max backoff delay
  },
  onError: (error) => {
    console.error("Font load failed:", error);
  },
  onRetry: (attempt) => {
    console.log(`Retry attempt ${attempt}`);
  },
  fallbackFont: "system-ui", // Font to use on failure
});
```

## Migration Steps

### Step 1: Update Package

```bash
npm install @angular-utils/font@^2.0.0
# or
pnpm add @angular-utils/font@^2.0.0
```

### Step 2: Update Imports (Optional)

If you want strict typing, update your imports:

```typescript
// Add type imports for better autocomplete
import type { GoogleFontFamily } from "@angular-utils/font/google/font-families";
```

### Step 3: Test Your Fonts

Run your build to ensure everything works:

```bash
ng build
# or for Vite projects
npm run build
```

### Step 4: Add New Features (Optional)

Gradually add new features as needed:

1. **Font subsetting** for smaller file sizes
2. **CDN configuration** for custom providers
3. **Enhanced error handling** for better reliability
4. **Variable font optimization** for modern fonts

## Compatibility

- ✅ **Angular CLI**: All existing functionality works
- ✅ **Angular SSR**: Fully supported
- ✅ **Tailwind CSS**: v3 and v4 supported
- ✅ **AnalogJS**: New Vite plugin support
- ✅ **Nx**: Works with existing Angular CLI builder

## Troubleshooting

### TypeScript Errors

If you see TypeScript errors, ensure you're using the latest version:

```bash
npm install typescript@latest
```

### Build Errors

If builds fail, check that all font names are valid:

```typescript
// ❌ Invalid font name
const font = createGoogleFont("Invalid Font Name", {});

// ✅ Valid font name (with autocomplete)
const font = Inter({});
```

### Vite Plugin Issues

For AnalogJS projects, ensure Vite is installed:

```bash
npm install vite@^5.0.0
```

## Need Help?

- Check the [README](./README.md) for detailed documentation
- Open an issue on [GitHub](https://github.com/SOG-web/angular-utils/issues)
- Review the [examples](./examples/) directory

---

**Note:** This is a major version update with breaking changes. Test thoroughly in a development environment before updating production applications.
