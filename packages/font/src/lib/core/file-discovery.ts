import fs from "node:fs";
import path from "node:path";

/**
 * Find the main styles file in common locations
 * Returns null if not found (fails silently)
 */
export function findMainStylesFile(
  sourceRoot: string,
  projectRoot: string
): string | null {
  const possibleFiles = [
    path.join(sourceRoot, "styles.css"),
    path.join(sourceRoot, "styles.scss"),
    path.join(sourceRoot, "styles.sass"),
    path.join(sourceRoot, "styles.less"),
    path.join(sourceRoot, "global.css"),
    path.join(sourceRoot, "app/globals.css"),
  ];

  for (const file of possibleFiles) {
    if (fs.existsSync(file)) {
      return file;
    }
  }

  return null;
}

/**
 * Find Tailwind config file in common locations
 * Returns null if not found (fails silently)
 */
export function findTailwindConfig(projectRoot: string): string | null {
  const possibleFiles = [
    path.join(projectRoot, "tailwind.config.js"),
    path.join(projectRoot, "tailwind.config.ts"),
    path.join(projectRoot, "tailwind.config.cjs"),
    path.join(projectRoot, "tailwind.config.mjs"),
  ];

  for (const file of possibleFiles) {
    if (fs.existsSync(file)) {
      return file;
    }
  }

  return null;
}

/**
 * Find fonts.ts file in common locations
 * Returns null if not found (fails silently)
 */
export function findFontsFile(sourceRoot: string): string | null {
  const possibleFiles = [
    path.join(sourceRoot, "fonts.ts"),
    path.join(sourceRoot, "app/fonts.ts"),
    path.join(sourceRoot, "lib/fonts.ts"),
    path.join(sourceRoot, "config/fonts.ts"),
  ];

  for (const file of possibleFiles) {
    if (fs.existsSync(file)) {
      return file;
    }
  }

  return null;
}

/**
 * Find index.html file
 * Returns null if not found (fails silently)
 */
export function findIndexHtml(sourceRoot: string): string | null {
  const indexPath = path.join(sourceRoot, "index.html");

  if (fs.existsSync(indexPath)) {
    return indexPath;
  }

  return null;
}
