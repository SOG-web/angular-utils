# @angular-utils/font

Optimized font loading for Angular with SSR support, inspired by `@next/font`.

## Features

- 🚀 **Build-time optimization**: Download and self-host fonts during build
- ⚡ **Runtime service**: Dynamic font loading when needed
- 🔄 **SSR compatible**: Works with Angular 17+ and `@angular/ssr`
- 🎨 **Tailwind integration**: CSS variables for both v4 (@theme) and v3 (config file)
- 📦 **Google Fonts**: 1000+ fonts available
- 🏠 **Local fonts**: Support for custom font files
- 🎯 **Zero layout shift**: Automatic fallback metrics
- ✂️ **Font subsetting**: Reduce file sizes by 80-90% with text/unicode range subsetting
- 🔧 **Variable fonts**: Full support for variable font axes (wght, slnt, wdth, custom)
- 🌐 **Custom CDN**: Self-host fonts on your own CDN infrastructure
- 🔄 **Advanced retry**: Configurable retry strategies with exponential backoff

## Installation

```bash
npm install @angular-utils/font
# or
pnpm add @angular-utils/font
# or
yarn add @angular-utils/font
```

## Quick Start

### 1. Install the package

```bash
npm install @angular-utils/font
# or
pnpm add @angular-utils/font
# or
yarn add @angular-utils/font
```

### 2. Declare fonts in `src/fonts.ts`

```typescript
// src/fonts.ts
import { Inter, Roboto_Mono } from "@angular-utils/font/google";

export const inter = Inter({
  weights: [400, 700],
  subsets: ["latin"],
  variable: "--font-inter",
});

export const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});
```

### 3. Configure Angular CLI builder

```json
// angular.json
{
  "projects": {
    "my-app": {
      "architect": {
        "font-optimize": {
          "builder": "@angular-utils/font:optimize",
          "options": {
            "outputPath": "dist",
            "projectRoot": "",
            "sourceRoot": "src",
            "fontFile": "src/fonts.ts",
            "injectTailwind": "v4"
          }
        }
      }
    }
  }
}
```

### 4. Run font optimization

```bash
ng run my-app:font-optimize
# or add to your build script
npm run build  # includes font optimization
```

### 5. Use fonts in components

```typescript
// app.component.ts
import { Component } from "@angular/core";
import { inter, robotoMono } from "./fonts";

@Component({
  selector: "app-root",
  template: `
    <div class="font-sans">Hello World</div>
    <code class="font-mono">Code example</code>
  `,
  host: {
    "[class]": "fontClasses",
  },
})
export class AppComponent {
  fontClasses = `${inter.className} ${robotoMono.className}`;
}
```

### 2. Local Fonts

```typescript
// fonts.ts
import { localFont } from "@angular-utils/font/local";

// Single font file
export const customFont = localFont({
  src: "./fonts/my-font.woff2",
  variable: "--font-custom",
  fallback: ["system-ui", "arial"],
  // adjustFontFallback automatically generates fallback metrics (default: true)
});

// Multiple weights and styles
export const rubikFamily = localFont({
  src: [
    { path: "./static/Rubik-Regular.ttf", weight: "400", style: "normal" },
    { path: "./static/Rubik-Bold.ttf", weight: "700", style: "normal" },
    { path: "./static/Rubik-Italic.ttf", weight: "400", style: "italic" },
  ],
  variable: "--font-rubik",
  display: "swap",
  // Automatically uses Arial as fallback for sans-serif fonts
});
```

### 3. Font Subsetting (Reduce File Size by 80-90%)

