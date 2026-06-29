const TRANSIENT_ERROR_PATTERN =
  /rate limit|timeout|overloaded|503|502|429|ECONNRESET|ETIMEDOUT/i;

export function isTransientError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return TRANSIENT_ERROR_PATTERN.test(error.message);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts?: number; baseDelayMs?: number } = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 1000;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts || !isTransientError(error)) {
        throw error;
      }

      const delayMs = baseDelayMs * 2 ** (attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}
