import { isApiError } from "@/services/http";

const RETRY_DELAYS_MS = [600, 1500] as const;

// Retries only transient failures (network and timeouts). A server error
// like 400 will not change on retry, so it fails immediately.
export async function withRetry<T>(operation: () => Promise<T>, signal?: AbortSignal): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const transient = isApiError(error) && (error.code === "network" || error.code === "timeout");
      const hasRetriesLeft = attempt < RETRY_DELAYS_MS.length;
      if (!transient || !hasRetriesLeft || signal?.aborted) {
        throw error;
      }
      await delay(RETRY_DELAYS_MS[attempt], signal);
    }
  }
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new Error("aborted"));
    };
    signal?.addEventListener("abort", onAbort);
  });
}
