import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { MapPin, RefreshCw, Search } from "lucide-react-native";
import { router } from "expo-router";

import { useAppTheme } from "@/context/ThemeContext";
import { useLocation } from "@/hooks/useLocation";
import { useNow } from "@/hooks/useNow";
import { formatDeviceDateTime, formatPointLabel } from "@/utils/formatters";

// Shows the active place, the device's date and time, and a GPS refresh button.
export function LocationHeader() {
  const { colors } = useAppTheme();
  const { activePoint, gps, refreshGpsLocation } = useLocation();
  const now = useNow();
  const isLocating = gps.status === "locating";

  const placeLabel = activePoint
    ? formatPointLabel(activePoint)
    : isLocating
      ? "Finding your location…"
      : "Location unavailable";

  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <View style={styles.placeRow}>
          <MapPin size={16} color={colors.accent} />
          <Text style={[styles.place, { color: colors.textPrimary }]} numberOfLines={2}>
            {placeLabel}
          </Text>
        </View>
        <Text style={[styles.date, { color: colors.textSecondary }]}>{formatDeviceDateTime(now)}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Search for a city"
        onPress={() => router.push("/city/search")}
        style={({ pressed }) => [
          styles.iconButton,
          { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Search size={18} color={colors.textPrimary} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Refresh GPS location"
        accessibilityState={{ disabled: isLocating }}
        disabled={isLocating}
        onPress={() => void refreshGpsLocation()}
        style={({ pressed }) => [
          styles.refresh,
          { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        {isLocating ? (
          <ActivityIndicator size="small" color={colors.accent} />
        ) : (
          <RefreshCw size={18} color={colors.textPrimary} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  place: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
  },
  date: {
    fontSize: 13,
    marginLeft: 22,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  refresh: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
});
