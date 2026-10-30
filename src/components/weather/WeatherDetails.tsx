import { StyleSheet, View } from "react-native";
import {
  Cloud,
  CloudRain,
  Droplets,
  Eye,
  Gauge,
  Navigation,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react-native";

import { SectionCard } from "@/components/common/SectionCard";
import { MetricTile } from "@/components/weather/MetricTile";
import { getUvLabel } from "@/constants/weatherCodes";
import { useAppTheme } from "@/context/ThemeContext";
import type { CurrentConditions } from "@/types/weather";
import { formatNumber } from "@/utils/formatters";

const CARDINALS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;

// Wind direction is where the wind comes from, in degrees.
function cardinalOf(degrees: number): string {
  return CARDINALS[Math.round(degrees / 45) % 8];
}

export function WeatherDetails({ current, delay }: { current: CurrentConditions; delay?: number }) {
  const { colors } = useAppTheme();
  const direction = current.windDirection;

  return (
    <SectionCard title="Details" delay={delay}>
      <View style={styles.grid}>
        <MetricTile label="Humidity" value={formatNumber(current.humidity)} unit="%" Icon={Droplets} />
        <MetricTile label="Wind speed" value={formatNumber(current.windSpeed)} unit="km/h" Icon={Wind} />
        <MetricTile
          label="Wind direction"
          value={direction === null ? "--" : cardinalOf(direction)}
          note={direction === null ? undefined : `${formatNumber(direction)}° (from)`}
          iconNode={
            <View style={direction === null ? undefined : { transform: [{ rotate: `${(direction + 180) % 360}deg` }] }}>
              <Navigation size={16} color={colors.accent} />
            </View>
          }
        />
        <MetricTile label="Wind gusts" value={formatNumber(current.windGusts)} unit="km/h" Icon={Wind} />
        <MetricTile label="Pressure" value={formatNumber(current.pressure)} unit="hPa" Icon={Gauge} />
        <MetricTile
          label="UV index"
          value={formatNumber(current.uvIndex, 1)}
          note={getUvLabel(current.uvIndex)}
          Icon={Sun}
        />
        <MetricTile
          label="Visibility"
          value={current.visibilityMeters === null ? "--" : (current.visibilityMeters / 1000).toFixed(1)}
          unit="km"
          Icon={Eye}
        />
        <MetricTile label="Cloud cover" value={formatNumber(current.cloudCover)} unit="%" Icon={Cloud} />
        <MetricTile label="Dew point" value={formatNumber(current.dewPoint, 1)} unit="°C" Icon={Thermometer} />
        <MetricTile
          label="Precipitation"
          value={formatNumber(current.precipitation, 1)}
          unit="mm"
          Icon={CloudRain}
        />
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
});
