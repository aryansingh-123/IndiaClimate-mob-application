import type { ReactNode } from "react";
import { StyleSheet, Text, View, type DimensionValue } from "react-native";
import type { LucideIcon } from "lucide-react-native";

import { useAppTheme } from "@/context/ThemeContext";

type MetricTileProps = {
  label: string;
  value: string;
  unit?: string;
  note?: string;
  Icon?: LucideIcon;
  // Replaces the default icon, for example a rotated wind arrow.
  iconNode?: ReactNode;
  width?: DimensionValue;
};

export function MetricTile({ label, value, unit, note, Icon, iconNode, width = "48%" }: MetricTileProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.tile, { width, backgroundColor: colors.surfaceMuted }]}>
      <View style={styles.headerRow}>
        {iconNode ?? (Icon ? <Icon size={16} color={colors.accent} /> : null)}
        <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
        {unit ? <Text style={[styles.unit, { color: colors.textSecondary }]}>{unit}</Text> : null}
      </View>
      {note ? (
        <Text style={[styles.note, { color: colors.textSecondary }]} numberOfLines={2}>
          {note}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 16,
    padding: 12,
    gap: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
  },
  unit: {
    fontSize: 12,
    fontWeight: "600",
  },
  note: {
    fontSize: 11,
    lineHeight: 15,
  },
});
