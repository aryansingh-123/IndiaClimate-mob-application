// Raw Open-Meteo air-quality payload (hourly block). Values can be null.
export type OpenMeteoAirQualityResponse = {
  timezone?: string;
  utc_offset_seconds?: number;
  hourly: {
    time: string[];
    us_aqi?: (number | null)[];
    pm2_5?: (number | null)[];
    pm10?: (number | null)[];
    nitrogen_dioxide?: (number | null)[];
    ozone?: (number | null)[];
    carbon_monoxide?: (number | null)[];
    sulphur_dioxide?: (number | null)[];
  };
};

export type AqiCategoryKey =
  | "good"
  | "moderate"
  | "unhealthy-sensitive"
  | "unhealthy"
  | "very-unhealthy"
  | "hazardous";

export type AqiCategory = {
  key: AqiCategoryKey;
  label: string;
  color: string;
  advice: string;
};

export type AirQualityReport = {
  // Local hour the readings belong to, e.g. "2026-10-30T14".
  hour: string;
  usAqi: number | null;
  category: AqiCategory | null;
  pm25: number | null;
  pm10: number | null;
  no2: number | null;
  o3: number | null;
  co: number | null;
  so2: number | null;
};
