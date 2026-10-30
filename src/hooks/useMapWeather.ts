import { useEffect, useMemo, useRef, useState, useCallback } from "react";

import { MAJOR_CITIES } from "@/constants/cities";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { loadMapForecasts, type MapPoint } from "@/services/dataRepository";
import { isApiError, type ApiErrorCode } from "@/services/http";
import type { WeatherReport } from "@/types/weather";
import { buildWeatherReport } from "@/utils/weatherMapper";

type MapDataState = {
  status: "idle" | "loading" | "ready" | "error";
  reports: Map<string, WeatherReport>;
  failure: ApiErrorCode | null;
};

// Loads reports for a list of map points. The list is keyed by its coordinates,
// so the request runs only when the points change or a reload is asked for.
function useMapLoader(points: MapPoint[]) {
  const { online } = useNetworkStatus();
  const [state, setState] = useState<MapDataState>({ status: "idle", reports: new Map(), failure: null });
  const [reloadToken, setReloadToken] = useState(0);
  const forceNext = useRef(false);
  const pointsRef = useRef(points);
  const onlineRef = useRef(online);

  const pointsKey = points
    .map((point) => `${point.id}@${point.coordinates.latitude},${point.coordinates.longitude}`)
    .join("|");

  useEffect(() => {
    pointsRef.current = points;
    onlineRef.current = online;
  }, [points, online]);

  useEffect(() => {
    const current = pointsRef.current;
    if (current.length === 0) {
      setState({ status: "idle", reports: new Map(), failure: null });
      return;
    }

    const controller = new AbortController();
    const force = forceNext.current;
    forceNext.current = false;
    setState((previous) => ({ ...previous, status: "loading" }));

    loadMapForecasts(current, { force, online: onlineRef.current, signal: controller.signal })
      .then((loaded) => {
        if (controller.signal.aborted) return;
        const reports = new Map<string, WeatherReport>();
        let failure: ApiErrorCode | null = null;
        loaded.forEach((value, id) => {
          try {
            reports.set(id, buildWeatherReport(value.payload, value.savedAt));
            failure = failure ?? value.failure;
          } catch {
            // A malformed point is left out, so it shows as unavailable.
          }
        });
        setState({ status: "ready", reports, failure });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          reports: new Map(),
          failure: isApiError(error) ? error.code : "invalid-data",
        });
      });

    return () => controller.abort();
  }, [pointsKey, reloadToken]);

  // Re-fetch when the connection returns after a failed or stale load.
  const wasOnline = useRef(online);
  useEffect(() => {
    if (!wasOnline.current && online && state.failure === "network") {
      setReloadToken((token) => token + 1);
    }
    wasOnline.current = online;
  }, [online, state.failure]);

  const reload = useCallback(() => {
    forceNext.current = true;
    setReloadToken((token) => token + 1);
  }, []);

  return { ...state, isOffline: !online, reload };
}

// Weather for the major cities, plus the manually selected city when there is one.
export function useMapCityWeather(manualLatitude: number | null, manualLongitude: number | null) {
  const points = useMemo<MapPoint[]>(() => {
    const cities = MAJOR_CITIES.map((city) => ({ id: city.id, coordinates: city.coordinates }));
    if (manualLatitude === null || manualLongitude === null) return cities;
    return [...cities, { id: "manual", coordinates: { latitude: manualLatitude, longitude: manualLongitude } }];
  }, [manualLatitude, manualLongitude]);

  return useMapLoader(points);
}

// Weather for a single tapped point.
export function usePointWeather(latitude: number | null, longitude: number | null) {
  const points = useMemo<MapPoint[]>(() => {
    if (latitude === null || longitude === null) return [];
    return [{ id: "tap", coordinates: { latitude, longitude } }];
  }, [latitude, longitude]);

  const loader = useMapLoader(points);
  return { ...loader, report: loader.reports.get("tap") ?? null };
}
