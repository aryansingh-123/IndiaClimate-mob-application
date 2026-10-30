// Brand palette: saffron (sun), India green (chakra accent), deep navy (sky).
export const brandPalette = {
  saffron: "#F28C28",
  saffronBright: "#FFA94D",
  indiaGreen: "#138808",
  navy: "#0B2545",
  navyDeep: "#06121F",
  skyBlue: "#4FA3E0",
  cloudWhite: "#F5FAFF",
  slate: "#5B6E86",
  slateLight: "#93A8C2",
} as const;

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textOnAccent: string;
  accent: string;
  accentSoft: string;
  success: string;
  warning: string;
  danger: string;
  tabBar: string;
  tabIndicator: string;
  shadow: string;
};

export const lightColors: ThemeColors = {
  background: "#F3F7FB",
  surface: "#FFFFFF",
  surfaceMuted: "#EAF1F8",
  border: "#D8E3EE",
  textPrimary: brandPalette.navy,
  textSecondary: brandPalette.slate,
  textOnAccent: brandPalette.navy,
  accent: brandPalette.saffron,
  accentSoft: "rgba(242, 140, 40, 0.14)",
  success: brandPalette.indiaGreen,
  warning: "#D99A00",
  danger: "#D64545",
  tabBar: "#FFFFFF",
  tabIndicator: "rgba(242, 140, 40, 0.16)",
  shadow: brandPalette.navy,
};

export const darkColors: ThemeColors = {
  background: brandPalette.navyDeep,
  surface: "#0F1F33",
  surfaceMuted: "#162B45",
  border: "#1F3A5A",
  textPrimary: "#EEF4FB",
  textSecondary: brandPalette.slateLight,
  textOnAccent: brandPalette.navy,
  accent: brandPalette.saffronBright,
  accentSoft: "rgba(255, 169, 77, 0.16)",
  success: "#4CAF50",
  warning: "#FFC94D",
  danger: "#FF6B6B",
  tabBar: "#0F1F33",
  tabIndicator: "rgba(255, 169, 77, 0.18)",
  shadow: "#000000",
};

// Gradient stops for dynamic weather backgrounds (used from Phase 3 onward).
export const weatherGradients = {
  sunny: ["#FFD26F", "#FF9A3D"],
  cloudy: ["#8FA6BD", "#5C7590"],
  rainy: ["#1E3A5F", "#0B2038"],
  thunderstorm: ["#2A2F3A", "#0D0F14"],
  night: ["#14274E", "#070F24"],
} as const;

export type WeatherGradientKey = keyof typeof weatherGradients;
