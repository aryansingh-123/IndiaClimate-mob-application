import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { useLocation } from "@/hooks/useLocation";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { isApiError, type ApiErrorCode } from "@/services/http";
import type { DataOrigin, LoadOptions, Loaded } from "@/services/dataRepository";
import type { GeoCoordinates } from "@/types/location";

export type DataStatus = "idle" | "loading" | "ready" | "error";

export type Loader<T> = (coordinates: GeoCoordinates, options: LoadOptions) => Promise<Loaded<T>>;

// Runs a loader for the active location. The result is kept only for the
// location it was requested for, so the previous place's data never shows
// under the new one. GPS requests key off the GPS revision, so jitter does not
// trigger a request.
// staleAfterMs: when the app returns to the foreground and the data is older than
// this, the data is reloaded (the loader still prefers a fresh cache entry).
export function useLocationData<T>(loader: Loader<T>, staleAfterMs: number) {
  const { activePoint, activeSource, gps } = useLocation();
  const { online } = useNetworkStatus();

  const [loaded, setLoaded] = useState<{ key: string; value: Loaded<T> } | null>(null);
  const [status, setStatus] = useState<DataStatus>("idle");
  const [errorCode, setErrorCode] = useState<ApiErrorCode | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const loaderRef = useRef(loader);
  const latestPoint = useRef(activePoint);
  const onlineRef = useRef(online);
  const forceNext = useRef(false);

  useEffect(() => {
    loaderRef.current = loader;
    latestPoint.current = activePoint;
    onlineRef.current = online;
  }, [loader, activePoint, online]);

  const requestKey = activePoint
    ? activeSource === "gps"
      ? `gps:${gps.revision}`
      : `${activeSource}:${activePoint.coordinates.latitude}:${activePoint.coordinates.longitude}`
    : null;

  useEffect(() => {
    const point = latestPoint.current;
    if (requestKey === null || !point) {
      setStatus("idle");
      return;
    }

    const controller = new AbortController();
    const force = forceNext.current;
    forceNext.current = false;
    setStatus("loading");

    loaderRef.current(point.coordinates, { force, online: onlineRef.current, signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        setLoaded({ key: requestKey, value: result });
        setErrorCode(result.failure);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        // A cancelled request is stale, so its outcome is dropped.
        if (controller.signal.aborted) return;
        setErrorCode(isApiError(error) ? error.code : "invalid-data");
        setStatus("error");
      });

    return () => controller.abort();
  }, [requestKey, reloadToken]);

  // Retry automatically when the device comes back online after a network failure.
  const wasOnline = useRef(online);
  useEffect(() => {
    if (!wasOnline.current && online && errorCode === "network") {
      forceNext.current = false;
      setReloadToken((token) => token + 1);
    }
    wasOnline.current = online;
  }, [online, errorCode]);

  // Explicit reload (pull to refresh, retry button) bypasses the cache.
  const reload = useCallback(() => {
    forceNext.current = true;
    setReloadToken((token) => token + 1);
  }, []);

  const current = loaded && loaded.key === requestKey ? loaded.value : null;
  const failure = status === "error" ? errorCode : (current?.failure ?? null);

  // Resume check: reload data that has gone stale while the app was in the background.
  const savedAtRef = useRef<number | null>(null);
  useEffect(() => {
    savedAtRef.current = current?.savedAt ?? null;
  }, [current?.savedAt]);

  const keyRef = useRef<string | null>(null);
  useEffect(() => {
    keyRef.current = requestKey;
  }, [requestKey]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active" || keyRef.current === null) return;
      const savedAt = savedAtRef.current;
      if (savedAt === null || Date.now() - savedAt > staleAfterMs) {
        setReloadToken((token) => token + 1);
      }
    });
    return () => subscription.remove();
  }, [staleAfterMs]);

  return {
    data: current?.payload ?? null,
    savedAt: current?.savedAt ?? null,
    origin: (current?.origin ?? null) as DataOrigin | null,
    failure,
    status,
    isOffline: !online,
    reload,
  };
}
