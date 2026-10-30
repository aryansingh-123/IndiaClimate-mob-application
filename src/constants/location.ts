const MINUTE_MS = 60 * 1000;

export const LOCATION_THRESHOLDS = {
  // Movement below this does not count as a new location for weather fetching.
  significantMoveMeters: 1000,
  // Reuse the previous reverse-geocode result when the new fix is this close.
  placeReuseMeters: 200,
  // Refresh GPS on app resume only when the last fix is older than this.
  staleFixMs: 10 * MINUTE_MS,
  // Oldest OS last-known fix accepted when a live fix fails.
  lastKnownMaxAgeMs: 30 * MINUTE_MS,
} as const;
