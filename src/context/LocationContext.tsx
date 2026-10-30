import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type PropsWithChildren,
} from "react";
import { AppState } from "react-native";

import { LOCATION_THRESHOLDS } from "@/constants/location";
import { STORAGE_KEYS } from "@/constants/storage";
import {
  ensureLocationServicesEnabled,
  readCurrentFix,
  requestForegroundPermission,
  reverseGeocode,
  toLocationErrorCode,
} from "@/services/locationService";
import { readStoredJson, readStoredValue, writeStoredJson, writeStoredValue } from "@/services/storage";
import type {
  GeoCoordinates,
  LocationErrorCode,
  LocationPoint,
  LocationSource,
  LocationState,
  ResolvedPlace,
} from "@/types/location";
import { distanceMeters, haveSameCoordinates, isValidCoordinates } from "@/utils/geo";

type LocationAction =
  | { type: "restored"; gps: LocationPoint | null; manual: LocationPoint | null; activeSource: LocationSource | null }
  | { type: "gps/started" }
  | { type: "gps/resolved"; point: LocationPoint }
  | { type: "gps/failed"; errorCode: LocationErrorCode }
  | { type: "manual/selected"; point: LocationPoint }
  | { type: "map/selected"; point: LocationPoint }
  | { type: "map/placeResolved"; coordinates: GeoCoordinates; place: ResolvedPlace }
  | { type: "source/changed"; source: LocationSource };

const initialState: LocationState = {
  gps: { status: "idle", point: null, errorCode: null, revision: 0, movedMeters: null },
  manual: null,
  map: null,
  activeSource: "gps",
};

function locationReducer(state: LocationState, action: LocationAction): LocationState {
  switch (action.type) {
    case "restored":
      return {
        ...state,
        // Restore never overwrites a live fix that arrived first.
        gps: state.gps.point || !action.gps ? state.gps : { ...state.gps, point: action.gps },
        manual: state.manual ?? action.manual,
        activeSource: action.activeSource ?? state.activeSource,
      };

    case "gps/started":
      return { ...state, gps: { ...state.gps, status: "locating", errorCode: null } };

    case "gps/resolved": {
      const previous = state.gps.point;
      const movedMeters = previous ? distanceMeters(previous.coordinates, action.point.coordinates) : null;
      // A cached point being replaced by a fresh one also counts as significant.
      const isSignificant =
        !previous ||
        previous.fromCache ||
        (movedMeters ?? 0) >= LOCATION_THRESHOLDS.significantMoveMeters;

      return {
        ...state,
        gps: {
          status: "ready",
          point: action.point,
          errorCode: null,
          revision: state.gps.revision + (isSignificant ? 1 : 0),
          movedMeters,
        },
      };
    }

    case "gps/failed":
      // Keeps the last known point so the UI can show it as cached.
      return { ...state, gps: { ...state.gps, status: "error", errorCode: action.errorCode } };

    case "manual/selected":
      return { ...state, manual: action.point, activeSource: "manual" };

    case "map/selected":
      // Selecting on the map only records the point. The active location changes
      // when the user chooses "View Full Forecast" (activateMapLocation).
      return { ...state, map: action.point };

    case "map/placeResolved":
      if (!state.map || !haveSameCoordinates(state.map.coordinates, action.coordinates)) {
        return state;
      }
      return { ...state, map: { ...state.map, place: action.place } };

    case "source/changed":
      return { ...state, activeSource: action.source };
  }
}

export type LocationContextValue = LocationState & {
  activePoint: LocationPoint | null;
  refreshGpsLocation: () => Promise<void>;
  returnToGpsLocation: () => void;
  selectManualLocation: (coordinates: GeoCoordinates, place: ResolvedPlace | null) => void;
  selectMapLocation: (coordinates: GeoCoordinates) => Promise<void>;
  activateMapLocation: () => void;
};

export const LocationContext = createContext<LocationContextValue | null>(null);

function isStale(point: LocationPoint | null): boolean {
  return !point || Date.now() - point.capturedAt > LOCATION_THRESHOLDS.staleFixMs;
}

function isLocationSource(value: unknown): value is LocationSource {
  return value === "gps" || value === "manual" || value === "map";
}

function isLocationPoint(value: unknown): value is LocationPoint {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  const coordinates = candidate.coordinates as Record<string, unknown> | undefined;
  return (
    isLocationSource(candidate.source) &&
    typeof candidate.capturedAt === "number" &&
    typeof coordinates?.latitude === "number" &&
    typeof coordinates?.longitude === "number" &&
    isValidCoordinates({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    })
  );
}

