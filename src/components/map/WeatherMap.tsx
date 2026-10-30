import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { Linking, StyleSheet } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { useAppTheme } from "@/context/ThemeContext";
import { buildMapHtml } from "@/components/map/mapHtml";
import type { GeoCoordinates } from "@/types/location";
import type { MapMarker } from "@/types/map";

export type WeatherMapHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
};

export type MapFocus = {
  coordinates: GeoCoordinates;
  zoom: number;
  // A new nonce asks the map to fly to the coordinates. Equal nonces are ignored.
  nonce: number;
};

type WeatherMapProps = {
  markers: MapMarker[];
  selectedMarkerId: string | null;
  gps: GeoCoordinates | null;
  point: GeoCoordinates | null;
  focus: MapFocus | null;
  onTap: (coordinates: GeoCoordinates) => void;
  onMarkerPress: (id: string) => void;
  // detail explains why the map failed, for the error message and logs.
  onError: (detail: string) => void;
};

// Without a "ready" message in this time, the map is treated as failed.
const START_TIMEOUT_MS = 15000;

// The map page and its data are pushed in as JSON. Events come back as messages.
type PageMessage =
  | { type: "ready" }
  | { type: "error"; detail?: string }
  | { type: "log"; message: string }
  | { type: "tap"; latitude: number; longitude: number }
  | { type: "marker"; id: string };

function isPageMessage(value: unknown): value is PageMessage {
  if (typeof value !== "object" || value === null) return false;
  const type = (value as { type?: unknown }).type;
  return type === "ready" || type === "error" || type === "log" || type === "tap" || type === "marker";
}

export const WeatherMap = forwardRef<WeatherMapHandle, WeatherMapProps>(function WeatherMap(
  { markers, selectedMarkerId, gps, point, focus, onTap, onMarkerPress, onError },
  ref,
) {
  const { colors } = useAppTheme();
  const webRef = useRef<InstanceType<typeof WebView> | null>(null);
  const readyRef = useRef(false);
  const html = useMemo(() => buildMapHtml(), []);

  // The start timer runs once per mount, so it reads the latest callback through a ref.
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!readyRef.current) onErrorRef.current("The map did not start within 15 seconds.");
    }, START_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  const payload = useMemo(
    () =>
      JSON.stringify({
        markers: markers.map((marker) => ({
          id: marker.id,
          name: marker.name,
          latitude: marker.coordinates.latitude,
          longitude: marker.coordinates.longitude,
          label: marker.label,
          icon: marker.icon,
        })),
        selectedId: selectedMarkerId,
        gps,
        point,
        focus,
      }),
    [markers, selectedMarkerId, gps, point, focus],
  );

  const payloadRef = useRef(payload);
  payloadRef.current = payload;

  const pushState = () => {
    webRef.current?.injectJavaScript(`window.setState(${payloadRef.current}); true;`);
  };

  // Push again whenever the data changes after the page is ready.
  useEffect(() => {
    if (readyRef.current) pushState();
  }, [payload]);

  useImperativeHandle(ref, () => ({
    zoomIn: () => webRef.current?.injectJavaScript(`window.command({name:"zoomIn"}); true;`),
    zoomOut: () => webRef.current?.injectJavaScript(`window.command({name:"zoomOut"}); true;`),
  }));

  const handleMessage = (event: WebViewMessageEvent) => {
    let message: unknown;
    try {
      message = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (!isPageMessage(message)) return;

    switch (message.type) {
      case "ready":
        readyRef.current = true;
        pushState();
        break;
      case "error":
        onError(message.detail ?? "The map page reported an error.");
        break;
      case "log":
        console.warn("[map]", message.message);
        break;
      case "tap":
        onTap({ latitude: message.latitude, longitude: message.longitude });
        break;
      case "marker":
        onMarkerPress(message.id);
        break;
    }
  };

  return (
    <WebView
      ref={(instance) => {
        webRef.current = instance;
      }}
      source={{ html }}
      originWhitelist={["*"]}
      javaScriptEnabled
      domStorageEnabled={false}
      allowFileAccess={false}
      setSupportMultipleWindows={false}
      // OpenStreetMap asks for an identifiable user agent for tile requests.
      userAgent="IndiaClimate/1.0 (Android; react-native-webview)"
      onMessage={handleMessage}
      onError={(event) => onError(event.nativeEvent.description || "The map view failed to load.")}
      onShouldStartLoadWithRequest={(request) => {
        // Only the user tapping a link (for example the attribution link) leaves
        // the page, and those open in the browser. The page itself always loads.
        if (request.navigationType === "click" && !request.url.startsWith("about:")) {
          void Linking.openURL(request.url);
          return false;
        }
        return true;
      }}
      style={[styles.map, { backgroundColor: colors.background }]}
    />
  );
});

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