```typescript
// fonts.ts
import { Inter } from "@angular-utils/font/google";

// Subset by specific text
export const interSubset = Inter({
  weights: [400, 700],
  subsets: ["latin"],
  subset: {
    text: "Hello World 123", // Only these characters
  },
  variable: "--font-inter-subset",
});

// Subset by unicode range
export const interRange = Inter({
  weights: [400, 700],
  subsets: ["latin"],
  subset: {
    unicodeRange: "U+0020-007F", // Basic Latin
  },
  variable: "--font-inter-range",
});

// Use helper for common character sets
import { COMMON_CHARACTER_SETS } from "@angular-utils/font/google";

export const interBasic = Inter({
  weights: [400, 700],
  subsets: ["latin"],
  subset: {
    text: COMMON_CHARACTER_SETS.basicLatin, // A-Z, a-z, 0-9, basic punctuation
  },
  variable: "--font-inter-basic",
});
```

### 4. Variable Fonts

```typescript
// fonts.ts
import { Inter } from "@angular-utils/font/google";

// Basic variable font
export const interVariable = Inter({
  weights: "variable", // Use variable font
  subsets: ["latin"],
  variable: "--font-inter-variable",
});

// Custom variable axes ranges
export const interCustomAxes = Inter({
  weights: "variable",
  subsets: ["latin"],
  variableAxes: {
    wght: [100, 900], // Weight range
    slnt: [-10, 0], // Slant range
    wdth: [75, 125], // Width range
  },
  variable: "--font-inter-custom",
});

// Additional variable axes (font-specific)
export const interAdvanced = Inter({
  weights: "variable",
  subsets: ["latin"],
  axes: ["wght", "slnt"], // Specify which axes to include
  variableAxes: {
    wght: [200, 800],
    slnt: [-10, 0],
  },
  variable: "--font-inter-advanced",
});
```

### 5. Custom CDN Configuration

```typescript
// fonts.ts
import { Inter } from "@angular-utils/font/google";

// Use custom CDN for self-hosting
export const interCDN = Inter({
  weights: [400, 700],
  subsets: ["latin"],
  cdn: {
    cssUrl: "https://my-cdn.com/fonts/css2",
    fontUrl: "https://my-cdn.com/fonts/files",
  },
  variable: "--font-inter-cdn",
});
```

### 6. Advanced Retry & Error Handling

```typescript
// fonts.ts
import { Inter } from "@angular-utils/font/google";

export const interResilient = Inter({
  weights: [400, 700],
  subsets: ["latin"],
  retry: {
    attempts: 5,
    backoff: "exponential",
    delay: 200,
    timeout: 10000,
    maxDelay: 5000,
  },
  onError: (error) => {
    console.error("Font load failed:", error);
    // Fallback to system font
  },
  onRetry: (attempt) => {
    console.log(`Retry attempt ${attempt}`);
  },
  variable: "--font-inter-resilient",
});
```

### 3. Tailwind CSS Integration

#### Tailwind v4 (CSS-first)

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --font-family-sans: var(--font-inter), system-ui, sans-serif;
  --font-family-mono: var(--font-roboto-mono), ui-monospace, monospace;
  --font-family-custom: var(--font-custom), serif;
}
```

#### Tailwind v3 (config file)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-roboto-mono)", ...defaultTheme.fontFamily.mono],
        custom: ["var(--font-custom)", "serif"],
      },
    },
  },
};
```

## Build-time Optimization

For optimal performance, use the Angular CLI builder to optimize fonts at build time.

### Convention: Single Font Declaration File

The font scanner looks for a **single `fonts.ts` file** where all fonts are declared. This approach is:

- ⚡️ **Faster**: Scans one file instead of entire project
- 📝 **Explicit**: Clear where fonts are declared
- 🎯 **Organized**: All font configuration in one place

**Default locations checked (in order):**

1. `src/fonts.ts`
2. `src/app/fonts.ts`
3. `src/lib/fonts.ts`
4. `src/config/fonts.ts`

**See `examples/fonts.ts.example` for a complete example.**

