import { useEffect } from "react";
import { type ColorValue } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { getWeatherIcon } from "@/constants/weatherCodes";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type AnimatedWeatherIconProps = {
  code: number | null;
  isDay: boolean;
  size: number;
  color: ColorValue;
};

// Gentle vertical float. It runs on the UI thread and does not re-render React.
export function AnimatedWeatherIcon({ code, isDay, size, color }: AnimatedWeatherIconProps) {
  const Icon = getWeatherIcon(code, isDay);
  const float = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      float.value = 0;
      return;
    }
    float.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [float, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Icon size={size} color={color} strokeWidth={1.6} />
    </Animated.View>
  );
}
