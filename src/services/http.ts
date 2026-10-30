// Shared JSON client for all Open-Meteo calls. It adds a timeout and an
// explicit error code, so callers never handle raw fetch or abort errors.

export type ApiErrorCode = "network" | "timeout" | "http" | "invalid-data";

export type ApiError = Error & { code: ApiErrorCode };

export function apiError(code: ApiErrorCode): ApiError {
  return Object.assign(new Error(code), { code });
}

export function isApiError(error: unknown): error is ApiError {
  const code = (error as { code?: unknown } | null)?.code;
  return code === "network" || code === "timeout" || code === "http" || code === "invalid-data";
}

type FetchJsonOptions = {
  timeoutMs: number;
  signal?: AbortSignal;
};

// Returns the parsed body without validating its shape. Callers validate it.
// A caller's abort is rethrown as-is, so the caller can ignore it.
export async function fetchJson(url: string, { timeoutMs, signal }: FetchJsonOptions): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener("abort", forwardAbort);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw apiError("http");
    }
    return await response.json();
  } catch (error) {
    if (signal?.aborted) throw error;
    if (controller.signal.aborted) throw apiError("timeout");
    if (isApiError(error)) throw error;
    throw apiError("network");
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", forwardAbort);
  }
}
