import { cacheKeyFor, readCache, writeCache, type CacheEntry } from "@/services/cache";
import { fetchAirQuality, isAirQualityResponse } from "@/services/airQualityApi";
import { isApiError, apiError, type ApiErrorCode } from "@/services/http";
import { fetchForecast, fetchForecastBatch, isForecastResponse } from "@/services/weatherApi";
import type { GeoCoordinates } from "@/types/location";
import type { OpenMeteoAirQualityResponse } from "@/types/airQuality";
import type { OpenMeteoForecastResponse } from "@/types/weather";
import { withRetry } from "@/utils/retry";

const MINUTE_MS = 60 * 1000;

// How long a cached payload counts as live without a network request.
// Weather models update about hourly, and air quality is on the same cadence.
export const FRESHNESS_MS = {
  forecast: 15 * MINUTE_MS,
  airQuality: 60 * MINUTE_MS,
} as const;

// "network" = just fetched. "fresh-cache" = within freshness. "stale-cache" =
// older cache shown because the network failed or the device is offline.
export type DataOrigin = "network" | "fresh-cache" | "stale-cache";

export type Loaded<T> = {
  payload: T;
  savedAt: number;
  origin: DataOrigin;
  // Why the value is not live. null when it is live.
  failure: ApiErrorCode | null;
};

export type LoadOptions = {
  // Skip the cache and fetch now (pull to refresh).
  force: boolean;
  online: boolean;
  signal?: AbortSignal;
};

type CachedRequest<P> = {
  scope: string;
  coordinates: GeoCoordinates;
  freshMs: number;
  isPayload: (value: unknown) => value is P;
  fetcher: (coordinates: GeoCoordinates, signal?: AbortSignal) => Promise<P>;
};

// Cache-first policy:
// 1. A fresh cache entry is returned with no request.
// 2. Otherwise fetch (with retries) and store the result.
// 3. If the fetch fails or the device is offline, fall back to any cached entry,
//    marked stale so the UI never presents it as live.
async function loadWithCache<P>(request: CachedRequest<P>, options: LoadOptions): Promise<Loaded<P>> {
  const { scope, coordinates, freshMs, isPayload, fetcher } = request;
  const { force, online, signal } = options;
  const key = cacheKeyFor(scope, coordinates);
  const cached = await readCache(key, isPayload);

  if (cached && !force && Date.now() - cached.savedAt < freshMs) {
    return { payload: cached.payload, savedAt: cached.savedAt, origin: "fresh-cache", failure: null };
  }

  if (!online) {
    if (cached) {
      return { payload: cached.payload, savedAt: cached.savedAt, origin: "stale-cache", failure: "network" };
    }
    throw apiError("network");
  }

  try {
    const payload = await withRetry(() => fetcher(coordinates, signal), signal);
    const savedAt = Date.now();
    await writeCache(key, payload, savedAt);
    return { payload, savedAt, origin: "network", failure: null };
  } catch (error) {
    if (signal?.aborted || !cached) throw error;
    return {
      payload: cached.payload,
      savedAt: cached.savedAt,
      origin: "stale-cache",
      failure: isApiError(error) ? error.code : "invalid-data",
    };
  }
}

export function loadForecast(
  coordinates: GeoCoordinates,
  options: LoadOptions,
): Promise<Loaded<OpenMeteoForecastResponse>> {
  return loadWithCache<OpenMeteoForecastResponse>(
    {
      scope: "forecast",
      coordinates,
      freshMs: FRESHNESS_MS.forecast,
      isPayload: isForecastResponse,
      fetcher: fetchForecast,
    },
    options,
  );
}

export function loadAirQuality(
  coordinates: GeoCoordinates,
  options: LoadOptions,
): Promise<Loaded<OpenMeteoAirQualityResponse>> {
  return loadWithCache<OpenMeteoAirQualityResponse>(
    {
      scope: "air",
      coordinates,
      freshMs: FRESHNESS_MS.airQuality,
      isPayload: isAirQualityResponse,
      fetcher: fetchAirQuality,
    },
    options,
  );
}

export type MapPoint = {
  id: string;
  coordinates: GeoCoordinates;
};

// Loads forecasts for many map points. Each point is cached on its own. Points
// that need a request share one batch call. A point that cannot be loaded is
// missing from the result, so the caller can show it as unavailable.
export async function loadMapForecasts(
  points: MapPoint[],
  options: LoadOptions,
): Promise<Map<string, Loaded<OpenMeteoForecastResponse>>> {
  const { force, online, signal } = options;
  const results = new Map<string, Loaded<OpenMeteoForecastResponse>>();
  const cachedEntries = await Promise.all(
    points.map((point) => readCache(cacheKeyFor("map", point.coordinates), isForecastResponse)),
  );

  const toFetch: { point: MapPoint; cached: CacheEntry<OpenMeteoForecastResponse> | null }[] = [];
  points.forEach((point, index) => {
    const cached = cachedEntries[index];
    if (cached && !force && Date.now() - cached.savedAt < FRESHNESS_MS.forecast) {
      results.set(point.id, { payload: cached.payload, savedAt: cached.savedAt, origin: "fresh-cache", failure: null });
    } else {
      toFetch.push({ point, cached });
    }
  });
  if (toFetch.length === 0) return results;

  const useStaleCache = (failure: ApiErrorCode) => {
    for (const { point, cached } of toFetch) {
      if (cached) {
        results.set(point.id, { payload: cached.payload, savedAt: cached.savedAt, origin: "stale-cache", failure });
      }
    }
  };

  if (!online) {
    useStaleCache("network");
    if (results.size === 0) throw apiError("network");
    return results;
  }

  try {
    const fetched = await withRetry(
      () => fetchForecastBatch(toFetch.map(({ point }) => point.coordinates), signal),
      signal,
    );
    const savedAt = Date.now();
    await Promise.all(
      toFetch.map(({ point }, index) => writeCache(cacheKeyFor("map", point.coordinates), fetched[index], savedAt)),
    );
    toFetch.forEach(({ point }, index) => {
      results.set(point.id, { payload: fetched[index], savedAt, origin: "network", failure: null });
    });
    return results;
  } catch (error) {
    if (signal?.aborted) throw error;
    useStaleCache(isApiError(error) ? error.code : "invalid-data");
    if (results.size === 0) throw error;
    return results;
  }
}
