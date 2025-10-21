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

## Installation

```bash
npm install @angular-utils/font
# or
pnpm add @angular-utils/font
# or
yarn add @angular-utils/font
```

## Quick Start

### 1. Google Fonts

```typescript
// fonts.ts
import { Inter, Roboto_Mono } from "@angular-utils/font/google";

export const inter = Inter({
  subsets: ["latin"],
  weights: [400, 700],
  variable: "--font-inter",
});

export const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});
```

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
  fontClasses = `${inter.variable} ${robotoMono.variable}`;
}
```

### 2. Local Fonts

```typescript
// fonts.ts
import { localFont } from "@angular-utils/font/local";

export const customFont = localFont({
  src: "./fonts/my-font.woff2",
  variable: "--font-custom",
  fallback: ["system-ui", "arial"],
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

## SSR Configuration

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
```

## API Reference

### Google Font Options

```typescript
interface GoogleFontOptions {
  weights?: number[] | "variable"; // Font weights (e.g., [400, 700] or "variable")
  subsets?: string[]; // Font subsets (e.g., ['latin', 'latin-ext'])
  display?: FontDisplay; // Font display strategy ('swap', 'block', 'fallback', 'optional')
  preload?: boolean; // Whether to preload the font (default: true)
  fallback?: string[]; // Fallback fonts (e.g., ['system-ui', 'sans-serif'])
  adjustFontFallback?: boolean; // Generate fallback @font-face with metrics (default: true)
  variable?: string; // CSS variable name for Tailwind (e.g., '--font-inter')
  styles?: string[]; // Font styles (e.g., ['normal', 'italic'])
  axes?: string[]; // Variable font axes (e.g., ['wght', 'ital'])
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
  display?: FontDisplay; // Font display strategy
  weight?: string; // Font weight
  style?: string; // Font style
  variable?: string; // CSS variable name
  preload?: boolean; // Whether to preload
  fallback?: string[]; // Fallback fonts
  adjustFontFallback?: "Arial" | "Times New Roman" | false;
  declarations?: Array<{
    // Custom CSS declarations
    prop: string;
    value: string;
  }>;
}
```

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

- ✅ **Automatic fallback metrics** - Generates fallback @font-face declarations to reduce CLS
- ✅ **Single font file scanning** - Faster builds, explicit configuration
- ✅ **1000+ Google Fonts support** - All fonts available via `font-data.json`
- ✅ **Better error messages** - Helpful errors showing available options
- ✅ **Network retry logic** - Automatic retry with exponential backoff
- ✅ **Improved font axes** - Uses metadata for accurate weight ranges
- ✅ **Better variant sorting** - Handles complex "ital,wght" formats
- ✅ **Build-time optimization** - Fonts downloaded and self-hosted during build

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

This package automatically generates fallback font metrics to reduce **Cumulative Layout Shift (CLS)** during font loading. When you use Google Fonts, the build process generates additional `@font-face` declarations with size-adjust properties that make system fonts match your web font dimensions.

### How it works

For each Google Font, the package:

1. Analyzes the font family to determine the best fallback (Arial, Times New Roman, or Courier New)
2. Generates a fallback `@font-face` with override metrics
3. Injects it into your `fonts.css` automatically

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

Fallback metrics are **enabled by default**. To disable for a specific font:

```typescript
export const inter = Inter({
  subsets: ["latin"],
  weights: [400, 700],
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

## Performance Tips

1. **Use build-time optimization** for production builds
2. **Preload critical fonts** by setting `preload: true`
3. **Use CSS variables** for Tailwind integration
4. **Limit font weights** to only what you need
5. **Use font subsets** to reduce file sizes
6. **Enable fallback metrics** (default) to reduce layout shift

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
