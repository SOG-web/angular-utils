import path from "node:path";
import { isFontAvailable } from "../../google/metadata.js";

export interface FontImportBase {
  type: "google" | "local";
  family: string;
  options: any;
}

export interface FontImportWithMetadata extends FontImportBase {
  file: string;
  line: number;
}

export interface ScannerOptions {
  /**
   * Include file path and line number in results
   * @default false
   */
  includeMetadata?: boolean;

  /**
   * Validate Google Font names against available fonts
   * @default true
   */
  validateGoogleFonts?: boolean;
}

/**
 * Scan for Google Font imports using the createGoogleFont() pattern
 * Pattern: createGoogleFont('FontName', { options })
 */
export function scanCreateGoogleFontPattern(
  content: string,
  filePath: string,
  options: ScannerOptions = {}
): Array<FontImportBase | FontImportWithMetadata> {
  const imports: Array<FontImportBase | FontImportWithMetadata> = [];
  const { includeMetadata = false, validateGoogleFonts = true } = options;

  const googleFontRegex =
    /createGoogleFont\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*(\{[^}]*\})\s*\)/g;
  let match;

  while ((match = googleFontRegex.exec(content)) !== null) {
    const [, fontFamily, optionsStr] = match;

    // Validate font name if enabled
    if (validateGoogleFonts && !isFontAvailable(fontFamily)) {
      console.warn(`Unknown Google Font: ${fontFamily} in ${filePath}`);
      continue;
    }

    try {
      // Parse options (simple JSON parsing)
      const parsedOptions = JSON.parse(optionsStr);

      const fontImport: FontImportBase = {
        type: "google",
        family: fontFamily,
        options: parsedOptions,
      };

      if (includeMetadata) {
        const lineNumber = content.substring(0, match.index).split("\n").length;
        imports.push({
          ...fontImport,
          file: filePath,
          line: lineNumber,
        } as FontImportWithMetadata);
      } else {
        imports.push(fontImport);
      }
    } catch (error) {
      console.warn(`Failed to parse options for ${fontFamily}:`, error);
    }
  }

  return imports;
}

/**
 * Scan for Google Font imports using the direct function call pattern
 * Pattern: FontName({ options })
 */
export function scanDirectFunctionPattern(
  content: string,
  filePath: string,
  options: ScannerOptions = {}
): Array<FontImportBase | FontImportWithMetadata> {
  const imports: Array<FontImportBase | FontImportWithMetadata> = [];
  const { includeMetadata = false, validateGoogleFonts = true } = options;

  // Pattern to match font function calls (can span multiple lines)
  const fontFunctionPattern = /(\w+)\s*\(\s*\{([^}]*)\}\s*\)/g;

  let match;
  while ((match = fontFunctionPattern.exec(content)) !== null) {
    const functionName = match[1];
    const optionsStr = `{${match[2]}}`;

    // Check if this is a Google Font function (not localFont)
    if (functionName === "localFont") {
      continue;
    }

    // Convert function name to font family (e.g., Roboto_Mono -> Roboto Mono)
    const fontFamily = functionName.replace(/_/g, " ");

    // Validate font name if enabled
    if (validateGoogleFonts && !isFontAvailable(fontFamily)) {
      continue; // Skip if not a valid Google Font
    }

    try {
      // Parse the options object
      const parsedOptions = eval(`(${optionsStr})`);

      const fontImport: FontImportBase = {
        type: "google",
        family: fontFamily,
        options: parsedOptions,
      };

      if (includeMetadata) {
        const lineNumber = content.substring(0, match.index).split("\n").length;
        imports.push({
          ...fontImport,
          file: filePath,
          line: lineNumber,
        } as FontImportWithMetadata);
      } else {
        imports.push(fontImport);
      }
    } catch (error) {
      console.warn(
        `Failed to parse font options in ${filePath}:${functionName}`,
        error
      );
    }
  }

  return imports;
}

/**
 * Scan for local font imports like localFont({ src: './font.woff2' })
 * Handles multi-line localFont declarations with nested braces
 */
export function scanLocalFontImports(
  content: string,
  filePath: string,
  options: ScannerOptions = {}
): Array<FontImportBase | FontImportWithMetadata> {
  const imports: Array<FontImportBase | FontImportWithMetadata> = [];
  const { includeMetadata = false } = options;

  // Find all localFont( occurrences
  const localFontStart = /localFont\s*\(/g;
  let match;

  while ((match = localFontStart.exec(content)) !== null) {
    const startIndex = match.index + match[0].length;

    // Find the matching closing parenthesis by counting braces and parens
    let braceCount = 0;
    let parenCount = 1; // We already have the opening paren from localFont(
    let endIndex = startIndex;
    let inString = false;
    let stringChar = "";

    for (let i = startIndex; i < content.length && parenCount > 0; i++) {
      const char = content[i];
      const prevChar = i > 0 ? content[i - 1] : "";

      // Handle string literals (skip counting braces/parens in strings)
      if ((char === '"' || char === "'" || char === "`") && prevChar !== "\\") {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = "";
        }
      }

      if (!inString) {
        if (char === "{") braceCount++;
        else if (char === "}") braceCount--;
        else if (char === "(") parenCount++;
        else if (char === ")") parenCount--;
      }

      endIndex = i;
    }

    // Extract the options string (should start with { and end with })
    const fullCallStr = content.substring(startIndex, endIndex + 1);
    const optionsMatch = fullCallStr.match(/^\s*(\{[\s\S]*\})\s*\)?$/);

    if (optionsMatch) {
      const optionsStr = optionsMatch[1];

      try {
        // Parse the options object
        const parsedOptions = eval(`(${optionsStr})`);

        // Extract font family name from options
        const fontFamily = extractFontFamilyFromOptions(parsedOptions);

        const fontImport: FontImportBase = {
          type: "local",
          family: fontFamily,
          options: parsedOptions,
        };

        if (includeMetadata) {
          const lineNumber = content
            .substring(0, match.index)
            .split("\n").length;
          imports.push({
            ...fontImport,
            file: filePath,
            line: lineNumber,
          } as FontImportWithMetadata);
        } else {
          imports.push(fontImport);
        }
      } catch (error) {
        console.warn(
          `Failed to parse local font options in ${filePath}:${content.substring(0, match.index).split("\n").length}`,
          error
        );
      }
    }
  }

  return imports;
}

/**
 * Extract font family name from local font options
 */
function extractFontFamilyFromOptions(options: any): string {
  // Try to get from variable name
  if (options.variable) {
    return options.variable.replace("--font-", "").replace(/-/g, " ");
  }

  // Try to get from src path
  if (options.src) {
    return extractFontFamilyFromSrc(options.src);
  }

  return "custom-font";
}

/**
 * Extract font family name from src path
 */
function extractFontFamilyFromSrc(
  src: string | Array<{ path: string }>
): string {
  let pathStr: string;

  if (typeof src === "string") {
    pathStr = src;
  } else if (Array.isArray(src) && src.length > 0) {
    pathStr = src[0].path;
  } else {
    return "local-font";
  }

  // Extract filename without extension
  const filename = path.basename(pathStr, path.extname(pathStr));
  return filename.replace(/[-_]/g, " ");
}
