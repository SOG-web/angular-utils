import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './docs.html',
  styleUrls: ['./docs.css'],
})
export class DocsComponent {
  // Quick Start examples
  quickStartExample = `// fonts.ts
import { Inter } from '@angular-utils/font/google';

export const inter = Inter({
  weights: [400, 700],
  subsets: ['latin'],
  variable: '--font-inter',
  preload: true,
});`;

  // Common Patterns examples
  basicGoogleFontExample = `// fonts.ts
import { Inter } from '@angular-utils/font/google';

export const inter = Inter({
  weights: [400, 700],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});`;

  multipleFontsExample = `// fonts.ts
import { Inter, Playfair_Display } from '@angular-utils/font/google';

export const inter = Inter({
  weights: [400, 700],
  subsets: ['latin'],
  variable: '--font-inter',
});

export const playfairDisplay = Playfair_Display({
  weights: [400, 700],
  subsets: ['latin'],
  variable: '--font-playfair-display',
});`;

  tailwindIntegrationExample = `/* styles.css */
@import 'tailwindcss';

@theme {
  --font-family-sans: var(--font-inter), system-ui, sans-serif;
  --font-family-serif: var(--font-playfair-display), serif;
}`;

  localFontsExample = `// fonts.ts
import { localFont } from '@angular-utils/font/local';

export const rubikFamily = localFont({
  src: [
    { path: './static/Rubik-Regular.ttf', weight: '400', style: 'normal' },
    { path: './static/Rubik-Bold.ttf', weight: '700', style: 'normal' },
    { path: './static/Rubik-Italic.ttf', weight: '400', style: 'italic' },
  ],
  variable: '--font-rubik',
  display: 'swap',
  preload: true,
});`;

  buildTimeOptimizationExample = `// angular.json
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
}`;

  // Advanced Features examples
  fontSubsettingExample = `// fonts.ts
import { Inter } from '@angular-utils/font/google';
import { COMMON_CHARACTER_SETS } from '@angular-utils/font/google';

// Subset by specific text
export const interSubset = Inter({
  weights: [400, 700],
  subsets: ['latin'],
  subset: {
    text: "Hello World 123", // Only these characters
  },
  variable: '--font-inter-subset',
});

// Use helper for common character sets
export const interBasic = Inter({
  weights: [400, 700],
  subsets: ['latin'],
  subset: {
    text: COMMON_CHARACTER_SETS.basicLatin,
  },
  variable: '--font-inter-basic',
});`;

  variableFontsExample = `// fonts.ts
import { Inter } from '@angular-utils/font/google';

// Basic variable font
export const interVariable = Inter({
  weights: 'variable',
  subsets: ['latin'],
  variable: '--font-inter-variable',
});

// Custom variable axes ranges
export const interCustomAxes = Inter({
  weights: 'variable',
  subsets: ['latin'],
  variableAxes: {
    wght: [100, 900], // Weight range
    slnt: [-10, 0],  // Slant range
    wdth: [75, 125], // Width range
  },
  variable: '--font-inter-custom',
});`;

  cdnConfigExample = `// fonts.ts
import { Inter } from '@angular-utils/font/google';

export const interCDN = Inter({
  weights: [400, 700],
  subsets: ['latin'],
  cdn: {
    cssUrl: 'https://my-cdn.com/fonts/css2',
    fontUrl: 'https://my-cdn.com/fonts/files',
  },
  variable: '--font-inter-cdn',
});`;

  retryErrorHandlingExample = `// fonts.ts
import { Inter } from '@angular-utils/font/google';

export const interResilient = Inter({
  weights: [400, 700],
  subsets: ['latin'],
  retry: {
    attempts: 5,
    backoff: 'exponential',
    delay: 200,
    timeout: 10000,
    maxDelay: 5000,
  },
  onError: (error) => {
    console.error('Font load failed:', error);
  },
  onRetry: (attempt) => {
    console.log(\`Retry attempt \${attempt}\`);
  },
  variable: '--font-inter-resilient',
});`;

  // API Reference examples
  googleFontOptionsExample = `interface GoogleFontOptions {
  weights?: number[] | "variable";
  subsets?: string[];
  styles?: string[];
  display?: FontDisplay;
  preload?: boolean;
  fallback?: string[];
  adjustFontFallback?: boolean;
  variable?: string;
  axes?: string[];
  
  // Advanced features
  subset?: FontSubsetting;
  variableAxes?: VariableFontAxes;
  cdn?: CDNConfig;
  retry?: RetryStrategy;
  onError?: (error: Error) => void;
  onRetry?: (attempt: number) => void;
}`;

  fontSubsettingInterfaceExample = `interface FontSubsetting {
  text?: string; // Specific text/characters to include
  unicodeRange?: string; // Custom unicode range
}`;

  variableFontAxesInterfaceExample = `interface VariableFontAxes {
  wght?: [number, number]; // Weight axis range [min, max]
  slnt?: [number, number]; // Slant axis range [min, max]
  wdth?: [number, number]; // Width axis range [min, max]
  [axis: string]: [number, number] | undefined; // Custom axes
}`;

  cdnConfigInterfaceExample = `interface CDNConfig {
  cssUrl?: string; // Base URL for CSS files
  fontUrl?: string; // Base URL for font files
}`;

  retryStrategyInterfaceExample = `interface RetryStrategy {
  attempts?: number; // Number of retry attempts
  backoff?: "linear" | "exponential"; // Backoff strategy
  delay?: number; // Initial delay in milliseconds
  timeout?: number; // Request timeout in milliseconds
  maxDelay?: number; // Maximum delay in milliseconds
}`;

  // Helper utilities
  commonCharacterSetsExample = `import { COMMON_CHARACTER_SETS } from '@angular-utils/font/google';

// Basic Latin characters (A-Z, a-z, 0-9, basic punctuation)
COMMON_CHARACTER_SETS.basicLatin
// 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?;:'

// Extended Latin with accents
COMMON_CHARACTER_SETS.latinExtended
// 'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ'

// Numbers and common symbols
COMMON_CHARACTER_SETS.numbers
// '0123456789+-=()[]{}.,!?;:'"@#$%^&*'

// Common punctuation
COMMON_CHARACTER_SETS.punctuation
// '.,!?;:'"()[]{}/\\-_=+*&^%$#@~\`|<>'`;

  subsettingHelpersExample = `import { extractUniqueCharacters } from '@angular-utils/font/google';

// Extract unique characters from text
const uniqueChars = extractUniqueCharacters('Hello World!');
// 'Helo Wrd!'

// Use in font subsetting
export const interUnique = Inter({
  weights: [400, 700],
  subsets: ['latin'],
  subset: {
    text: extractUniqueCharacters('Your specific text here'),
  },
  variable: '--font-inter-unique',
});`;

  // Copy to clipboard functionality
  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      console.log('Code copied to clipboard');
    });
  }
}
