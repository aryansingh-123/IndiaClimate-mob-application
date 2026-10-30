import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Atom, Flame, RefreshCw, Wind } from "lucide-react-native";
import { useEffect } from "react";

import { SectionCard } from "@/components/common/SectionCard";
import { SkeletonBlock } from "@/components/common/LoadingSkeleton";
import { MetricTile } from "@/components/weather/MetricTile";
import { AQI_CATEGORIES, AQI_SCALE_MAX } from "@/constants/airQuality";
import { useAppTheme } from "@/context/ThemeContext";
import type { ApiErrorCode } from "@/services/http";
import type { AirQualityReport } from "@/types/airQuality";
import { formatNumber } from "@/utils/formatters";

type AirQualityCardProps = {
  air: AirQualityReport | null;
  loading: boolean;
  failure: ApiErrorCode | null;
  onRetry: () => void;
  delay?: number;
};

export function AirQualityCard({ air, loading, failure, onRetry, delay }: AirQualityCardProps) {
  const { colors } = useAppTheme();

  if (!air) {
    return (
      <SectionCard title="Air quality" delay={delay}>
        {loading ? (
          <SkeletonBlock height={96} radius={14} />
        ) : (
          <View style={styles.unavailable}>
            <Text style={[styles.body, { color: colors.textSecondary }]}>
              {failure === "network"
                ? "Air quality needs a connection. It will load when you're back online."
                : "Air quality isn't available for this location right now."}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retry air quality"
              onPress={onRetry}
              style={[styles.retry, { backgroundColor: colors.surfaceMuted }]}
            >
              <RefreshCw size={14} color={colors.textPrimary} />
              <Text style={[styles.retryLabel, { color: colors.textPrimary }]}>Retry</Text>
            </Pressable>
          </View>
        )}
      </SectionCard>
    );
  }

  const category = air.category;
  const accent = category?.color ?? colors.accent;

  return (
    <SectionCard
      title="Air quality"
      delay={delay}
      right={<Text style={[styles.scale, { color: colors.textSecondary }]}>US AQI</Text>}
    >
      <View style={styles.headline}>
        <Text style={[styles.aqi, { color: colors.textPrimary }]}>{formatNumber(air.usAqi)}</Text>
        <View style={[styles.chip, { backgroundColor: accent }]}>
          <Text style={[styles.chipLabel, { color: category?.key === "moderate" ? "#0B2545" : "#FFFFFF" }]}>
            {category?.label ?? "Unavailable"}
          </Text>
        </View>
      </View>

      <AqiGauge value={air.usAqi} />

      {category ? (
        <Text style={[styles.body, { color: colors.textSecondary }]}>{category.advice}</Text>
      ) : null}

      <View style={styles.grid}>
        <MetricTile label="PM2.5" value={formatNumber(air.pm25, 1)} unit="µg/m³" Icon={Atom} width="31%" />
        <MetricTile label="PM10" value={formatNumber(air.pm10, 1)} unit="µg/m³" Icon={Atom} width="31%" />
        <MetricTile label="NO₂" value={formatNumber(air.no2, 1)} unit="µg/m³" Icon={Flame} width="31%" />
        <MetricTile label="O₃" value={formatNumber(air.o3, 1)} unit="µg/m³" Icon={Wind} width="31%" />
        <MetricTile label="CO" value={formatNumber(air.co, 1)} unit="µg/m³" Icon={Flame} width="31%" />
        <MetricTile label="SO₂" value={formatNumber(air.so2, 1)} unit="µg/m³" Icon={Wind} width="31%" />
      </View>

      <Text style={[styles.footnote, { color: colors.textSecondary }]}>
        US AQI from Open-Meteo model data. This is not India's official CPCB AQI.
      </Text>
    </SectionCard>
  );
}

// Segmented scale with a marker at the reading. Each category gets an equal
// segment, so the segments are not proportional to the AQI breakpoints.
function AqiGauge({ value }: { value: number | null }) {
  const { colors } = useAppTheme();
  const position = useSharedValue(0);

  useEffect(() => {
    const clamped = value === null ? 0 : Math.min(Math.max(value, 0), AQI_SCALE_MAX);
    position.value = withSpring((clamped / AQI_SCALE_MAX) * 100, { damping: 20, stiffness: 140 });
  }, [value, position]);

  const markerStyle = useAnimatedStyle(() => ({ left: `${position.value}%` }));

  return (
    <View style={styles.gaugeWrapper}>
      <View style={styles.segments}>
        {AQI_CATEGORIES.map((category) => (
          <View key={category.key} style={[styles.segment, { backgroundColor: category.color }]} />
        ))}
      </View>
      <Animated.View style={[styles.marker, markerStyle, { borderColor: colors.textPrimary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  unavailable: {
    gap: 12,
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
  },
  retry: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  scale: {
    fontSize: 12,
    fontWeight: "600",
  },
  headline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  aqi: {
    fontSize: 42,
    fontWeight: "200",
    letterSpacing: -1,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  gaugeWrapper: {
    height: 14,
    justifyContent: "center",
  },
  segments: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  segment: {
    flex: 1,
  },
  marker: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
    marginLeft: -7,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  footnote: {
    fontSize: 11,
    lineHeight: 15,
  },
});
