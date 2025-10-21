import type { RetryStrategy, BackoffStrategy } from "./types.js";

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
 * Create an abort controller with timeout
 */
function createTimeoutController(timeout: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return controller;
}

/**
 * Calculate backoff delay
 */
function calculateBackoff(
  attempt: number,
  strategy: BackoffStrategy,
  initialDelay: number,
  maxDelay: number
): number {
  let delay: number;

  if (strategy === "exponential") {
    delay = initialDelay * Math.pow(2, attempt);
  } else {
    delay = initialDelay * (attempt + 1);
  }

  return Math.min(delay, maxDelay);
}

/**
 * Enhanced retry function with timeout and custom callbacks
 */
export async function retryWithStrategy<T>(
  fn: (signal?: AbortSignal) => Promise<T>,
  strategy?: RetryStrategy,
  onRetry?: (attempt: number) => void,
  onError?: (error: Error) => void
): Promise<T> {
  const attempts = strategy?.attempts ?? 3;
  const backoff = strategy?.backoff ?? "exponential";
  const initialDelay = strategy?.delay ?? 100;
  const timeout = strategy?.timeout ?? 5000;
  const maxDelay = strategy?.maxDelay ?? 5000;

  let lastError: Error;

  for (let attempt = 0; attempt <= attempts; attempt++) {
    try {
      // Create abort controller for timeout
      const controller =
        timeout > 0 ? createTimeoutController(timeout) : new AbortController();

      return await fn(controller.signal);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Call error callback if provided
      if (onError) {
        onError(lastError);
      }

      // Don't retry after the last attempt
      if (attempt < attempts) {
        // Call retry callback if provided
        if (onRetry) {
          onRetry(attempt + 1);
        }

        const waitTime = calculateBackoff(
          attempt,
          backoff,
          initialDelay,
          maxDelay
        );

        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries failed
  throw lastError!;
}

/**
 * Retry a function with exponential backoff (legacy function for backwards compatibility)
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