### 1. Configure angular.json

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "font-optimize": {
          "builder": "@angular-utils/font:optimize",
          "options": {
            "outputPath": "public",
            "projectRoot": "",
            "sourceRoot": "src",
            "fontFile": "src/fonts.ts",
            "injectTailwind": "v4"
          }
        }
      }
    }
  }
}
```

If `fontFile` is not specified, the builder will search for `fonts.ts` in the default locations above.

### 2. Run build

```bash
ng build
```

The builder will:

- Scan your `fonts.ts` file for font declarations
- Download Google Fonts and copy local fonts to `assets/fonts/`
- Generate optimized CSS with local font paths
- Create preload links for critical fonts

## Runtime Usage

For dynamic font loading, use the services:

### Google Fonts Service

```typescript
import { Component, inject } from "@angular/core";
import { GoogleFontService } from "@angular-utils/font/google";

@Component({
  selector: "app-dynamic",
  template: `
    <div [class]="font().className" [style]="font().style">
      Dynamic font loading
    </div>
  `,
})
export class DynamicComponent {
  private fontService = inject(GoogleFontService);

  font = this.fontService.loadFont("Inter", {
    weights: [400, 700],
    subsets: ["latin"],
  });
}
```

### Local Fonts Service

```typescript
import { Component, inject } from "@angular/core";
import { LocalFontService } from "@angular-utils/font/local";

@Component({
  selector: "app-local",
  template: `
    <div [class]="font().className" [style]="font().style">Local font</div>
  `,
})
export class LocalComponent {
  private fontService = inject(LocalFontService);

  font = this.fontService.loadFont({
    src: "./fonts/my-font.woff2",
    variable: "--font-local",
  });
}
```

<!-- ## SSR Configuration

### 1. Install Angular SSR

```bash
ng add @angular/ssr
```

### 2. Inject font preloads in server.ts

```typescript
// server.ts
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { injectFontPreloads } from "@angular-utils/font/ssr";

export function app(): string {
  const html = bootstrapApplication(AppComponent, {
    providers: [
      // ... your providers
    ],
  });

  // Inject font preloads
  return injectFontPreloads(html, [
    // Add your fonts here
  ]);
}
``` -->

## API Reference

### Google Font Options

```typescript
interface GoogleFontOptions {
  weights?: number[] | "variable"; // Font weights (e.g., [400, 700] or "variable")
  subsets?: string[]; // Font subsets (e.g., ['latin', 'latin-ext'])
  styles?: string[]; // Font styles (e.g., ['normal', 'italic'])
  display?: FontDisplay; // Font display strategy ('swap', 'block', 'fallback', 'optional')
  preload?: boolean; // Whether to preload the font (default: true)
  fallback?: string[]; // Fallback fonts (e.g., ['system-ui', 'sans-serif'])
  adjustFontFallback?: boolean; // Generate fallback @font-face with metrics (default: true)
  variable?: string; // CSS variable name for Tailwind (e.g., '--font-inter')
  axes?: string[]; // Variable font axes (e.g., ['wght', 'ital'])

  // Advanced features
  subset?: FontSubsetting; // Font subsetting configuration
  variableAxes?: VariableFontAxes; // Custom variable font axes ranges
  cdn?: CDNConfig; // Custom CDN configuration
  retry?: RetryStrategy; // Retry strategy for network requests
  onError?: (error: Error) => void; // Error callback
  onRetry?: (attempt: number) => void; // Retry callback
}

interface FontSubsetting {
  text?: string; // Specific text/characters to include (e.g., "Hello World 123")
  unicodeRange?: string; // Custom unicode range (e.g., "U+0020-007F")
}

interface VariableFontAxes {
  wght?: [number, number]; // Weight axis range [min, max]
  slnt?: [number, number]; // Slant axis range [min, max]
  wdth?: [number, number]; // Width axis range [min, max]
  [axis: string]: [number, number] | undefined; // Custom axes (e.g., GRAD, opsz)
}

interface CDNConfig {
  cssUrl?: string; // Base URL for CSS files (default: 'https://fonts.googleapis.com/css2')
  fontUrl?: string; // Base URL for font files (default: 'https://fonts.gstatic.com')
}

