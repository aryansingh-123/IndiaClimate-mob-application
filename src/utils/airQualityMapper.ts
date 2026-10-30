import { AQI_CATEGORIES } from "@/constants/airQuality";
import type { AirQualityReport, AqiCategory, OpenMeteoAirQualityResponse } from "@/types/airQuality";

const MS_PER_SECOND = 1000;

export function categoryForAqi(aqi: number | null): AqiCategory | null {
  if (aqi === null) return null;
  const match = AQI_CATEGORIES.find((category) => aqi <= category.max);
  if (!match) return null;
  const { max: _max, ...category } = match;
  return category;
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

// Picks the reading for the location's current local hour. The payload times are
// local, so the local hour is derived from utc_offset_seconds, not the device clock.
export function buildAirQualityReport(raw: OpenMeteoAirQualityResponse, now: number): AirQualityReport | null {
  const offsetMs = (raw.utc_offset_seconds ?? 0) * MS_PER_SECOND;
  const localHour = new Date(now + offsetMs).toISOString().slice(0, 13);
  const index = raw.hourly.time.findIndex((time) => time.slice(0, 13) === localHour);
  if (index < 0) return null;

  const at = (values?: (number | null)[]) => numberOrNull(values?.[index]);
  const usAqi = at(raw.hourly.us_aqi);

  return {
    hour: localHour,
    usAqi,
    category: categoryForAqi(usAqi),
    pm25: at(raw.hourly.pm2_5),
    pm10: at(raw.hourly.pm10),
    no2: at(raw.hourly.nitrogen_dioxide),
    o3: at(raw.hourly.ozone),
    co: at(raw.hourly.carbon_monoxide),
    so2: at(raw.hourly.sulphur_dioxide),
  };
}
