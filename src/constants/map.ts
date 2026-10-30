import type { GeoCoordinates } from "@/types/location";

// Centre of India, used before a GPS fix is available.
export const INDIA_CENTER: GeoCoordinates = { latitude: 22.9, longitude: 79.5 };
export const INDIA_ZOOM = 4.6;
export const GPS_FOCUS_ZOOM = 11;

// Two days of hourly/daily data is enough for the map card and markers, and it
// keeps the batch response small.
export const MAP_FORECAST_DAYS = 2;

export const MAP_LAYERS = [
  { key: "temperature", label: "Temperature", enabled: true },
  { key: "precipitation", label: "Precipitation", enabled: true },
  { key: "cloud", label: "Cloud cover", enabled: true },
  { key: "wind", label: "Wind", enabled: true },
  // Radar tiles are not offered: RainViewer's free API is for personal and
  // educational use only, and this app is distributed publicly.
  { key: "radar", label: "Radar", enabled: false },
] as const;

export type MapLayerKey = (typeof MAP_LAYERS)[number]["key"];

export const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const LEAFLET_VERSION = "1.9.4";
