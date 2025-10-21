import fs from "node:fs";
import path from "node:path";
import { isFontAvailable } from "../../../google/metadata.js";

export interface FontImport {
  type: "google" | "local";
  family: string;
  options: any;
  file: string;
  line: number;
}

/**
 * Scan TypeScript files for font imports
 *
 * @param sourceRoot - The root directory to start scanning
 * @param projectRoot - The project root directory
 * @param fontFile - Optional specific font file to scan (e.g., 'src/fonts.ts')
 *                   If not provided, will look for common font file names
 */
export async function scanForFontImports(
  sourceRoot: string,
  projectRoot: string,
  fontFile?: string
): Promise<FontImport[]> {
  const fontImports: FontImport[] = [];

  // Determine which file(s) to scan
  let filesToScan: string[] = [];

  if (fontFile) {
    // Use the user-specified font file
    const fontFilePath = path.isAbsolute(fontFile)
      ? fontFile
      : path.join(projectRoot, fontFile);

    if (fs.existsSync(fontFilePath)) {
      filesToScan.push(fontFilePath);
    } else {
      console.warn(
        `Font file not found: ${fontFile}\n` +
          `Please create a font declaration file or update your configuration.`
      );
      return fontImports;
    }
  } else {
    // Look for common font file names (convention-based)
    const commonFontFileNames = [
      path.join(sourceRoot, "fonts.ts"),
      path.join(sourceRoot, "app", "fonts.ts"),
      path.join(sourceRoot, "lib", "fonts.ts"),
      path.join(sourceRoot, "config", "fonts.ts"),
    ];

    for (const filePath of commonFontFileNames) {
      if (fs.existsSync(filePath)) {
        filesToScan.push(filePath);
        break; // Only use the first match
      }
    }

    if (filesToScan.length === 0) {
      console.info(
        `No font file found. Checked: ${commonFontFileNames.map((f) => path.relative(projectRoot, f)).join(", ")}\n` +
          `To use font optimization, create a fonts.ts file in your src directory, or configure a custom path.`
      );
      return fontImports;
    }
  }

  // Scan the identified font file(s)
  for (const filePath of filesToScan) {
    const content = fs.readFileSync(filePath, "utf8");

    console.info(
      `Scanning font declarations in: ${path.relative(projectRoot, filePath)}`
    );

    // Scan for Google Font imports
    const googleFontImports = scanForGoogleFontImports(content, filePath);
    fontImports.push(...googleFontImports);

    // Scan for local font imports
    const localFontImports = scanForLocalFontImports(content, filePath);
    fontImports.push(...localFontImports);
  }

  return fontImports;
}

/**
 * Scan for Google Font imports like Inter({ weights: [400, 700] })
 */
function scanForGoogleFontImports(
  content: string,
  filePath: string
): FontImport[] {
  const imports: FontImport[] = [];

  // Pattern to match font function calls (can span multiple lines)
  const fontFunctionPattern = /(\w+)\s*\(\s*\{([^}]*)\}\s*\)/g;

  let match;
  while ((match = fontFunctionPattern.exec(content)) !== null) {
    const functionName = match[1];
    const optionsStr = `{${match[2]}}`;

    // Check if this is a Google Font function (not localFont)
    if (functionName !== "localFont" && isValidGoogleFontName(functionName)) {
      try {
        // Parse the options object
        const options = eval(`(${optionsStr})`);

        // Calculate line number
        const lineNumber = content.substring(0, match.index).split("\n").length;

        imports.push({
          type: "google",
          family: functionName.replace(/_/g, " "),
          options,
          file: filePath,
          line: lineNumber,
        });
      } catch (error) {
        console.warn(
          `Failed to parse font options in ${filePath}:${match[1]}`,
          error
        );
      }
    }
  }

  return imports;
}

/**
 * Scan for local font imports like localFont({ src: './font.woff2' })
 */
function scanForLocalFontImports(
  content: string,
  filePath: string
): FontImport[] {
  const imports: FontImport[] = [];
  const lines = content.split("\n");

  // Pattern to match localFont function calls
  const localFontPattern = /localFont\s*\(\s*(\{[\s\S]*?\})\s*\)/gm;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = localFontPattern.exec(line);

    if (match) {
      const optionsStr = match[1];

      try {
        // Parse the options object
        const options = eval(`(${optionsStr})`);

        // Extract font family name from src path
        const src = options.src;
        const fontFamily = extractFontFamilyFromSrc(src);

        imports.push({
          type: "local",
          family: fontFamily,
          options,
          file: filePath,
          line: i + 1,
        });
      } catch (error) {
        console.warn(
          `Failed to parse local font options in ${filePath}:${i + 1}`,
          error
        );
      }
    }
  }

  return imports;
}

/**
 * Check if a function name is a valid Google Font name
 * Uses font-data.json which contains all 1000+ Google Fonts
 */
function isValidGoogleFontName(name: string): boolean {
  // Convert underscores to spaces for lookup
  // e.g., "Roboto_Mono" -> "Roboto Mono"
  const fontFamily = name.replace(/_/g, " ");

  return isFontAvailable(fontFamily);
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
