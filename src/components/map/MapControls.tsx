import { Pressable, StyleSheet, View } from "react-native";
import { LocateFixed, Minus, Plus, Search } from "lucide-react-native";

import { useAppTheme } from "@/context/ThemeContext";

type MapControlsProps = {
  onLocate: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSearch: () => void;
};

// Floating controls on the right edge of the map.
export function MapControls({ onLocate, onZoomIn, onZoomOut, onSearch }: MapControlsProps) {
  const { colors } = useAppTheme();
  const buttons = [
    { label: "Use my current location", Icon: LocateFixed, onPress: onLocate },
    { label: "Zoom in", Icon: Plus, onPress: onZoomIn },
    { label: "Zoom out", Icon: Minus, onPress: onZoomOut },
    { label: "Search for a city", Icon: Search, onPress: onSearch },
  ];

  return (
    <View style={[styles.column, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {buttons.map(({ label, Icon, onPress }, index) => (
        <Pressable
          key={label}
          accessibilityRole="button"
          accessibilityLabel={label}
          onPress={onPress}
          style={({ pressed }) => [
            styles.button,
            index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Icon size={20} color={colors.textPrimary} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  button: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
});
