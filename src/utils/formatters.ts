import type { GeoCoordinates, LocationPoint, ResolvedPlace } from "@/types/location";

// "Begusarai, Bihar, India". Duplicate parts are dropped (city == district).
export function formatPlaceLabel(place: ResolvedPlace | null): string | null {
  if (!place) return null;
  const parts = [place.city ?? place.district, place.region, place.country].filter(
    (part): part is string => Boolean(part),
  );
  const unique = parts.filter((part, index) => parts.indexOf(part) === index);
  return unique.length > 0 ? unique.join(", ") : null;
}

export function formatCoordinates({ latitude, longitude }: GeoCoordinates): string {
  const latHemisphere = latitude >= 0 ? "N" : "S";
  const lonHemisphere = longitude >= 0 ? "E" : "W";
  return `${Math.abs(latitude).toFixed(4)}° ${latHemisphere}, ${Math.abs(longitude).toFixed(4)}° ${lonHemisphere}`;
}

// Falls back to coordinates when reverse geocoding gave no name.
export function formatPointLabel(point: LocationPoint): string {
  return formatPlaceLabel(point.place) ?? formatCoordinates(point.coordinates);
}

export function formatUpdatedAt(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Parses an Open-Meteo local timestamp ("2026-10-30" or "2026-10-30T14:00") as a
// wall-clock date. It does not shift to the device's timezone.
function parseLocalDateTime(isoLocal: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(isoLocal);
  if (!match) return null;
  const [, year, month, day, hour = "0", minute = "0"] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
}

export function formatWeekday(isoDate: string): string {
  const date = parseLocalDateTime(isoDate);
  return date ? date.toLocaleDateString(undefined, { weekday: "short" }) : "--";
}

export function formatShortDate(isoDate: string): string {
  const date = parseLocalDateTime(isoDate);
  return date ? date.toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "--";
}

export function formatLocalHour(isoLocal: string): string {
  const date = parseLocalDateTime(isoLocal);
  return date ? date.toLocaleTimeString(undefined, { hour: "numeric" }) : "--";
}

// "06:12" (location-local, from the sun times) -> "6:12 AM" in the device locale.
export function formatClock(hhmm: string | null): string {
  if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return "--";
  const [hours, minutes] = hhmm.split(":").map(Number);
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatHeroDate(isoLocal: string): string {
  return `${formatWeekday(isoLocal)}, ${formatShortDate(isoLocal)}`;
}

export function formatDuration(seconds: number | null): string {
  if (seconds === null) return "--";
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

export function formatNumber(value: number | null, fractionDigits = 0): string {
  return value === null ? "--" : value.toFixed(fractionDigits);
}

// Device-local date and time for the header, e.g. "Fri, 30 Oct · 2:15 PM".
export function formatDeviceDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  const day = date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  const time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${day} · ${time}`;
}
