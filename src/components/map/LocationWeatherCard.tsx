import { Pressable, StyleSheet, Text, View } from "react-native";
import { Droplets, Gauge, Thermometer, Wind, X } from "lucide-react-native";

import { SkeletonBlock } from "@/components/common/LoadingSkeleton";
import { MetricTile } from "@/components/weather/MetricTile";
import { describeWeatherCode, getWeatherIcon } from "@/constants/weatherCodes";
import { useAppTheme } from "@/context/ThemeContext";
import type { ApiErrorCode } from "@/services/http";
import type { WeatherReport } from "@/types/weather";
import { formatNumber } from "@/utils/formatters";

type LocationWeatherCardProps = {
  title: string;
  subtitle: string;
  report: WeatherReport | null;
  loading: boolean;
  failure: ApiErrorCode | null;
  onRetry: () => void;
  onClose: () => void;
  onViewForecast: () => void;
};

// Bottom card for a tapped marker or map point. Shows real values only.
export function LocationWeatherCard({
  title,
  subtitle,
  report,
  loading,
  failure,
  onRetry,
  onClose,
  onViewForecast,
}: LocationWeatherCardProps) {
  const { colors } = useAppTheme();
  const today = report?.daily[0] ?? null;
  const Icon = report ? getWeatherIcon(report.current.weatherCode, report.current.isDay) : null;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={10}>
          <X size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      {loading && !report ? <SkeletonBlock height={150} radius={16} /> : null}

      {!loading && !report ? (
        <View style={styles.unavailable}>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            {failure === "network"
              ? "No connection. Weather for this point loads when you're online."
              : "Weather isn't available for this point right now."}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry"
            onPress={onRetry}
            style={[styles.secondary, { backgroundColor: colors.surfaceMuted }]}
          >
            <Text style={[styles.secondaryLabel, { color: colors.textPrimary }]}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {report && Icon ? (
        <>
          <View style={styles.summary}>
            <Icon size={44} color={colors.accent} strokeWidth={1.6} />
            <View>
              <Text style={[styles.temperature, { color: colors.textPrimary }]}>
                {formatNumber(report.current.temperature)}°
              </Text>
              <Text style={[styles.condition, { color: colors.textSecondary }]}>
                {describeWeatherCode(report.current.weatherCode).label}
              </Text>
            </View>
          </View>

          <View style={styles.grid}>
            <MetricTile label="Feels like" value={formatNumber(report.current.feelsLike)} unit="°" Icon={Thermometer} />
            <MetricTile label="Humidity" value={formatNumber(report.current.humidity)} unit="%" Icon={Droplets} />
            <MetricTile label="Wind" value={formatNumber(report.current.windSpeed)} unit="km/h" Icon={Wind} />
            <MetricTile label="Rain chance" value={formatNumber(today?.rainChance ?? null)} unit="%" Icon={Droplets} />
            <MetricTile label="Today high" value={formatNumber(today?.maxTemp ?? null)} unit="°" Icon={Gauge} />
            <MetricTile label="Today low" value={formatNumber(today?.minTemp ?? null)} unit="°" Icon={Gauge} />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View full forecast"
            onPress={onViewForecast}
            style={({ pressed }) => [styles.primary, { backgroundColor: colors.accent, opacity: pressed ? 0.85 : 1 }]}
          >
            <Text style={[styles.primaryLabel, { color: colors.textOnAccent }]}>View Full Forecast</Text>
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  temperature: {
    fontSize: 40,
    fontWeight: "300",
    letterSpacing: -1,
  },
  condition: {
    fontSize: 13,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  primary: {
    alignItems: "center",
    paddingVertical: 13,
    borderRadius: 14,
  },
  primaryLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  unavailable: {
    gap: 10,
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
  },
  secondary: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  secondaryLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
});
