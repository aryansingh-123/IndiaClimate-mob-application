import { useLocationData, type Loader } from "@/hooks/useLocationData";
import { FRESHNESS_MS, loadAirQuality } from "@/services/dataRepository";
import type { AirQualityReport } from "@/types/airQuality";
import { buildAirQualityReport } from "@/utils/airQualityMapper";

// A null report means the payload had no reading for the current local hour.
const loadAirReport: Loader<AirQualityReport | null> = async (coordinates, options) => {
  const loaded = await loadAirQuality(coordinates, options);
  return {
    ...loaded,
    payload: buildAirQualityReport(loaded.payload, Date.now()),
  };
};

export function useAirQuality() {
  const { data, savedAt, origin, failure, status, isOffline, reload } = useLocationData(loadAirReport, FRESHNESS_MS.airQuality);
  return { air: data, savedAt, origin, failure, status, isOffline, reload };
}
