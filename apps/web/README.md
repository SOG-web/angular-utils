# Font Showcase Web App

An interactive demonstration of `@angular-utils/font` - optimized font loading for Angular with build-time optimization and SSR support.

This project showcases multiple Google Fonts with different weights, interactive font switching, and demonstrates both runtime and build-time font optimization patterns.

## Features

- 🚀 **Build-time Font Optimization**: Fonts are downloaded and self-hosted during build
- ⚡ **Interactive Font Switching**: Real-time font family and weight changes
- 🎨 **5 Popular Google Fonts**: Inter, Roboto, Open Sans, Poppins, and Playfair Display
- 📊 **Weight Comparison**: Side-by-side visualization of all font weights
- 💅 **Modern UI**: Built with Angular 20 and Tailwind CSS v4
- 🔄 **SSR Compatible**: Works with Angular Universal and `@angular/ssr`

## Font System

### Static Font Declaration Pattern

Fonts are declared in `src/fonts.ts` using the static import pattern:

```typescript
import { Inter, Roboto } from '@angular-utils/font/google';

export const inter = Inter({
  weights: [300, 400, 500, 600, 700, 900],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});
```

### Build-time Optimization

The Angular builder scans `src/fonts.ts` and:

1. Downloads font files from Google Fonts
2. Self-hosts them in `dist/web/browser/assets/fonts/`
3. Generates optimized CSS with preload links
4. Eliminates runtime network requests for fonts

Run font optimization:

```bash
pnpm font:optimize
```

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
