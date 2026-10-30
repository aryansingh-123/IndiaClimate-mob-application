export const API = {
  forecastUrl: "https://api.open-meteo.com/v1/forecast",
  requestTimeoutMs: 15000,
  forecastDays: 7,
} as const;

// Variables requested from Open-Meteo. Visibility, UV index and dew point are
// hourly-only, so they are read at the current hour's index.
export const FORECAST_VARIABLES = {
  current: [
    "temperature_2m",
    "relative_humidity_2m",
    "apparent_temperature",
    "is_day",
    "precipitation",
    "weather_code",
    "cloud_cover",
    "pressure_msl",
    "wind_speed_10m",
    "wind_direction_10m",
    "wind_gusts_10m",
  ],
  hourly: [
    "temperature_2m",
    "precipitation_probability",
    "precipitation",
    "weather_code",
    "is_day",
    "uv_index",
    "visibility",
    "dew_point_2m",
  ],
  daily: [
    "weather_code",
    "temperature_2m_max",
    "temperature_2m_min",
    "sunrise",
    "sunset",
    "daylight_duration",
    "uv_index_max",
    "precipitation_probability_max",
  ],
} as const;
