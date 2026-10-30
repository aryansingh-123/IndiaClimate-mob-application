import type { MapLayerKey } from "@/constants/map";
import { describeWeatherCode } from "@/constants/weatherCodes";
import type { GeoCoordinates } from "@/types/location";
import type { MapMarker, MarkerIconKey, MarkerKind } from "@/types/map";
import type { WeatherReport } from "@/types/weather";
import { formatNumber } from "@/utils/formatters";

export function markerIconFor(code: number | null, isDay: boolean): MarkerIconKey {
  switch (describeWeatherCode(code).category) {
    case "sunny":
      return isDay ? "sun" : "moon";
    case "rainy":
      return "rain";
    case "thunderstorm":
      return "storm";
    case "snow":
      return "snow";
    default:
      return "cloud";
  }
}

// The value a marker shows for the active layer. Each layer reads real data.
export function layerValueLabel(report: WeatherReport, layer: MapLayerKey): string {
  const current = report.current;
  switch (layer) {
    case "precipitation":
      return current.precipitation === null ? "--" : `${formatNumber(current.precipitation, 1)} mm`;
    case "cloud":
      return `${formatNumber(current.cloudCover)}%`;
    case "wind":
      return `${formatNumber(current.windSpeed)} km/h`;
    default:
      return `${formatNumber(current.temperature)}°`;
  }
}

export type MarkerSource = {
  id: string;
  name: string;
  coordinates: GeoCoordinates;
  kind: MarkerKind;
};

export function buildMapMarkers(
  sources: MarkerSource[],
  reports: Map<string, WeatherReport>,
  layer: MapLayerKey,
): MapMarker[] {
  return sources.map((source) => {
    const report = reports.get(source.id) ?? null;
    return {
      id: source.id,
      name: source.name,
      coordinates: source.coordinates,
      kind: source.kind,
      label: report ? layerValueLabel(report, layer) : "--",
      icon: report ? markerIconFor(report.current.weatherCode, report.current.isDay) : "cloud",
    };
  });
}
