# Angular Utils

A collection of utilities and packages for Angular applications.

## Packages

### [@sog-web/angular-utils-font](./packages/font)

Optimized font loading for Angular with SSR support, inspired by `@next/font`.

**Features:**

- 🚀 Build-time optimization for self-hosted fonts
- ⚡ Runtime service for dynamic font loading
- 🔄 SSR compatible with Angular 17+
- 🎨 Tailwind v3 and v4 integration
- 📦 1000+ Google Fonts available
- 🏠 Local font support
- 🎯 Zero layout shift with automatic fallback metrics

**Installation:**

```bash
npm install @sog-web/angular-utils-font
# or
pnpm add @sog-web/angular-utils-font
```

See the [font package documentation](./packages/font/README.md) for detailed usage.

---

_More Angular utility packages coming soon!_

## Repository Structure

This monorepo includes:

- **`packages/`**: Published npm packages
  - `font`: Font loading and optimization utilities
- **`apps/`**: Example applications and documentation
  - `web`: Demo application showcasing package features

Each package is built with [TypeScript](https://www.typescriptlang.org/) and designed for modern Angular applications.

## Development

This monorepo uses [Turborepo](https://turborepo.com/) for efficient task management and [pnpm](https://pnpm.io/) for package management.

### Prerequisites

- Node.js 18.x or 20.x
- pnpm 8.x or higher

### Getting Started

1. **Clone the repository:**

```bash
git clone https://github.com/SOG-web/angular-utils.git
cd angular-utils
```

2. **Install dependencies:**

```bash
pnpm install
```

3. **Build all packages:**

```bash
pnpm build
```

4. **Run the demo app:**

```bash
pnpm dev --filter=web
```

**Or try the live demo:** [https://sog-web.github.io/angular-utils/](https://sog-web.github.io/angular-utils/)

### Building

Build all packages and apps:

```bash
pnpm build
```

Build a specific package:

```bash
pnpm build --filter=@sog-web/angular-utils-font
```

### Testing

Run tests for all packages:

```bash
pnpm test
```

Run tests for a specific package:

```bash
pnpm test --filter=@sog-web/angular-utils-font
```

### Development Workflow

When developing a package:

1. Make changes to the package source code
2. Build the package: `pnpm build --filter=<package-name>`
3. Run tests: `pnpm test --filter=<package-name>`
4. Test in the demo app: `pnpm dev --filter=web`

## Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `pnpm test`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Adding a New Package

To add a new Angular utility package:

1. Create a new directory in `packages/`
2. Set up the package structure (see `packages/font` as a reference)
3. Add package configuration (`package.json`, `tsconfig.json`)
4. Update this README to list the new package
5. Add comprehensive tests and documentation

## License

MIT License - see individual package LICENSE files for details.

## Useful Links

- [Angular Documentation](https://angular.dev/)
- [Turborepo Documentation](https://turborepo.com/)
- [pnpm Documentation](https://pnpm.io/)
- [@sog-web/angular-utils-font Package](./packages/font/README.md)
