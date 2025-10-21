/**
 * Example: Using local fonts with the @angular-utils/font package
 *
 * This file demonstrates how to use local font files (like the Rubik fonts in static/)
 * with automatic fallback metrics generation for zero layout shift.
 */

import { localFont } from '@angular-utils/font/local';

// Example 1: Single font file
export const rubikRegular = localFont({
  src: './static/Rubik-Regular.ttf',
  variable: '--font-rubik',
  display: 'swap',
  preload: true,
  // adjustFontFallback is enabled by default and will use Arial (sans-serif)
  // To disable: adjustFontFallback: false
  // To specify a different fallback: adjustFontFallback: 'Arial'
});

// Example 2: Multiple weights and styles
export const rubikFamily = localFont({
  src: [
    {
      path: './static/Rubik-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './static/Rubik-LightItalic.ttf',
      weight: '300',
      style: 'italic',
    },
    {
      path: './static/Rubik-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './static/Rubik-Italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: './static/Rubik-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './static/Rubik-MediumItalic.ttf',
      weight: '500',
      style: 'italic',
    },
    {
      path: './static/Rubik-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './static/Rubik-SemiBoldItalic.ttf',
      weight: '600',
      style: 'italic',
    },
    {
      path: './static/Rubik-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './static/Rubik-BoldItalic.ttf',
      weight: '700',
      style: 'italic',
    },
    {
      path: './static/Rubik-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: './static/Rubik-ExtraBoldItalic.ttf',
      weight: '800',
      style: 'italic',
    },
    {
      path: './static/Rubik-Black.ttf',
      weight: '900',
      style: 'normal',
    },
    {
      path: './static/Rubik-BlackItalic.ttf',
      weight: '900',
      style: 'italic',
    },
  ],
  variable: '--font-rubik-family',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

// Example 3: Custom fallback font
export const customFont = localFont({
  src: './static/Rubik-Regular.ttf',
  variable: '--font-custom',
  adjustFontFallback: 'Times New Roman', // Use serif fallback instead
});

// Example 4: Disable fallback metrics
export const noFallback = localFont({
  src: './static/Rubik-Regular.ttf',
  variable: '--font-no-fallback',
  adjustFontFallback: false, // Don't generate fallback @font-face
});

/**
 * Usage in components:
 *
 * @Component({
 *   selector: 'app-root',
 *   template: `
 *     <h1 class="font-rubik">Hello with Rubik</h1>
 *   `,
 *   host: {
 *     '[class]': 'rubikFamily.variable',
 *   },
 * })
 * export class AppComponent {
 *   rubikFamily = rubikFamily;
 * }
 *
 * In Tailwind v4 (styles.css):
 *
 * @theme {
 *   --font-family-sans: var(--font-rubik-family), system-ui, sans-serif;
 * }
 *
 * Then use with standard Tailwind classes:
 * <h1 class="font-sans">Hello</h1>
 */
