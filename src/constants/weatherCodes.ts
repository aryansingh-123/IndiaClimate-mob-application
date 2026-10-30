import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSun,
  Moon,
  Snowflake,
  Sun,
  type LucideIcon,
} from "lucide-react-native";

import type { WeatherGradientKey } from "@/constants/colors";

// WMO weather interpretation codes, as used by Open-Meteo.
// https://open-meteo.com/en/docs (weather_code)
export type WeatherDescriptor = {
  label: string;
  dayIcon: LucideIcon;
  nightIcon: LucideIcon;
  category: WeatherCategory;
};

export type WeatherCategory = WeatherGradientKey | "snow";

const DESCRIPTORS: Record<number, WeatherDescriptor> = {
  0: { label: "Clear sky", dayIcon: Sun, nightIcon: Moon, category: "sunny" },
  1: { label: "Mainly clear", dayIcon: Sun, nightIcon: Moon, category: "sunny" },
  2: { label: "Partly cloudy", dayIcon: CloudSun, nightIcon: CloudMoon, category: "cloudy" },
  3: { label: "Overcast", dayIcon: Cloud, nightIcon: Cloud, category: "cloudy" },
  45: { label: "Fog", dayIcon: CloudFog, nightIcon: CloudFog, category: "cloudy" },
  48: { label: "Rime fog", dayIcon: CloudFog, nightIcon: CloudFog, category: "cloudy" },
  51: { label: "Light drizzle", dayIcon: CloudDrizzle, nightIcon: CloudDrizzle, category: "rainy" },
  53: { label: "Drizzle", dayIcon: CloudDrizzle, nightIcon: CloudDrizzle, category: "rainy" },
  55: { label: "Heavy drizzle", dayIcon: CloudDrizzle, nightIcon: CloudDrizzle, category: "rainy" },
  56: { label: "Freezing drizzle", dayIcon: CloudDrizzle, nightIcon: CloudDrizzle, category: "rainy" },
  57: { label: "Freezing drizzle", dayIcon: CloudDrizzle, nightIcon: CloudDrizzle, category: "rainy" },
  61: { label: "Light rain", dayIcon: CloudRain, nightIcon: CloudRain, category: "rainy" },
  63: { label: "Rain", dayIcon: CloudRain, nightIcon: CloudRain, category: "rainy" },
  65: { label: "Heavy rain", dayIcon: CloudRain, nightIcon: CloudRain, category: "rainy" },
  66: { label: "Freezing rain", dayIcon: CloudRain, nightIcon: CloudRain, category: "rainy" },
  67: { label: "Freezing rain", dayIcon: CloudRain, nightIcon: CloudRain, category: "rainy" },
  71: { label: "Light snow", dayIcon: Snowflake, nightIcon: Snowflake, category: "snow" },
  73: { label: "Snow", dayIcon: Snowflake, nightIcon: Snowflake, category: "snow" },
  75: { label: "Heavy snow", dayIcon: Snowflake, nightIcon: Snowflake, category: "snow" },
  77: { label: "Snow grains", dayIcon: Snowflake, nightIcon: Snowflake, category: "snow" },
  80: { label: "Rain showers", dayIcon: CloudRain, nightIcon: CloudRain, category: "rainy" },
  81: { label: "Rain showers", dayIcon: CloudRain, nightIcon: CloudRain, category: "rainy" },
  82: { label: "Violent showers", dayIcon: CloudRain, nightIcon: CloudRain, category: "rainy" },
  85: { label: "Snow showers", dayIcon: Snowflake, nightIcon: Snowflake, category: "snow" },
  86: { label: "Heavy snow showers", dayIcon: Snowflake, nightIcon: Snowflake, category: "snow" },
  95: { label: "Thunderstorm", dayIcon: CloudLightning, nightIcon: CloudLightning, category: "thunderstorm" },
  96: { label: "Thunderstorm with hail", dayIcon: CloudLightning, nightIcon: CloudLightning, category: "thunderstorm" },
  99: { label: "Severe thunderstorm", dayIcon: CloudLightning, nightIcon: CloudLightning, category: "thunderstorm" },
};

const UNKNOWN_DESCRIPTOR: WeatherDescriptor = {
  label: "Conditions unavailable",
  dayIcon: Cloud,
  nightIcon: Cloud,
  category: "cloudy",
};

export function describeWeatherCode(code: number | null): WeatherDescriptor {
  if (code === null) return UNKNOWN_DESCRIPTOR;
  return DESCRIPTORS[code] ?? UNKNOWN_DESCRIPTOR;
}

export function getWeatherIcon(code: number | null, isDay: boolean): LucideIcon {
  const descriptor = describeWeatherCode(code);
  return isDay ? descriptor.dayIcon : descriptor.nightIcon;
}

// Background category: at night, clear and cloudy skies use the night theme.
// Rain and storms keep their own look.
export function getBackgroundCategory(code: number | null, isDay: boolean): WeatherGradientKey {
  const category = describeWeatherCode(code).category;
  if (category === "snow") return "cloudy";
  if (!isDay && (category === "sunny" || category === "cloudy")) return "night";
  return category;
}

export function getUvLabel(uvIndex: number | null): string {
  if (uvIndex === null) return "Unavailable";
  if (uvIndex < 3) return "Low";
  if (uvIndex < 6) return "Moderate";
  if (uvIndex < 8) return "High";
  if (uvIndex < 11) return "Very high";
  return "Extreme";
}
