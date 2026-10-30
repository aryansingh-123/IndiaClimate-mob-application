import { readStoredJson, removeStoredValue, writeStoredJson } from "@/services/storage";
import type { GeoCoordinates } from "@/types/location";

// Local cache for API payloads. Each entry is a JSON envelope with the time it
// was saved. The index keeps the newest entries and evicts the rest.

const MAX_ENTRIES = 30;
const INDEX_KEY = "indiaclimate.cache.index";

export type CacheEntry<T> = {
  savedAt: number;
  payload: T;
};

// Coordinates are rounded to ~1 km. Nearby GPS jitter then reuses the same
// entry, and weather is regional anyway.
export function cacheKeyFor(scope: string, coordinates: GeoCoordinates): string {
  const lat = coordinates.latitude.toFixed(2);
  const lon = coordinates.longitude.toFixed(2);
  return `indiaclimate.cache.${scope}.${lat},${lon}`;
}

function isEnvelope(value: unknown): value is CacheEntry<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { savedAt?: unknown }).savedAt === "number" &&
    "payload" in value
  );
}

export async function readCache<T>(key: string, isPayload: (value: unknown) => value is T): Promise<CacheEntry<T> | null> {
  const envelope = await readStoredJson(key, isEnvelope);
  if (!envelope || !isPayload(envelope.payload)) return null;
  return { savedAt: envelope.savedAt, payload: envelope.payload };
}

export async function writeCache<T>(key: string, payload: T, savedAt: number): Promise<void> {
  const entry: CacheEntry<T> = { savedAt, payload };
  await writeStoredJson(key, entry);

  // Move the key to the end of the index (most recent), then evict the oldest.
  const index = (await readStoredJson(INDEX_KEY, isStringArray)) ?? [];
  const nextIndex = [...index.filter((existing) => existing !== key), key];
  const evicted = nextIndex.slice(0, Math.max(0, nextIndex.length - MAX_ENTRIES));
  await Promise.all(evicted.map((old) => removeStoredValue(old)));
  await writeStoredJson(INDEX_KEY, nextIndex.slice(evicted.length));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
