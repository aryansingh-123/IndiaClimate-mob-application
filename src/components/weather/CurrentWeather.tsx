import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Cloud, CloudRain, Droplets, Sun } from "lucide-react-native";

import { SectionCard } from "@/components/common/SectionCard";
import { AnimatedWeatherIcon } from "@/components/weather/AnimatedWeatherIcon";
import { MetricTile } from "@/components/weather/MetricTile";
import { heroMutedColor, heroTextColor, WeatherBackground } from "@/components/weather/WeatherBackground";
import { describeWeatherCode, getBackgroundCategory, getUvLabel } from "@/constants/weatherCodes";
import type { WeatherReport } from "@/types/weather";
import { formatHeroDate, formatNumber } from "@/utils/formatters";

// Hero card: big temperature, condition, and the day's range on a
// condition-based gradient.
export function CurrentWeather({ report }: { report: WeatherReport }) {
  const { current, daily } = report;
  const today = daily[0] ?? null;
  const category = getBackgroundCategory(current.weatherCode, current.isDay);
  const textColor = heroTextColor(category);
  const mutedColor = heroMutedColor(category);
  const descriptor = describeWeatherCode(current.weatherCode);

  return (
    <WeatherBackground category={category} style={styles.hero}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.date, { color: mutedColor }]}>{formatHeroDate(current.time)}</Text>
          <AnimatedWeatherIcon
            code={current.weatherCode}
            isDay={current.isDay}
            size={84}
            color={textColor}
          />
        </View>

        <Animated.Text
          key={String(current.temperature)}
          entering={FadeIn.duration(400)}
          style={[styles.temperature, { color: textColor }]}
        >
          {formatNumber(current.temperature)}°
        </Animated.Text>

        <Text style={[styles.condition, { color: textColor }]}>{descriptor.label}</Text>

        <Text style={[styles.range, { color: mutedColor }]}>
          Feels like {formatNumber(current.feelsLike)}° · H {formatNumber(today?.maxTemp ?? null)}° · L{" "}
          {formatNumber(today?.minTemp ?? null)}°
        </Text>

        <View style={styles.rainRow}>
          <Droplets size={16} color={mutedColor} />
          <Text style={[styles.rain, { color: mutedColor }]}>
            Rain chance now {formatNumber(current.rainChance)}% · today {formatNumber(today?.rainChance ?? null)}%
          </Text>
        </View>
      </View>
    </WeatherBackground>
  );
}

// Today's secondary readings: cloud cover, precipitation, and peak UV.
export function TodaySummary({ report, delay }: { report: WeatherReport; delay?: number }) {
  const { current, daily } = report;
  const uvMax = daily[0]?.uvIndexMax ?? null;

  return (
    <SectionCard title="Today" delay={delay}>
      <View style={styles.metricRow}>
        <MetricTile
          label="Cloud cover"
          value={formatNumber(current.cloudCover)}
          unit="%"
          Icon={Cloud}
          width="31%"
        />
        <MetricTile
          label="Precipitation"
          value={formatNumber(current.precipitation, 1)}
          unit="mm"
          Icon={CloudRain}
          width="31%"
        />
        <MetricTile
          label="UV max"
          value={formatNumber(uvMax, 1)}
          note={getUvLabel(uvMax)}
          Icon={Sun}
          width="31%"
        />
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 28,
    overflow: "hidden",
  },
  content: {
    padding: 22,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  date: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  temperature: {
    fontSize: 88,
    fontWeight: "200",
    letterSpacing: -3,
    marginTop: 4,
  },
  condition: {
    fontSize: 20,
    fontWeight: "600",
  },
  range: {
    fontSize: 14,
    marginTop: 2,
  },
  rainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  rain: {
    fontSize: 13,
    fontWeight: "600",
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
