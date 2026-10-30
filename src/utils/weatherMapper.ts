import type {
  CurrentConditions,
  DailyPoint,
  HourlyPoint,
  OpenMeteoForecastResponse,
  SunTimes,
  WeatherReport,
} from "@/types/weather";

const HOURS_SHOWN = 24;

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function valueAt<T>(values: (T | null | undefined)[] | undefined, index: number): T | null {
  return values?.[index] ?? null;
}

// Open-Meteo returns local times without an offset, e.g. "2026-10-30T14:00".
// Matching on the first 13 characters (date + hour) avoids device timezone issues.
function findHourIndex(times: string[], currentTime: string): number {
  const key = currentTime.slice(0, 13);
  const index = times.findIndex((time) => time.slice(0, 13) === key);
  return index >= 0 ? index : 0;
}

// Maps the raw payload onto the UI model. Missing values become null, never a
// guessed number.
export function buildWeatherReport(raw: OpenMeteoForecastResponse, fetchedAt: number): WeatherReport {
  const rawCurrent = raw.current;
  const hourly = raw.hourly;
  const daily = raw.daily;
  if (!rawCurrent || !hourly || !daily) {
    throw new Error("Forecast response is missing required blocks");
  }

  const hourIndex = findHourIndex(hourly.time, rawCurrent.time);

  const current: CurrentConditions = {
    time: rawCurrent.time,
    weatherCode: numberOrNull(rawCurrent.weather_code),
    isDay: numberOrNull(rawCurrent.is_day) === 1,
    temperature: numberOrNull(rawCurrent.temperature_2m),
    feelsLike: numberOrNull(rawCurrent.apparent_temperature),
    humidity: numberOrNull(rawCurrent.relative_humidity_2m),
    precipitation: numberOrNull(rawCurrent.precipitation),
    cloudCover: numberOrNull(rawCurrent.cloud_cover),
    pressure: numberOrNull(rawCurrent.pressure_msl),
    windSpeed: numberOrNull(rawCurrent.wind_speed_10m),
    windDirection: numberOrNull(rawCurrent.wind_direction_10m),
    windGusts: numberOrNull(rawCurrent.wind_gusts_10m),
    uvIndex: numberOrNull(valueAt(hourly.uv_index, hourIndex)),
    visibilityMeters: numberOrNull(valueAt(hourly.visibility, hourIndex)),
    dewPoint: numberOrNull(valueAt(hourly.dew_point_2m, hourIndex)),
    rainChance: numberOrNull(valueAt(hourly.precipitation_probability, hourIndex)),
  };

  const hourlyPoints: HourlyPoint[] = hourly.time
    .slice(hourIndex, hourIndex + HOURS_SHOWN)
    .map((time, offset) => {
      const index = hourIndex + offset;
      return {
        time,
        weatherCode: numberOrNull(valueAt(hourly.weather_code, index)),
        isDay: numberOrNull(valueAt(hourly.is_day, index)) === 1,
        temperature: numberOrNull(valueAt(hourly.temperature_2m, index)),
        rainChance: numberOrNull(valueAt(hourly.precipitation_probability, index)),
      };
    });

  const dailyPoints: DailyPoint[] = daily.time.map((date, index) => ({
    date,
    weatherCode: numberOrNull(valueAt(daily.weather_code, index)),
    maxTemp: numberOrNull(valueAt(daily.temperature_2m_max, index)),
    minTemp: numberOrNull(valueAt(daily.temperature_2m_min, index)),
    rainChance: numberOrNull(valueAt(daily.precipitation_probability_max, index)),
    uvIndexMax: numberOrNull(valueAt(daily.uv_index_max, index)),
  }));

  const sun: SunTimes = {
    sunrise: localClock(valueAt(daily.sunrise, 0)),
    sunset: localClock(valueAt(daily.sunset, 0)),
    daylightSeconds: numberOrNull(valueAt(daily.daylight_duration, 0)),
  };

  return {
    fetchedAt,
    timezone: raw.timezone ?? null,
    current,
    hourly: hourlyPoints,
    daily: dailyPoints,
    sun,
  };
}

// "2026-10-30T06:12" -> "06:12". Returns null for missing or malformed values.
function localClock(isoLocal: string | null): string | null {
  if (!isoLocal || isoLocal.length < 16) return null;
  return isoLocal.slice(11, 16);
}

// Minutes since local midnight. Used for the sun-position arc.
export function minutesOfDay(clock: string | null): number | null {
  if (!clock || !/^\d{2}:\d{2}$/.test(clock)) return null;
  const [hours, minutes] = clock.split(":").map(Number);
  return hours * 60 + minutes;
}