interface RetryStrategy {
  attempts?: number; // Number of retry attempts (default: 3)
  backoff?: "linear" | "exponential"; // Backoff strategy (default: 'exponential')
  delay?: number; // Initial delay in milliseconds (default: 100)
  timeout?: number; // Request timeout in milliseconds (default: 5000)
  maxDelay?: number; // Maximum delay in milliseconds (default: 5000)
}
```

**Note**: `adjustFontFallback` is enabled by default and automatically generates fallback font metrics to reduce layout shift during font loading.

### Local Font Options

```typescript
interface LocalFontOptions {
  src:
    | string
    | Array<{
        // Font source(s)
        path: string;
        weight?: string;
        style?: string;
      }>;
  display?: FontDisplay; // Font display strategy ('swap', 'block', 'fallback', 'optional')
  weight?: string; // Font weight
  style?: string; // Font style
  variable?: string; // CSS variable name for Tailwind (e.g., '--font-rubik')
  preload?: boolean; // Whether to preload (default: true)
  fallback?: string[]; // Fallback fonts (e.g., ['system-ui', 'sans-serif'])
  adjustFontFallback?: "Arial" | "Times New Roman" | "Courier New" | false; // Generate fallback @font-face with metrics (default: auto-detected)
  declarations?: Array<{
    // Custom CSS declarations
    prop: string;
    value: string;
  }>;

  // Advanced features
  subset?: FontSubsetting; // Font subsetting configuration (requires fontkit)
  retry?: RetryStrategy; // Retry strategy for file operations
  onError?: (error: Error) => void; // Error callback
  onRetry?: (attempt: number) => void; // Retry callback
  fallbackFont?: string; // Fallback font to use on error (default: 'system-ui')
}
```

**Note**: `adjustFontFallback` for local fonts:

- **Default**: Auto-detected based on font family name (sans-serif → Arial, serif → Times New Roman, mono → Courier New)
- **Explicit**: Specify `"Arial"`, `"Times New Roman"`, or `"Courier New"` to override auto-detection
- **Disabled**: Set to `false` to skip fallback generation

### Font Result

```typescript
interface FontResult {
  className: string; // CSS class name
  style: {
    // Inline style object
    fontFamily: string;
    fontWeight?: number;
    fontStyle?: string;
  };
  variable?: string; // CSS variable for Tailwind
}
```

## Recent Improvements

- ✅ **Font subsetting** - Reduce file sizes by 80-90% with text/unicode range subsetting
- ✅ **Variable font optimization** - Full support for variable font axes (wght, slnt, wdth, custom)
- ✅ **Custom CDN support** - Self-host fonts on your own CDN infrastructure
- ✅ **Advanced retry logic** - Configurable retry strategies with exponential backoff and callbacks
- ✅ **Automatic fallback metrics** - Generates fallback @font-face declarations for both Google and local fonts to reduce CLS
- ✅ **Local font fallback support** - Auto-detects font category (sans/serif/mono) for optimal fallback selection
- ✅ **Single font file scanning** - Faster builds, explicit configuration
- ✅ **1000+ Google Fonts support** - All fonts available via `font-data.json`
- ✅ **Better error messages** - Helpful errors showing available options
- ✅ **Network retry logic** - Automatic retry with exponential backoff
- ✅ **Improved font axes** - Uses metadata for accurate weight ranges
- ✅ **Better variant sorting** - Handles complex "ital,wght" formats
- ✅ **Build-time optimization** - Fonts downloaded and self-hosted during build
- ✅ **Browser-safe bundling** - Build-time code separated from browser code to avoid Node.js dependencies in bundles
- ✅ **Helper utilities** - COMMON_CHARACTER_SETS and subsetting helpers for easier font optimization

## Available Google Fonts

**1000+ Google Fonts** are available as individual functions, automatically generated from the latest Google Fonts metadata:

```typescript
import {
  Inter,
  Roboto,
  Roboto_Mono,
  Open_Sans,
  Source_Sans_Pro,
  Lato,
  Montserrat,
  Poppins,
  Nunito,
  Merriweather,
  Playfair_Display,
  Oswald,
  Raleway,
  Ubuntu,
  Crimson_Text,
  Fira_Sans,
  PT_Sans,
  PT_Serif,
  Droid_Sans,
  Droid_Serif,
  Lora,
  Libre_Baskerville,
  Cabin,
  Arimo,
  Titillium_Web,
  Work_Sans,
  Cormorant_Garamond,
  Libre_Franklin,
  Encode_Sans,
  IBM_Plex_Sans,
  IBM_Plex_Serif,
  IBM_Plex_Mono,
  Space_Mono,
  Inconsolata,
  Fira_Code,
  JetBrains_Mono,
  Source_Code_Pro,
  Cascadia_Code,
  Victor_Mono,
  Recursive,
  Fraunces,
  Bitter,
  Crimson_Pro,
  Literata,
  Chivo,
  Spectral,
  Karla,
  Rubik,
  Quicksand,
  Maven_Pro,
  Exo_2,
  Orbitron,
  Rajdhani,
  Righteous,
  Bangers,
  Fredoka_One,
  Comfortaa,
  Varela_Round,
  Nunito_Sans,
  Source_Sans_3,
  Noto_Sans,
  Noto_Serif,
  // ... and many more!
} from "@angular-utils/font/google";
```

## Fallback Font Metrics (Zero Layout Shift)

This package automatically generates fallback font metrics to reduce **Cumulative Layout Shift (CLS)** during font loading. Both **Google Fonts** and **local fonts** support automatic fallback generation with size-adjust properties that make system fonts match your web font dimensions.

### How it works

For each font (Google or local), the package:

1. Analyzes the font family to determine the best fallback (Arial, Times New Roman, or Courier New)
2. Generates a fallback `@font-face` with override metrics
3. Injects it into your `fonts.css` automatically

**Font Detection:**

- **Sans-serif fonts** (Inter, Roboto, Open Sans, Rubik, etc.) → Arial fallback
- **Serif fonts** (Playfair Display, Merriweather, etc.) → Times New Roman fallback
- **Monospace fonts** (Fira Code, JetBrains Mono, etc.) → Courier New fallback

### Example output

```css
/* Your main font */
@font-face {
  font-family: "Inter";
  src: url(/assets/fonts/inter/...) format("woff2");
}

