import { API } from "@/constants/api";
import { apiError, fetchJson } from "@/services/http";
import type { CitySearchResult } from "@/types/search";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const RESULT_COUNT = 8;

type RawGeocodingResult = {
  id?: unknown;
  name?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  admin1?: unknown;
  country?: unknown;
  country_code?: unknown;
};

type RawGeocodingResponse = {
  results?: RawGeocodingResult[];
};

// Searches Indian places. The API returns no "results" key when nothing matches.
export async function searchIndianCities(query: string, signal?: AbortSignal): Promise<CitySearchResult[]> {
  const params = new URLSearchParams({
    name: query,
    count: String(RESULT_COUNT),
    language: "en",
    format: "json",
    countryCode: "IN",
  });

  const body = await fetchJson(`${GEOCODING_URL}?${params.toString()}`, {
    timeoutMs: API.requestTimeoutMs,
    signal,
  });
  if (typeof body !== "object" || body === null) {
    throw apiError("invalid-data");
  }

  const results = (body as RawGeocodingResponse).results ?? [];
  return results.flatMap((raw) => {
    const mapped = toCitySearchResult(raw);
    return mapped ? [mapped] : [];
  });
}

// Drops malformed rows instead of failing the whole search.
function toCitySearchResult(raw: RawGeocodingResult): CitySearchResult | null {
  if (typeof raw.id !== "number" || typeof raw.name !== "string") return null;
  if (typeof raw.latitude !== "number" || typeof raw.longitude !== "number") return null;

  return {
    id: raw.id,
    name: raw.name,
    coordinates: { latitude: raw.latitude, longitude: raw.longitude },
    region: typeof raw.admin1 === "string" ? raw.admin1 : null,
    country: typeof raw.country === "string" ? raw.country : null,
    countryCode: typeof raw.country_code === "string" ? raw.country_code : null,
  };
}
