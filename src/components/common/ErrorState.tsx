import { Pressable, StyleSheet, Text, View } from "react-native";
import { CloudOff, RefreshCw } from "lucide-react-native";

import { useAppTheme } from "@/context/ThemeContext";
import type { WeatherErrorCode } from "@/services/weatherApi";

const MESSAGES: Record<WeatherErrorCode, string> = {
  network: "No connection. Check your internet and try again.",
  timeout: "The weather service took too long to respond.",
  http: "The weather service is unavailable right now.",
  "invalid-data": "The weather data was incomplete. Try again in a moment.",
};

type ErrorStateProps = {
  // null means no weather has been loaded yet and no specific code is known.
  code: WeatherErrorCode | null;
  onRetry: () => void;
  compact?: boolean;
};

export function ErrorState({ code, onRetry, compact = false }: ErrorStateProps) {
  const { colors } = useAppTheme();
  const message = code ? MESSAGES[code] : "We couldn't load the weather for this location.";

  return (
    <View
      style={[
        styles.container,
        compact && styles.compact,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={[styles.iconBadge, { backgroundColor: colors.accentSoft }]}>
        <CloudOff size={20} color={colors.accent} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Weather unavailable</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retry loading weather"
        onPress={onRetry}
        style={({ pressed }) => [
          styles.retry,
          { backgroundColor: colors.accent, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <RefreshCw size={16} color={colors.textOnAccent} />
        <Text style={[styles.retryLabel, { color: colors.textOnAccent }]}>Retry</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 12,
  },
  compact: {
    padding: 14,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  message: {
    fontSize: 13,
    lineHeight: 19,
  },
  retry: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
});