/* Automatically generated fallback */
@font-face {
  font-family: "Inter Fallback";
  src: local("Arial");
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
  size-adjust: 100%;
}
```

### Configuration

Fallback metrics are **enabled by default** for both Google and local fonts.

**Google Fonts:**

```typescript
export const inter = Inter({
  subsets: ["latin"],
  weights: [400, 700],
  adjustFontFallback: false, // Disable fallback metrics
});
```

**Local Fonts:**

```typescript
export const rubik = localFont({
  src: "./fonts/Rubik-Regular.ttf",
  // Auto-detected as sans-serif → uses Arial fallback
});

export const customSerif = localFont({
  src: "./fonts/MySerif.ttf",
  adjustFontFallback: "Times New Roman", // Explicitly specify fallback
});

export const noFallback = localFont({
  src: "./fonts/Special.woff2",
  adjustFontFallback: false, // Disable fallback metrics
});
```

### Using the fallback

In your CSS or Tailwind config, reference the fallback font:

```css
.font-inter {
  font-family: "Inter", "Inter Fallback", system-ui, sans-serif;
}
```

This ensures the fallback font is used while the web font loads, minimizing layout shift.

## Helper Utilities

### Common Character Sets

For font subsetting, use predefined character sets:

```typescript
import { COMMON_CHARACTER_SETS } from "@angular-utils/font/google";

// Basic Latin characters (A-Z, a-z, 0-9, basic punctuation)
COMMON_CHARACTER_SETS.basicLatin;
// "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?;:"

// Extended Latin with accents
COMMON_CHARACTER_SETS.latinExtended;
// "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ"

