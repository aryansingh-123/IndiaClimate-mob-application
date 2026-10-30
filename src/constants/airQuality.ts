import type { AqiCategory } from "@/types/airQuality";

// US EPA AQI breakpoints, as provided by Open-Meteo's us_aqi.
// This is NOT India's CPCB AQI, and the UI labels it as US AQI.
export const AQI_CATEGORIES: readonly (AqiCategory & { max: number })[] = [
  {
    key: "good",
    label: "Good",
    color: "#2E9E4F",
    max: 50,
    advice: "Air quality is satisfactory. Outdoor activities are fine.",
  },
  {
    key: "moderate",
    label: "Moderate",
    color: "#D9A400",
    max: 100,
    advice: "Acceptable. People who are unusually sensitive to air pollution should limit long outdoor exertion.",
  },
  {
    key: "unhealthy-sensitive",
    label: "Unhealthy for sensitive groups",
    color: "#F07A1E",
    max: 150,
    advice: "Children, older adults, and people with asthma or heart disease should reduce long outdoor exertion.",
  },
  {
    key: "unhealthy",
    label: "Unhealthy",
    color: "#D64545",
    max: 200,
    advice: "Everyone may start to feel effects. Limit outdoor exertion, especially for sensitive groups.",
  },
  {
    key: "very-unhealthy",
    label: "Very unhealthy",
    color: "#8E44AD",
    max: 300,
    advice: "Health alert: everyone may feel more serious effects. Avoid outdoor exertion.",
  },
  {
    key: "hazardous",
    label: "Hazardous",
    color: "#7E0023",
    max: Number.POSITIVE_INFINITY,
    advice: "Emergency conditions. Everyone should avoid outdoor activity.",
  },
];

export const AQI_SCALE_MAX = 300;