export function LocationProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(locationReducer, initialState);
  const inFlightRefresh = useRef<Promise<void> | null>(null);
  const latestGpsPoint = useRef<LocationPoint | null>(null);

  useEffect(() => {
    latestGpsPoint.current = state.gps.point;
  }, [state.gps.point]);

  // Restore the last GPS fix, manual city, and active source. Cached values are
  // shown with fromCache = true until a live fix replaces them.
  useEffect(() => {
    let active = true;
    void Promise.all([
      readStoredJson(STORAGE_KEYS.lastGpsFix, isLocationPoint),
      readStoredJson(STORAGE_KEYS.manualLocation, isLocationPoint),
      readStoredValue(STORAGE_KEYS.activeLocationSource),
    ]).then(([gps, manual, source]) => {
      if (!active) return;
      dispatch({
        type: "restored",
        gps: gps ? { ...gps, source: "gps", fromCache: true } : null,
        manual: manual ? { ...manual, source: "manual" } : null,
        activeSource: isLocationSource(source) ? source : null,
      });
    });
    return () => {
      active = false;
    };
  }, []);

  // Runs one GPS refresh at a time. Concurrent callers share the same promise.
  const refreshGpsLocation = useCallback((): Promise<void> => {
    if (inFlightRefresh.current) return inFlightRefresh.current;

    const run = (async () => {
      dispatch({ type: "gps/started" });
      try {
        await requestForegroundPermission();
        await ensureLocationServicesEnabled();
        const fix = await readCurrentFix();

        // Skip the reverse-geocode request when the user has barely moved.
        const previous = latestGpsPoint.current;
        const reusablePlace =
          previous?.place && distanceMeters(previous.coordinates, fix.coordinates) < LOCATION_THRESHOLDS.placeReuseMeters
            ? previous.place
            : null;
        const place = reusablePlace ?? (await reverseGeocode(fix.coordinates));

        const point: LocationPoint = {
          source: "gps",
          coordinates: fix.coordinates,
          place,
          capturedAt: fix.capturedAt,
          fromCache: fix.fromCache,
        };
        dispatch({ type: "gps/resolved", point });
        if (!fix.fromCache) {
          void writeStoredJson(STORAGE_KEYS.lastGpsFix, point);
        }
      } catch (error) {
        dispatch({ type: "gps/failed", errorCode: toLocationErrorCode(error) });
      }
    })().finally(() => {
      inFlightRefresh.current = null;
    });

    inFlightRefresh.current = run;
    return run;
  }, []);

  // Request permission and fetch the GPS fix when the app opens.
  useEffect(() => {
    void refreshGpsLocation();
  }, [refreshGpsLocation]);

  // Refresh on resume, but only when the last fix is stale. This also covers
  // returning from system settings after granting permission.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active" && isStale(latestGpsPoint.current)) {
        void refreshGpsLocation();
      }
    });
    return () => subscription.remove();
  }, [refreshGpsLocation]);

  const returnToGpsLocation = useCallback(() => {
    dispatch({ type: "source/changed", source: "gps" });
    void writeStoredValue(STORAGE_KEYS.activeLocationSource, "gps");
    if (isStale(latestGpsPoint.current)) {
      void refreshGpsLocation();
    }
  }, [refreshGpsLocation]);

  const selectManualLocation = useCallback((coordinates: GeoCoordinates, place: ResolvedPlace | null) => {
    if (!isValidCoordinates(coordinates)) return;
    const point: LocationPoint = {
      source: "manual",
      coordinates,
      place,
      capturedAt: Date.now(),
      fromCache: false,
    };
    dispatch({ type: "manual/selected", point });
    void writeStoredJson(STORAGE_KEYS.manualLocation, point);
    void writeStoredValue(STORAGE_KEYS.activeLocationSource, "manual");
  }, []);

  const selectMapLocation = useCallback(async (coordinates: GeoCoordinates) => {
    if (!isValidCoordinates(coordinates)) return;
    dispatch({
      type: "map/selected",
      point: { source: "map", coordinates, place: null, capturedAt: Date.now(), fromCache: false },
    });
    const place = await reverseGeocode(coordinates);
    if (place) {
      dispatch({ type: "map/placeResolved", coordinates, place });
    }
  }, []);

  // Not persisted: the map point is transient, so a restart falls back to GPS or the saved city.
  const activateMapLocation = useCallback(() => {
    dispatch({ type: "source/changed", source: "map" });
  }, []);

  const activePoint = useMemo<LocationPoint | null>(() => {
    switch (state.activeSource) {
      case "gps":
        return state.gps.point;
      case "manual":
        return state.manual;
      case "map":
        return state.map;
    }
  }, [state.activeSource, state.gps.point, state.manual, state.map]);

  const value = useMemo<LocationContextValue>(
    () => ({
      ...state,
      activePoint,
      refreshGpsLocation,
      returnToGpsLocation,
      selectManualLocation,
      selectMapLocation,
      activateMapLocation,
    }),
    [
      state,
      activePoint,
      refreshGpsLocation,
      returnToGpsLocation,
      selectManualLocation,
      selectMapLocation,
      activateMapLocation,
    ],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}
