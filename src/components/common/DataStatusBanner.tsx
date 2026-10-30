import { Pressable, StyleSheet, Text, View } from "react-native";
import { WifiOff, RefreshCw } from "lucide-react-native";

import { useAppTheme } from "@/context/ThemeContext";
import type { DataOrigin } from "@/services/dataRepository";
import { formatDeviceDateTime } from "@/utils/formatters";

type DataStatusBannerProps = {
  isOffline: boolean;
  origin: DataOrigin | null;
  savedAt: number | null;
  onRetry: () => void;
};

// Shown whenever the data on screen is a saved copy rather than a live fetch.
export function DataStatusBanner({ isOffline, origin, savedAt, onRetry }: DataStatusBannerProps) {
  const { colors } = useAppTheme();
  const isSaved = origin === "stale-cache";
  if (!isOffline && !isSaved) return null;

  const since = savedAt ? ` from ${formatDeviceDateTime(savedAt)}` : "";
  const message = isOffline
    ? `You're offline. Showing saved weather${since}.`
    : `Couldn't refresh. Showing saved weather${since}.`;

  return (
    <View style={[styles.banner, { backgroundColor: colors.surfaceMuted, borderColor: colors.warning }]}>
      <WifiOff size={16} color={colors.warning} />
      <Text style={[styles.message, { color: colors.textPrimary }]}>{message}</Text>
      {!isOffline ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retry loading weather"
          onPress={onRetry}
          style={styles.retry}
        >
          <RefreshCw size={14} color={colors.accent} />
          <Text style={[styles.retryLabel, { color: colors.accent }]}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  message: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  retry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  retryLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
});
