# Font Generation Scripts

This directory contains build-time scripts for the `@angular-utils/font` package.

## generate-font-exports.ts

Automatically generates TypeScript font function exports from `font-data.json`.

### Purpose

The Google Fonts metadata file (`src/google/font-data.json`) contains information about 1890+ font families. This script reads that metadata and generates individual TypeScript export statements for each font family in `src/google/fonts.ts`.

### Usage

```bash
# Manually generate font exports
pnpm generate:fonts

# Automatically runs before build
pnpm build
```

### What it Does

1. **Reads** `src/google/font-data.json` to get all available font families
2. **Generates** TypeScript export statements for each font
3. **Writes** the exports to `src/google/fonts.ts`
4. **Formats** font names (e.g., "Roboto Mono" → `Roboto_Mono`)

### Example Output

```typescript
// Generated exports
export const Inter = fontFunctions.Inter;
export const Roboto = fontFunctions.Roboto;
export const Roboto_Mono = fontFunctions["Roboto_Mono"];
export const Open_Sans = fontFunctions["Open_Sans"];
// ... 1890+ more fonts
```

### When to Run

This script automatically runs as a `prebuild` step, so you don't usually need to run it manually. However, you should run it manually when:

- Adding new fonts to `font-data.json`
- Updating the Google Fonts metadata
- Debugging font export issues

### Script Features

- ✅ **Automatic**: Runs before every build
- ✅ **Fast**: Generates 1890+ exports in ~1 second
- ✅ **Smart naming**: Handles spaces and special characters
- ✅ **Sorted**: Exports are alphabetically sorted
- ✅ **Safe**: Validates JSON before processing

### File Format

The generated `fonts.ts` file structure:

```typescript
// 1. Imports
import type { GoogleFontOptions, FontResult } from "../lib/core/types";
import { createGoogleFont } from "./loader";
// ...

// 2. Dynamic function registry
const fontFunctions: Record<
  string,
  (options?: GoogleFontOptions) => FontResult
> = {};
for (const fontFamily of fontFamilies) {
  const functionName = formatFontFunctionName(fontFamily);
  fontFunctions[functionName] = (options?: GoogleFontOptions) =>
    createGoogleFont(fontFamily, options);
}

// 3. Individual exports (GENERATED - DO NOT EDIT MANUALLY)
export const Inter = fontFunctions.Inter;
export const Roboto = fontFunctions.Roboto;
// ... all fonts

// 4. Utilities
export { GoogleFontService } from "./service";
export { getAllFontFamilies, isFontAvailable } from "./metadata";
```

### Adding New Fonts

To add new fonts to the package:

1. Update `src/google/font-data.json` with the new font metadata
2. Run `pnpm generate:fonts` to regenerate exports
3. The new fonts will be available for import immediately

```typescript
// After adding "NewFont" to font-data.json
import { NewFont } from "@angular-utils/font/google";

const newFont = NewFont({ weights: [400, 700] });
```

### Troubleshooting

**Build fails after generating fonts**

- Ensure `font-data.json` is valid JSON
- Check that font names don't contain invalid TypeScript identifiers

**Fonts not appearing**

- Run `pnpm generate:fonts` manually
- Check `font-data.json` for syntax errors
- Verify the font exists in Google Fonts

**Generated file looks wrong**

- Delete `src/google/fonts.ts` and regenerate
- Check script output for errors

### Development

The script is written in TypeScript and run via `tsx` (TypeScript Execute). To modify:

1. Edit `scripts/generate-font-exports.ts`
2. Test with `pnpm generate:fonts`
3. Verify build with `pnpm build`

### Technical Details

- **Runtime**: Node.js with `tsx`
- **Input**: `src/google/font-data.json` (1890+ fonts)
- **Output**: `src/google/fonts.ts` (~3800 lines)
- **Performance**: ~1 second generation time
- **Format**: ESM with named exports
