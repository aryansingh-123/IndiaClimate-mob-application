import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Droplets } from "lucide-react-native";

import { SectionCard } from "@/components/common/SectionCard";
import { brandPalette } from "@/constants/colors";
import { describeWeatherCode } from "@/constants/weatherCodes";
import { useAppTheme } from "@/context/ThemeContext";
import type { DailyPoint } from "@/types/weather";
import { formatNumber, formatShortDate, formatWeekday } from "@/utils/formatters";

// Bars are scaled to the week's overall range, so rows can be compared directly.
export function DailyForecast({ daily, delay }: { daily: DailyPoint[]; delay?: number }) {
  const { colors } = useAppTheme();

  const temps = daily.flatMap((day) => [day.minTemp, day.maxTemp]).filter((t): t is number => t !== null);
  const weekMin = temps.length > 0 ? Math.min(...temps) : 0;
  const weekMax = temps.length > 0 ? Math.max(...temps) : 0;
  const span = Math.max(weekMax - weekMin, 1);

  return (
    <SectionCard title="7-day forecast" delay={delay}>
      <View style={styles.list}>
        {daily.map((day, index) => {
          const descriptor = describeWeatherCode(day.weatherCode);
          const Icon = descriptor.dayIcon;
          const hasRange = day.minTemp !== null && day.maxTemp !== null;
          const left = hasRange ? ((day.minTemp! - weekMin) / span) * 100 : 0;
          const width = hasRange ? ((day.maxTemp! - day.minTemp!) / span) * 100 : 0;

          return (
            <View key={day.date} style={[styles.row, index > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
              <View style={styles.dayColumn}>
                <Text style={[styles.day, { color: colors.textPrimary }]}>
                  {index === 0 ? "Today" : formatWeekday(day.date)}
                </Text>
                <Text style={[styles.muted, { color: colors.textSecondary }]}>{formatShortDate(day.date)}</Text>
                <Text style={[styles.muted, { color: colors.textSecondary }]} numberOfLines={1}>
                  {descriptor.label}
                </Text>
                <View style={styles.rainRow}>
                  <Droplets size={11} color={colors.textSecondary} />
                  <Text style={[styles.muted, { color: colors.textSecondary }]}>
                    {formatNumber(day.rainChance)}% rain
                  </Text>
                </View>
              </View>

              <Icon size={28} color={colors.accent} strokeWidth={1.8} />

              <View style={styles.rangeColumn}>
                <Text style={[styles.temp, styles.tempMin, { color: colors.textSecondary }]}>
                  {formatNumber(day.minTemp)}°
                </Text>
                <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]}>
                  {hasRange ? (
                    <LinearGradient
                      colors={[brandPalette.skyBlue, brandPalette.saffron]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.fill, { left: `${left}%`, width: `${Math.max(width, 4)}%` }]}
                    />
                  ) : null}
                </View>
                <Text style={[styles.temp, { color: colors.textPrimary }]}>{formatNumber(day.maxTemp)}°</Text>
              </View>
            </View>
          );
        })}
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  dayColumn: {
    flex: 1.15,
    gap: 1,
  },
  day: {
    fontSize: 14,
    fontWeight: "700",
  },
  muted: {
    fontSize: 12,
  },
  rainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  rangeColumn: {
    flex: 1.35,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  temp: {
    width: 36,
    fontSize: 14,
    fontWeight: "700",
  },
  tempMin: {
    textAlign: "right",
    fontWeight: "600",
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    borderRadius: 3,
  },
});
