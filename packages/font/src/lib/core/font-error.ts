/**
 * Custom error class for font-related errors.
 * Provides better error tracking and handling throughout the package.
 */
export class FontError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FontError";

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FontError);
    }
  }
}

/**
 * Throw a FontError with the given message.
 * This is a convenience function to maintain consistency with next-font's error handling.
 */
export function throwFontError(message: string): never {
  throw new FontError(message);
}
