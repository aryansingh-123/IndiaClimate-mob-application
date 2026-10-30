import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { MAP_LAYERS, type MapLayerKey } from "@/constants/map";
import { useAppTheme } from "@/context/ThemeContext";

type MapLayerSelectorProps = {
  value: MapLayerKey;
  onChange: (layer: MapLayerKey) => void;
};

// Layers change what each marker shows, using real Open-Meteo values.
export function MapLayerSelector({ value, onChange }: MapLayerSelectorProps) {
  const { colors } = useAppTheme();
  const radar = MAP_LAYERS.find((layer) => layer.key === "radar");

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {MAP_LAYERS.map((layer) => {
          const selected = value === layer.key;
          return (
            <Pressable
              key={layer.key}
              accessibilityRole="button"
              accessibilityLabel={layer.label}
              accessibilityState={{ selected, disabled: !layer.enabled }}
              disabled={!layer.enabled}
              onPress={() => onChange(layer.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? colors.accent : colors.surface,
                  borderColor: colors.border,
                  opacity: layer.enabled ? 1 : 0.45,
                },
              ]}
            >
              <Text style={[styles.chipLabel, { color: selected ? colors.textOnAccent : colors.textPrimary }]}>
                {layer.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {radar && !radar.enabled ? (
        <Text style={[styles.note, { color: colors.textSecondary }]}>
          Radar is unavailable. Its free data is licensed for personal use only.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  row: {
    gap: 8,
    paddingHorizontal: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  note: {
    fontSize: 11,
    paddingHorizontal: 16,
  },
});
