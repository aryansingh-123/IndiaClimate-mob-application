import { API } from "@/constants/api";
import { apiError, fetchJson } from "@/services/http";
import type { GeoCoordinates } from "@/types/location";
import type { OpenMeteoAirQualityResponse } from "@/types/airQuality";

const AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

// Hourly is documented for air quality, so values are read at the current hour.
// One day of hours covers the current local date.
const AIR_QUALITY_VARIABLES = [
  "us_aqi",
  "pm2_5",
  "pm10",
  "nitrogen_dioxide",
  "ozone",
  "carbon_monoxide",
  "sulphur_dioxide",
] as const;

export async function fetchAirQuality(
  coordinates: GeoCoordinates,
  signal?: AbortSignal,
): Promise<OpenMeteoAirQualityResponse> {
  const params = new URLSearchParams({
    latitude: String(coordinates.latitude),
    longitude: String(coordinates.longitude),
    hourly: AIR_QUALITY_VARIABLES.join(","),
    timezone: "auto",
    forecast_days: "1",
  });

  const body = await fetchJson(`${AIR_QUALITY_URL}?${params.toString()}`, {
    timeoutMs: API.requestTimeoutMs,
    signal,
  });
  if (!isAirQualityResponse(body)) {
    throw apiError("invalid-data");
  }
  return body;
}

export function isAirQualityResponse(value: unknown): value is OpenMeteoAirQualityResponse {
  if (typeof value !== "object" || value === null) return false;
  const hourly = (value as { hourly?: { time?: unknown } }).hourly;
  return Array.isArray(hourly?.time);
}
