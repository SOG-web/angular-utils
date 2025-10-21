/**
 * Retry options for network requests
 */
export interface RetryOptions {
  /**
   * Number of retry attempts
   * @default 3
   */
  retries?: number;

  /**
   * Delay between retries in milliseconds
   * @default 1000
   */
  delay?: number;

  /**
   * Whether to use exponential backoff
   * @default true
   */
  exponentialBackoff?: boolean;
}

/**
 * Retry a function with exponential backoff
 * Useful for network requests that may fail due to transient issues
 *
 * @param fn - The async function to retry
 * @param retries - Number of retry attempts (default: 3)
 * @param options - Additional retry options
 * @returns The result of the function
 * @throws The last error if all retries fail
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  options: Omit<RetryOptions, "retries"> = {}
): Promise<T> {
  const { delay = 1000, exponentialBackoff = true } = options;
  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't wait after the last attempt
      if (attempt < retries) {
        const waitTime = exponentialBackoff
          ? delay * Math.pow(2, attempt)
          : delay;

        console.warn(
          `Retry attempt ${attempt + 1}/${retries} failed. Retrying in ${waitTime}ms...`
        );

        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries failed, throw the last error
  throw lastError;
}
