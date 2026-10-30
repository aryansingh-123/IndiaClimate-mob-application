import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { Droplets } from "lucide-react-native";

import { SectionCard } from "@/components/common/SectionCard";
import { getWeatherIcon } from "@/constants/weatherCodes";
import { useAppTheme } from "@/context/ThemeContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { HourlyPoint } from "@/types/weather";
import { formatLocalHour, formatNumber } from "@/utils/formatters";

// The first entry is the current hour, highlighted as "Now".
export function HourlyForecast({ hourly, delay }: { hourly: HourlyPoint[]; delay?: number }) {
  const { colors } = useAppTheme();
  const reduceMotion = useReducedMotion();

  return (
    <SectionCard title="Next 24 hours" delay={delay}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {hourly.map((hour, index) => {
          const isNow = index === 0;
          const Icon = getWeatherIcon(hour.weatherCode, hour.isDay);
          const tint = isNow ? colors.accent : colors.textPrimary;

          return (
            <Animated.View
              key={hour.time}
              entering={reduceMotion ? undefined : FadeInRight.delay(Math.min(index, 8) * 40).duration(350)}
              accessibilityLabel={`${isNow ? "Now" : formatLocalHour(hour.time)}, ${formatNumber(hour.temperature)} degrees`}
              style={[
                styles.item,
                {
                  backgroundColor: isNow ? colors.accentSoft : colors.surfaceMuted,
                  borderColor: isNow ? colors.accent : "transparent",
                },
              ]}
            >
              <Text style={[styles.time, { color: isNow ? colors.accent : colors.textSecondary }]}>
                {isNow ? "Now" : formatLocalHour(hour.time)}
              </Text>
              <Icon size={24} color={tint} strokeWidth={1.8} />
              <Text style={[styles.temperature, { color: colors.textPrimary }]}>
                {formatNumber(hour.temperature)}°
              </Text>
              <View style={styles.rainRow}>
                <Droplets size={11} color={colors.textSecondary} />
                <Text style={[styles.rain, { color: colors.textSecondary }]}>
                  {formatNumber(hour.rainChance)}%
                </Text>
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 10,
    paddingVertical: 2,
  },
  item: {
    width: 70,
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  time: {
    fontSize: 12,
    fontWeight: "600",
  },
  temperature: {
    fontSize: 16,
    fontWeight: "700",
  },
  rainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  rain: {
    fontSize: 11,
    fontWeight: "600",
  },
});
