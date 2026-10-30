import type { GeoCoordinates } from "@/types/location";

export type MarkerKind = "city" | "manual";

// Icon keys understood by the Leaflet page (see components/map/mapHtml.ts).
export type MarkerIconKey = "sun" | "moon" | "cloud" | "rain" | "storm" | "snow";

export type MapMarker = {
  id: string;
  name: string;
  coordinates: GeoCoordinates;
  kind: MarkerKind;
  // Value for the active layer, e.g. "27°" or "0.4 mm". "--" when unavailable.
  label: string;
  icon: MarkerIconKey;
};
