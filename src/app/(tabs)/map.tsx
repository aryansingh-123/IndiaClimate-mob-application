import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { LocationWeatherCard } from "@/components/map/LocationWeatherCard";
import { MapControls } from "@/components/map/MapControls";
import { MapLayerSelector } from "@/components/map/MapLayerSelector";
import { WeatherMap, type MapFocus, type WeatherMapHandle } from "@/components/map/WeatherMap";
import { MAJOR_CITIES } from "@/constants/cities";
import { GPS_FOCUS_ZOOM, type MapLayerKey } from "@/constants/map";
import { useAppTheme } from "@/context/ThemeContext";
import { useLocation } from "@/hooks/useLocation";
import { useMapCityWeather, usePointWeather } from "@/hooks/useMapWeather";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { buildMapMarkers, type MarkerSource } from "@/utils/mapMarkers";
import type { GeoCoordinates, ResolvedPlace } from "@/types/location";
import { formatCoordinates, formatPlaceLabel, formatPointLabel } from "@/utils/formatters";

// What the bottom card is showing: a city marker, the manual city, or a tapped point.
type Selection = { kind: "city"; id: string } | { kind: "manual" } | { kind: "point" };

export default function MapScreen() {
  const { colors } = useAppTheme();
  const { gps, manual, map, selectManualLocation, selectMapLocation, activateMapLocation, refreshGpsLocation } =
    useLocation();
  const { online } = useNetworkStatus();

  const mapRef = useRef<WeatherMapHandle>(null);
  const focusNonce = useRef(0);
  const focusedOnGps = useRef(false);

  const [layer, setLayer] = useState<MapLayerKey>("temperature");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [focus, setFocus] = useState<MapFocus | null>(null);
  const [mapKey, setMapKey] = useState(0);
  const [mapFailed, setMapFailed] = useState(false);
  const [mapError, setMapError] = useState("");

  const cities = useMapCityWeather(manual?.coordinates.latitude ?? null, manual?.coordinates.longitude ?? null);
  const point = usePointWeather(map?.coordinates.latitude ?? null, map?.coordinates.longitude ?? null);

  const requestFocus = useCallback((coordinates: GeoCoordinates, zoom: number) => {
    focusNonce.current += 1;
    setFocus({ coordinates, zoom, nonce: focusNonce.current });
  }, []);

  // Fly to the first GPS fix once. Later fixes never move the map on their own.
  useEffect(() => {
    if (gps.point && !focusedOnGps.current) {
      focusedOnGps.current = true;
      requestFocus(gps.point.coordinates, GPS_FOCUS_ZOOM);
    }
  }, [gps.point, requestFocus]);

  const markerSources = useMemo<MarkerSource[]>(() => {
    const sources: MarkerSource[] = MAJOR_CITIES.map((city) => ({
      id: city.id,
      name: city.name,
      coordinates: city.coordinates,
      kind: "city",
    }));
    if (manual) {
      sources.push({ id: "manual", name: formatPointLabel(manual), coordinates: manual.coordinates, kind: "manual" });
    }
    return sources;
  }, [manual]);

  const markers = useMemo(
    () => buildMapMarkers(markerSources, cities.reports, layer),
    [markerSources, cities.reports, layer],
  );

  const selectedMarkerId = selection?.kind === "city" ? selection.id : selection?.kind === "manual" ? "manual" : null;

  const handleMarkerPress = useCallback((id: string) => {
    setSelection(id === "manual" ? { kind: "manual" } : { kind: "city", id });
  }, []);

  const handleTap = useCallback(
    (coordinates: GeoCoordinates) => {
      void selectMapLocation(coordinates);
      setSelection({ kind: "point" });
    },
    [selectMapLocation],
  );

  const handleLocate = () => {
    if (gps.point) {
      requestFocus(gps.point.coordinates, GPS_FOCUS_ZOOM);
    } else {
      void refreshGpsLocation();
    }
  };

  const handleRetryMap = () => {
    setMapFailed(false);
    setMapError("");
    setMapKey((key) => key + 1);
  };

  // Builds the card content for whatever is selected.
  const card = useMemo(() => {
    if (!selection) return null;

    if (selection.kind === "city") {
      const city = MAJOR_CITIES.find((item) => item.id === selection.id);
      if (!city) return null;
      return {
        title: city.name,
        subtitle: city.region,
        report: cities.reports.get(city.id) ?? null,
        loading: cities.status === "loading",
        failure: cities.failure,
        onRetry: cities.reload,
        onViewForecast: () => {
          const place: ResolvedPlace = {
            city: city.name,
            district: null,
            region: city.region,
            country: "India",
            countryCode: "IN",
          };
          selectManualLocation(city.coordinates, place);
          router.navigate("/");
        },
      };
    }

    if (selection.kind === "manual") {
      if (!manual) return null;
      return {
        title: formatPointLabel(manual),
        subtitle: "Your selected city",
        report: cities.reports.get("manual") ?? null,
        loading: cities.status === "loading",
        failure: cities.failure,
        onRetry: cities.reload,
        onViewForecast: () => {
          selectManualLocation(manual.coordinates, manual.place);
          router.navigate("/");
        },
      };
    }

    if (!map) return null;
    return {
      title: formatPlaceLabel(map.place) ?? formatCoordinates(map.coordinates),
      subtitle: "Tapped point on the map",
      report: point.report,
      loading: point.status === "loading",
      failure: point.failure,
      onRetry: point.reload,
      onViewForecast: () => {
        activateMapLocation();
        router.navigate("/");
      },
    };
  }, [selection, cities, manual, map, point, selectManualLocation, activateMapLocation]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={styles.screen}>
        {mapFailed ? (
          <View style={[styles.fallback, { backgroundColor: colors.background }]}>
            <Text style={[styles.fallbackTitle, { color: colors.textPrimary }]}>Map couldn't load</Text>
            <Text style={[styles.fallbackBody, { color: colors.textSecondary }]}>
              {online
                ? "The map didn't load. Check your connection and try again."
                : "The map needs an internet connection."}
            </Text>
            {mapError ? (
              <Text style={[styles.fallbackDetail, { color: colors.textSecondary }]}>Details: {mapError}</Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retry map"
              onPress={handleRetryMap}
              style={[styles.retry, { backgroundColor: colors.accent }]}
            >
              <Text style={[styles.retryLabel, { color: colors.textOnAccent }]}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <WeatherMap
            key={mapKey}
            ref={mapRef}
            markers={markers}
            selectedMarkerId={selectedMarkerId}
            gps={gps.point?.coordinates ?? null}
            point={map?.coordinates ?? null}
            focus={focus}
            onTap={handleTap}
            onMarkerPress={handleMarkerPress}
            onError={(detail) => {
              setMapError(detail);
              setMapFailed(true);
            }}
          />
        )}

        {!mapFailed ? (
          <View style={styles.topOverlay} pointerEvents="box-none">
            <MapLayerSelector value={layer} onChange={setLayer} />
            {cities.failure && cities.status !== "loading" ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retry weather for map markers"
                onPress={cities.reload}
                style={[styles.notice, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[styles.noticeText, { color: colors.textPrimary }]}>
                  {cities.isOffline
                    ? "Offline. Some marker weather may be missing."
                    : "Couldn't refresh marker weather. Tap to retry."}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {!mapFailed ? (
          <View style={styles.rightOverlay} pointerEvents="box-none">
            <MapControls
              onLocate={handleLocate}
              onZoomIn={() => mapRef.current?.zoomIn()}
              onZoomOut={() => mapRef.current?.zoomOut()}
              onSearch={() => router.push("/city/search")}
            />
          </View>
        ) : null}

        {card ? (
          <View style={styles.bottomOverlay} pointerEvents="box-none">
            <LocationWeatherCard
              title={card.title}
              subtitle={card.subtitle}
              report={card.report}
              loading={card.loading}
              failure={card.failure}
              onRetry={card.onRetry}
              onClose={() => setSelection(null)}
              onViewForecast={card.onViewForecast}
            />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topOverlay: {
    position: "absolute",
    top: 8,
    left: 0,
    right: 0,
    gap: 8,
  },
  rightOverlay: {
    position: "absolute",
    right: 12,
    top: 110,
  },
  bottomOverlay: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
  },
  notice: {
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  noticeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 10,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  fallbackBody: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  fallbackDetail: {
    fontSize: 12,
    textAlign: "center",
  },
  retry: {
    marginTop: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
});
