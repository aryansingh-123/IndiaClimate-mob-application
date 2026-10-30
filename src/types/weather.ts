// Raw Open-Meteo forecast payload. Every value can be null, because the API
// returns null for missing data points.
type Nullable<T> = T | null;

export type OpenMeteoCurrent = {
  time: string;
  temperature_2m?: Nullable<number>;
  relative_humidity_2m?: Nullable<number>;
  apparent_temperature?: Nullable<number>;
  is_day?: Nullable<number>;
  precipitation?: Nullable<number>;
  weather_code?: Nullable<number>;
  cloud_cover?: Nullable<number>;
  pressure_msl?: Nullable<number>;
  wind_speed_10m?: Nullable<number>;
  wind_direction_10m?: Nullable<number>;
  wind_gusts_10m?: Nullable<number>;
};

export type OpenMeteoHourly = {
  time: string[];
  temperature_2m?: Nullable<number>[];
  precipitation_probability?: Nullable<number>[];
  precipitation?: Nullable<number>[];
  weather_code?: Nullable<number>[];
  is_day?: Nullable<number>[];
  uv_index?: Nullable<number>[];
  visibility?: Nullable<number>[];
  dew_point_2m?: Nullable<number>[];
};

export type OpenMeteoDaily = {
  time: string[];
  weather_code?: Nullable<number>[];
  temperature_2m_max?: Nullable<number>[];
  temperature_2m_min?: Nullable<number>[];
  sunrise?: Nullable<string>[];
  sunset?: Nullable<string>[];
  daylight_duration?: Nullable<number>[];
  uv_index_max?: Nullable<number>[];
  precipitation_probability_max?: Nullable<number>[];
};

export type OpenMeteoForecastResponse = {
  timezone?: string;
  utc_offset_seconds?: number;
  current?: OpenMeteoCurrent;
  hourly?: OpenMeteoHourly;
  daily?: OpenMeteoDaily;
};

// Normalized UI model. Missing API values stay null. The UI shows "--" for them
// and never invents a number.
export type CurrentConditions = {
  // Local time at the location, e.g. "2026-10-30T14:15" (timezone=auto).
  time: string;
  weatherCode: number | null;
  isDay: boolean;
  temperature: number | null;
  feelsLike: number | null;
  humidity: number | null;
  precipitation: number | null;
  cloudCover: number | null;
  pressure: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  windGusts: number | null;
  uvIndex: number | null;
  visibilityMeters: number | null;
  dewPoint: number | null;
  rainChance: number | null;
};

export type HourlyPoint = {
  time: string;
  weatherCode: number | null;
  isDay: boolean;
  temperature: number | null;
  rainChance: number | null;
};

export type DailyPoint = {
  date: string;
  weatherCode: number | null;
  maxTemp: number | null;
  minTemp: number | null;
  rainChance: number | null;
  uvIndexMax: number | null;
};

export type SunTimes = {
  // "HH:MM" in the location's local time, or null when unavailable.
  sunrise: string | null;
  sunset: string | null;
  daylightSeconds: number | null;
};

export type WeatherReport = {
  fetchedAt: number;
  timezone: string | null;
  current: CurrentConditions;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  sun: SunTimes;
};
