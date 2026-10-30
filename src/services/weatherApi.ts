import { API, FORECAST_VARIABLES } from "@/constants/api";
import { MAP_FORECAST_DAYS } from "@/constants/map";
import { apiError, fetchJson, type ApiErrorCode } from "@/services/http";
import type { GeoCoordinates } from "@/types/location";
import type { OpenMeteoForecastResponse } from "@/types/weather";

export type WeatherErrorCode = ApiErrorCode;

// Fetches the forecast for exact coordinates. Pass a signal to cancel a request
// that has become stale, for example after the location changed.
export async function fetchForecast(
  coordinates: GeoCoordinates,
  signal?: AbortSignal,
): Promise<OpenMeteoForecastResponse> {
  const params = new URLSearchParams({
    latitude: String(coordinates.latitude),
    longitude: String(coordinates.longitude),
    current: FORECAST_VARIABLES.current.join(","),
    hourly: FORECAST_VARIABLES.hourly.join(","),
    daily: FORECAST_VARIABLES.daily.join(","),
    timezone: "auto",
    forecast_days: String(API.forecastDays),
  });

  const body = await fetchJson(`${API.forecastUrl}?${params.toString()}`, {
    timeoutMs: API.requestTimeoutMs,
    signal,
  });
  if (!isForecastResponse(body)) {
    throw apiError("invalid-data");
  }
  return body;
}

export function isForecastResponse(value: unknown): value is OpenMeteoForecastResponse {
  if (typeof value !== "object" || value === null) return false;
  const body = value as Record<string, unknown>;
  const current = body.current as Record<string, unknown> | undefined;
  const hourly = body.hourly as Record<string, unknown> | undefined;
  const daily = body.daily as Record<string, unknown> | undefined;
  return typeof current?.time === "string" && Array.isArray(hourly?.time) && Array.isArray(daily?.time);
}

// One request for several points. Open-Meteo returns an array for several
// locations and a single object for one, so both shapes are normalised here.
export async function fetchForecastBatch(
  points: GeoCoordinates[],
  signal?: AbortSignal,
): Promise<OpenMeteoForecastResponse[]> {
  const params = new URLSearchParams({
    latitude: points.map((point) => point.latitude).join(","),
    longitude: points.map((point) => point.longitude).join(","),
    current: FORECAST_VARIABLES.current.join(","),
    hourly: FORECAST_VARIABLES.hourly.join(","),
    daily: FORECAST_VARIABLES.daily.join(","),
    timezone: "auto",
    forecast_days: String(MAP_FORECAST_DAYS),
  });

  const body = await fetchJson(`${API.forecastUrl}?${params.toString()}`, {
    timeoutMs: API.requestTimeoutMs,
    signal,
  });
  const list: unknown[] = Array.isArray(body) ? body : [body];
  if (list.length !== points.length || !list.every(isForecastResponse)) {
    throw apiError("invalid-data");
  }
  return list;
}
