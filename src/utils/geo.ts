import type { GeoCoordinates } from "@/types/location";

const EARTH_RADIUS_METERS = 6371000;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

// Great-circle distance between two points (haversine formula).
export function distanceMeters(from: GeoCoordinates, to: GeoCoordinates): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function isValidCoordinates(coordinates: GeoCoordinates): boolean {
  const { latitude, longitude } = coordinates;
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function haveSameCoordinates(a: GeoCoordinates, b: GeoCoordinates): boolean {
  return a.latitude === b.latitude && a.longitude === b.longitude;
}
