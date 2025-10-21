/**
 * Formats an array of values into a string that can be used in error messages.
 * ["a", "b", "c"] => "`a`, `b`, `c`"
 */
export function formatAvailableValues(values: string[]): string {
  return values.map((val) => `\`${val}\``).join(", ");
}
