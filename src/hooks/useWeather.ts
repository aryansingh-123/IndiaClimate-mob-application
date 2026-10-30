import { useLocationData, type Loader } from "@/hooks/useLocationData";
import { FRESHNESS_MS, loadForecast } from "@/services/dataRepository";
import { buildWeatherReport } from "@/utils/weatherMapper";
import type { WeatherReport } from "@/types/weather";

// Maps the cached raw forecast into the UI model. `savedAt` is the time the data
// was fetched, so "Updated" never shows a cache hit as a new fetch.
const loadWeatherReport: Loader<WeatherReport> = async (coordinates, options) => {
  const loaded = await loadForecast(coordinates, options);
  return {
    ...loaded,
    payload: buildWeatherReport(loaded.payload, loaded.savedAt),
  };
};

export function useWeather() {
  const { data, savedAt, origin, failure, status, isOffline, reload } = useLocationData(loadWeatherReport, FRESHNESS_MS.forecast);
  return { report: data, savedAt, origin, failure, status, isOffline, reload };
}
