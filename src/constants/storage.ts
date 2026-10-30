// AsyncStorage keys. Prefixed so they never collide with other apps' data.
export const STORAGE_KEYS = {
  themePreference: "indiaclimate.themePreference",
  lastGpsFix: "indiaclimate.lastGpsFix",
  manualLocation: "indiaclimate.manualLocation",
  activeLocationSource: "indiaclimate.activeLocationSource",
} as const;
