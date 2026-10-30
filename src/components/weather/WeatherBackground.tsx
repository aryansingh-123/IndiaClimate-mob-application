import type { PropsWithChildren } from "react";
import { StyleSheet, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn } from "react-native-reanimated";

import { brandPalette, weatherGradients, type WeatherGradientKey } from "@/constants/colors";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type WeatherBackgroundProps = PropsWithChildren<{
  category: WeatherGradientKey;
  style?: ViewStyle;
}>;

// The gradient cross-fades when the category changes. Keying the view on the
// category remounts it, so the new gradient fades in.
export function WeatherBackground({ category, style, children }: WeatherBackgroundProps) {
  const [start, end] = weatherGradients[category];
  const reduceMotion = useReducedMotion();

  return (
    <Animated.View key={category} entering={reduceMotion ? undefined : FadeIn.duration(600)} style={[styles.fill, style]}>
      <LinearGradient colors={[start, end]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fill}>
        {children}
      </LinearGradient>
    </Animated.View>
  );
}

// Sunny gradients are light, so they need dark text. Other categories use white.
export function heroTextColor(category: WeatherGradientKey): string {
  return category === "sunny" ? brandPalette.navy : "#FFFFFF";
}

export function heroMutedColor(category: WeatherGradientKey): string {
  return category === "sunny" ? "rgba(11, 37, 69, 0.72)" : "rgba(255, 255, 255, 0.78)";
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
