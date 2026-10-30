import * as Location from "expo-location";

import { LOCATION_THRESHOLDS } from "@/constants/location";
import { isValidCoordinates } from "@/utils/geo";
import type { GeoCoordinates, LocationErrorCode, ResolvedPlace } from "@/types/location";

export type GpsFix = {
  coordinates: GeoCoordinates;
  capturedAt: number;
  fromCache: boolean;
};

// Errors carry a `code` the UI can map to a message. The error is built as a
// plain Error so the code survives Hermes and Babel (no subclassing).
export function locationError(code: LocationErrorCode): Error & { code: LocationErrorCode } {
  return Object.assign(new Error(code), { code });
}

const LOCATION_ERROR_CODES: readonly LocationErrorCode[] = [
  "permission-denied",
  "permission-blocked",
  "services-disabled",
  "unavailable",
];

export function toLocationErrorCode(error: unknown): LocationErrorCode {
  const code = (error as { code?: unknown } | null)?.code;
  return LOCATION_ERROR_CODES.includes(code as LocationErrorCode)
    ? (code as LocationErrorCode)
    : "unavailable";
}

// Asks once. Android shows the system dialog only while the OS allows it.
export async function requestForegroundPermission(): Promise<void> {
  const response = await Location.requestForegroundPermissionsAsync();
  if (response.granted) return;
  throw locationError(response.canAskAgain ? "permission-denied" : "permission-blocked");
}

export async function ensureLocationServicesEnabled(): Promise<void> {
  const enabled = await Location.hasServicesEnabledAsync();
  if (!enabled) {
    throw locationError("services-disabled");
  }
}

// Takes a live fix. If that fails, falls back to the OS last-known position
// (marked fromCache). If that is also missing, reports unavailable.
export async function readCurrentFix(): Promise<GpsFix> {
  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return toFix(position, false);
  } catch {
    const lastKnown = await Location.getLastKnownPositionAsync({
      maxAge: LOCATION_THRESHOLDS.lastKnownMaxAgeMs,
    }).catch(() => null);
    if (lastKnown) {
      return toFix(lastKnown, true);
    }
    throw locationError("unavailable");
  }
}

function toFix(position: Location.LocationObject, fromCache: boolean): GpsFix {
  const coordinates: GeoCoordinates = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
  if (!isValidCoordinates(coordinates)) {
    throw locationError("unavailable");
  }
  return { coordinates, capturedAt: position.timestamp, fromCache };
}

// Returns null on failure. Weather still works without a place name, and the
// UI falls back to showing coordinates.
export async function reverseGeocode(coordinates: GeoCoordinates): Promise<ResolvedPlace | null> {
  try {
    const [address] = await Location.reverseGeocodeAsync(coordinates);
    if (!address) return null;

    const place: ResolvedPlace = {
      city: address.city ?? null,
      district: address.district ?? address.subregion ?? null,
      region: address.region ?? null,
      country: address.country ?? null,
      countryCode: address.isoCountryCode ?? null,
    };
    const hasAnyName = Boolean(place.city || place.district || place.region || place.country);
    return hasAnyName ? place : null;
  } catch {
    return null;
  }
}
