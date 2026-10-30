import { useEffect } from "react";
import { StyleSheet, View, type DimensionValue } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { useAppTheme } from "@/context/ThemeContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type SkeletonBlockProps = {
  height: number;
  width?: DimensionValue;
  radius?: number;
};

// One pulsing placeholder block. Used while the first forecast loads.
export function SkeletonBlock({ height, width = "100%", radius = 16 }: SkeletonBlockProps) {
  const { colors } = useAppTheme();
  const pulse = useSharedValue(0.5);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      pulse.value = 0.7;
      return;
    }
    pulse.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View
      style={[
        styles.block,
        { height, width, borderRadius: radius, backgroundColor: colors.surfaceMuted },
        animatedStyle,
      ]}
    />
  );
}

export function HomeSkeleton() {
  return (
    <View style={styles.stack}>
      <SkeletonBlock height={220} radius={28} />
      <SkeletonBlock height={120} />
      <SkeletonBlock height={160} />
      <SkeletonBlock height={260} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignSelf: "stretch",
  },
  stack: {
    gap: 16,
  },
});
