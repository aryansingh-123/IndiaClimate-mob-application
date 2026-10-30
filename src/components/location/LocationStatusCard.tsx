import type { ReactNode } from "react";
import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { LocateFixed, MapPin, RefreshCw } from "lucide-react-native";

import { useAppTheme } from "@/context/ThemeContext";
import { useLocation } from "@/hooks/useLocation";
import type { LocationErrorCode, LocationSource } from "@/types/location";
import { formatPointLabel, formatUpdatedAt } from "@/utils/formatters";

const SOURCE_LABEL: Record<LocationSource, string> = {
  gps: "Your current location",
  manual: "Selected city",
  map: "Selected map point",
};

const ERROR_MESSAGE: Record<LocationErrorCode, string> = {
  "permission-denied": "IndiaClimate needs location permission to find weather where you are. You can still pick a city.",
  "permission-blocked": "Location permission is off for IndiaClimate. Turn it on in app settings to use GPS weather.",
  "services-disabled": "Device location is turned off. Turn on location services to detect your area.",
  unavailable: "We couldn't get a GPS fix just now. Try again outdoors or near a window.",
};

export function LocationStatusCard() {
  const { colors } = useAppTheme();
  const { activePoint, activeSource, gps, refreshGpsLocation, returnToGpsLocation } = useLocation();

  const isLocating = gps.status === "locating";
  const errorCode = gps.errorCode;
  const showReturnToGps = activeSource !== "gps" && gps.point !== null;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: colors.accentSoft }]}>
          <MapPin size={18} color={colors.accent} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {activePoint ? SOURCE_LABEL[activeSource] : "Location"}
          </Text>
          <Text style={[styles.place, { color: colors.textPrimary }]} numberOfLines={2}>
            {activePoint ? formatPointLabel(activePoint) : "Location not available yet"}
          </Text>
        </View>
        {isLocating ? <ActivityIndicator color={colors.accent} /> : null}
      </View>

      {activePoint ? (
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {activeSource === "gps" ? `Updated ${formatUpdatedAt(activePoint.capturedAt)}` : null}
          {activePoint.fromCache ? " · Last known position" : null}
        </Text>
      ) : null}

      {errorCode ? (
        <View style={[styles.notice, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={[styles.noticeText, { color: colors.textPrimary }]}>{ERROR_MESSAGE[errorCode]}</Text>
          {errorCode === "permission-blocked" ? (
            <ActionButton label="Open app settings" onPress={() => void Linking.openSettings()} />
          ) : null}
          {errorCode === "services-disabled" ? (
            <ActionButton label="Turn on location" onPress={() => void openLocationSettings()} />
          ) : null}
        </View>
      ) : null}

      <View style={styles.actions}>
        <ActionButton
          label="Refresh location"
          icon={<RefreshCw size={16} color={colors.textPrimary} />}
          onPress={() => void refreshGpsLocation()}
          disabled={isLocating}
          variant="secondary"
        />
        {showReturnToGps ? (
          <ActionButton
            label="Use My Current Location"
            icon={<LocateFixed size={16} color={colors.textOnAccent} />}
            onPress={returnToGpsLocation}
            variant="primary"
          />
        ) : null}
      </View>
    </View>
  );
}

// Opens the Android location settings screen. Falls back to app settings
// when the intent is unavailable (for example on iOS).
async function openLocationSettings(): Promise<void> {
  try {
    if (Platform.OS === "android") {
      await Linking.sendIntent("android.settings.LOCATION_SOURCE_SETTINGS");
      return;
    }
  } catch {
    // Fall through to app settings.
  }
  await Linking.openSettings();
}

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  variant?: "primary" | "secondary";
};

function ActionButton({ label, onPress, icon, disabled = false, variant = "secondary" }: ActionButtonProps) {
  const { colors } = useAppTheme();
  const isPrimary = variant === "primary";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: isPrimary ? colors.accent : colors.surfaceMuted },
        (pressed || disabled) && styles.buttonDimmed,
      ]}
    >
      {icon}
      <Text style={[styles.buttonLabel, { color: isPrimary ? colors.textOnAccent : colors.textPrimary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  place: {
    fontSize: 16,
    fontWeight: "700",
  },
  meta: {
    fontSize: 12,
  },
  notice: {
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  buttonDimmed: {
    opacity: 0.6,
  },
  buttonLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
});
