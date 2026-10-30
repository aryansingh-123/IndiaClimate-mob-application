export type GeoCoordinates = {
  latitude: number;
  longitude: number;
};

export type ResolvedPlace = {
  city: string | null;
  district: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
};

// Each source is tracked separately, so a manual city never overwrites GPS.
export type LocationSource = "gps" | "manual" | "map";

export type LocationPoint = {
  source: LocationSource;
  coordinates: GeoCoordinates;
  place: ResolvedPlace | null;
  // When the fix was taken (GPS) or the point was chosen (manual, map).
  capturedAt: number;
  // True when the point came from a cached or last-known fix, not a live one.
  fromCache: boolean;
};

export type LocationErrorCode =
  | "permission-denied"
  | "permission-blocked"
  | "services-disabled"
  | "unavailable";

export type GpsState = {
  status: "idle" | "locating" | "ready" | "error";
  point: LocationPoint | null;
  errorCode: LocationErrorCode | null;
  // Bumps only on a meaningful change (first fix, or a move beyond the threshold).
  // Weather fetching keys off this, so small GPS jitter never triggers requests.
  revision: number;
  movedMeters: number | null;
};

export type LocationState = {
  gps: GpsState;
  manual: LocationPoint | null;
  map: LocationPoint | null;
  activeSource: LocationSource;
};