// Numbers and common symbols
COMMON_CHARACTER_SETS.numbers;
// "0123456789+-=()[]{}.,!?;:'\"@#$%^&*"

// Common punctuation
COMMON_CHARACTER_SETS.punctuation;
// ".,!?;:'\"()[]{}/\\-_=+*&^%$#@~`|<>"
```

### Subsetting Helpers

```typescript
import { extractUniqueCharacters } from "@angular-utils/font/google";

// Extract unique characters from text
const uniqueChars = extractUniqueCharacters("Hello World!");
// "Helo Wrd!"

// Use in font subsetting
export const interUnique = Inter({
  weights: [400, 700],
  subsets: ["latin"],
  subset: {
    text: extractUniqueCharacters("Your specific text here"),
  },
  variable: "--font-inter-unique",
});
```

## Performance Tips

1. **Use build-time optimization** for production builds
2. **Preload critical fonts** by setting `preload: true`
3. **Use CSS variables** for Tailwind integration
4. **Limit font weights** to only what you need
5. **Use font subsets** to reduce file sizes by 80-90%
6. **Enable fallback metrics** (default) to reduce layout shift
7. **Use variable fonts** when possible for better performance
8. **Configure retry strategies** for network resilience
9. **Self-host fonts** with custom CDN for faster delivery
10. **Subset fonts** using `COMMON_CHARACTER_SETS` for common use cases

## Troubleshooting

### Font not loading

- Check that the font name is correct
- Verify network connectivity for Google Fonts
- Ensure local font files exist and are accessible

### SSR issues

- Make sure `@angular/ssr` is properly configured
- Check that font preloads are injected in server.ts
- Verify font CSS is included in SSR output

### Tailwind not working

- Ensure CSS variables are added to your root element
- Check Tailwind configuration includes the font variables
- Verify font functions return the `variable` property

## Testing

This package includes a comprehensive test suite with 81+ tests covering core functionality.

### Run Tests

```bash
# Run all tests
pnpm test

# Run with coverage report
pnpm test:coverage

# Run in watch mode
pnpm test:watch

# Run only unit tests
pnpm test:unit

# Run only integration tests
pnpm test:integration
```

### Test Coverage

- **Core utilities**: 90% coverage
- **Google Fonts utils**: 76-100% coverage
- **Overall**: 32% coverage (target: 80%)

See [TESTING.md](./TESTING.md) for detailed testing documentation.

### CI/CD

Automated tests run on every push via GitHub Actions:

- Tests on Node.js 18.x and 20.x
- Coverage reports uploaded to Codecov
- Build verification

## Development

### Building the Package

```bash
# Build the package
pnpm build

# Build with font generation (automatic)
pnpm prebuild && pnpm build
```

The build process automatically:

1. Generates font exports from `font-data.json` (1890+ fonts)
2. Compiles TypeScript to JavaScript
3. Creates type definitions

### Updating Google Fonts

When Google Fonts metadata is updated:

1. Update `src/google/font-data.json` with new font metadata
2. Run `pnpm generate:fonts` to regenerate exports
3. All new fonts are immediately available for import

```bash
# Manually regenerate font exports
pnpm generate:fonts
```

This creates ~3800 lines of TypeScript exports in `src/google/fonts.ts`:

```typescript
export const Inter = fontFunctions.Inter;
export const Roboto_Mono = fontFunctions["Roboto_Mono"];
// ... 1890+ more fonts
```

See [scripts/README.md](./scripts/README.md) for details on the generation process.

## Contributing

Contributions are welcome! Please read our [contributing guide](CONTRIBUTING.md) for details.

When submitting PRs:

1. Add tests for new functionality
2. Ensure all tests pass: `pnpm test`
3. Maintain or improve coverage: `pnpm test:coverage`
4. Follow existing code style
5. If adding fonts, run `pnpm generate:fonts` to update exports

## License

MIT License - see [LICENSE](LICENSE) for details.
