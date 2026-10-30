import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/context/ThemeContext";
import type { ThemePreference } from "@/types/theme";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export function ThemeModeSelector() {
  const { colors, preference, setPreference } = useAppTheme();

  return (
    <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]} accessibilityRole="radiogroup">
      {OPTIONS.map((option) => {
        const selected = preference === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => setPreference(option.value)}
            style={[styles.option, selected && { backgroundColor: colors.surface }]}
          >
            <Text
              style={[
                styles.optionLabel,
                { color: selected ? colors.textPrimary : colors.textSecondary },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: "center",
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
});
