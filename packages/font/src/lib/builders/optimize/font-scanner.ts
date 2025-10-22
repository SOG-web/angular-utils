import fs from "node:fs";
import path from "node:path";
import {
  scanDirectFunctionPattern,
  scanLocalFontImports as scanLocalFontImportsCore,
  type FontImportWithMetadata,
} from "../../core/font-scanner-core.js";

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

    // Scan for Google Font imports using direct function pattern
    const googleFontImports = scanDirectFunctionPattern(content, filePath, {
      includeMetadata: true,
      validateGoogleFonts: true,
    }) as FontImportWithMetadata[];
    fontImports.push(...googleFontImports);
    console.info(`  Found ${googleFontImports.length} Google Font import(s)`);

    // Scan for local font imports
    const localFontImports = scanLocalFontImportsCore(content, filePath, {
      includeMetadata: true,
    }) as FontImportWithMetadata[];
    fontImports.push(...localFontImports);
    console.info(`  Found ${localFontImports.length} local font import(s)`);
  }

  return fontImports;
}
