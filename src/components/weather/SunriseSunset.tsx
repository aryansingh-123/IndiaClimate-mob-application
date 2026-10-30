import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { Sun, Sunrise, Sunset, type LucideIcon } from "lucide-react-native";

import { SectionCard } from "@/components/common/SectionCard";
import { useAppTheme } from "@/context/ThemeContext";
import type { SunTimes } from "@/types/weather";
import { formatClock, formatDuration } from "@/utils/formatters";
import { minutesOfDay } from "@/utils/weatherMapper";

// Arc geometry in SVG units. The arc runs from the horizon at the left, over the
// top, to the horizon at the right.
const WIDTH = 280;
const HEIGHT = 120;
const CENTER_X = 140;
const HORIZON_Y = 105;
const RADIUS_X = 130;
const RADIUS_Y = 95;

// Fraction of the day between sunrise and sunset, or null when the sun is down
// or the times are unavailable.
function sunProgress(nowClock: string, sun: SunTimes): number | null {
  const now = minutesOfDay(nowClock);
  const rise = minutesOfDay(sun.sunrise);
  const set = minutesOfDay(sun.sunset);
  if (now === null || rise === null || set === null || set <= rise) return null;
  if (now < rise || now > set) return null;
  return (now - rise) / (set - rise);
}

export function SunriseSunset({
  sun,
  currentTime,
  delay,
}: {
  sun: SunTimes;
  currentTime: string;
  delay?: number;
}) {
  const { colors } = useAppTheme();
  const progress = sunProgress(currentTime.slice(11, 16), sun);
  const sunPosition =
    progress === null
      ? null
      : {
          x: CENTER_X - RADIUS_X * Math.cos(Math.PI * progress),
          y: HORIZON_Y - RADIUS_Y * Math.sin(Math.PI * progress),
        };

  return (
    <SectionCard title="Sun" delay={delay}>
      <View style={styles.arcWrapper}>
        <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          <Line
            x1={0}
            y1={HORIZON_Y}
            x2={WIDTH}
            y2={HORIZON_Y}
            stroke={colors.border}
            strokeWidth={1}
          />
          <Path
            d={`M 10 ${HORIZON_Y} A ${RADIUS_X} ${RADIUS_Y} 0 0 1 270 ${HORIZON_Y}`}
            stroke={colors.border}
            strokeWidth={2}
            strokeDasharray="4 6"
            fill="none"
          />
          {sunPosition ? (
            <Circle cx={sunPosition.x} cy={sunPosition.y} r={9} fill={colors.accent} />
          ) : null}
        </Svg>
        {sunPosition === null ? (
          <Text style={[styles.belowHorizon, { color: colors.textSecondary }]}>
            {sun.sunrise && sun.sunset ? "Sun is below the horizon" : "Sun times unavailable"}
          </Text>
        ) : null}
      </View>

      <View style={styles.timesRow}>
        <TimeBlock Icon={Sunrise} label="Sunrise" value={formatClock(sun.sunrise)} />
        <TimeBlock Icon={Sun} label="Daylight" value={formatDuration(sun.daylightSeconds)} />
        <TimeBlock Icon={Sunset} label="Sunset" value={formatClock(sun.sunset)} />
      </View>
    </SectionCard>
  );
}

function TimeBlock({
  Icon,
  label,
  value,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.timeBlock}>
      <Icon size={18} color={colors.accent} />
      <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.timeValue, { color: colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  arcWrapper: {
    alignItems: "center",
  },
  belowHorizon: {
    position: "absolute",
    bottom: 4,
    fontSize: 12,
    fontWeight: "600",
  },
  timesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeBlock: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  timeLabel: {
    fontSize: 12,
  },
  timeValue: {
    fontSize: 15,
    fontWeight: "700",
  },
});
