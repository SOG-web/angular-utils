import type { FontSubsetting } from "../core/types.js";

/**
 * Subset local font using fontkit
 * This requires fontkit to be available at build time
 */
export async function subsetLocalFont(
  fontPath: string,
  outputPath: string,
  subset?: FontSubsetting
): Promise<void> {
  // Dynamic import to avoid bundling fontkit in browser code
  const fontkit = await import("fontkit");
  const fs = await import("node:fs");

  try {
    // Read the font file
    const fontBuffer = fs.readFileSync(fontPath);
    const font = fontkit.create(fontBuffer);

    // Determine characters to subset
    let characters: string;
    if (subset?.text) {
      characters = subset.text;
    } else if (subset?.unicodeRange) {
      // Convert unicode range to characters
      characters = unicodeRangeToCharacters(subset.unicodeRange);
    } else {
      // No subsetting requested
      fs.writeFileSync(outputPath, fontBuffer);
      return;
    }

    // Create subset
    const subsetFont = font.createSubset();

    // Add characters to subset
    for (const char of characters) {
      const codePoint = char.codePointAt(0);
      if (codePoint) {
        subsetFont.includeGlyphForCodePoint(codePoint);
      }
    }

    // Generate subset font
    const subsetBuffer = subsetFont.encode();

    // Write subset font
    fs.writeFileSync(outputPath, subsetBuffer);
  } catch (error) {
    throw new Error(`Failed to subset font ${fontPath}: ${error}`);
  }
}

/**
 * Convert unicode range to characters
 * @example "U+0020-007F" -> " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~"
 */
function unicodeRangeToCharacters(unicodeRange: string): string {
  const characters: string[] = [];

  // Parse unicode ranges like "U+0020-007F" or "U+0020-007F,U+00A0-00FF"
  const ranges = unicodeRange.split(",").map((range) => range.trim());

  for (const range of ranges) {
    if (range.startsWith("U+")) {
      const rangePart = range.slice(2); // Remove "U+"

      if (rangePart.includes("-")) {
        // Range like "0020-007F"
        const [start, end] = rangePart.split("-");
        const startCode = parseInt(start, 16);
        const endCode = parseInt(end, 16);

        for (let code = startCode; code <= endCode; code++) {
          characters.push(String.fromCodePoint(code));
        }
      } else {
        // Single code point like "0020"
        const code = parseInt(rangePart, 16);
        characters.push(String.fromCodePoint(code));
      }
    }
  }

  return characters.join("");
}

/**
 * Get font file size reduction estimate for subsetting
 */
export function estimateSubsetReduction(
  originalSize: number,
  characterCount: number,
  totalCharacterCount: number = 1000 // Rough estimate for full font
): {
  originalSize: number;
  estimatedSubsetSize: number;
  reduction: number;
  reductionPercent: number;
} {
  // Rough estimate: subset size is proportional to character count
  const estimatedSubsetSize =
    (originalSize * characterCount) / totalCharacterCount;
  const reduction = originalSize - estimatedSubsetSize;
  const reductionPercent = (reduction / originalSize) * 100;

  return {
    originalSize,
    estimatedSubsetSize: Math.round(estimatedSubsetSize),
    reduction: Math.round(reduction),
    reductionPercent: Math.round(reductionPercent * 10) / 10,
  };
}
