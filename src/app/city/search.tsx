import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import { CitySearchPanel } from "@/components/search/CitySearchPanel";
import { useAppTheme } from "@/context/ThemeContext";
import { useLocation } from "@/hooks/useLocation";

// City search. Picking a city makes it the active location. GPS stays stored
// separately, so "Use My Current Location" can return to it.
export default function CitySearchScreen() {
  const { colors } = useAppTheme();
  const { selectManualLocation, returnToGpsLocation } = useLocation();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={[styles.back, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Choose a city</Text>
      </View>

      <View style={styles.body}>
        <CitySearchPanel
          onSelect={(result, place) => {
            selectManualLocation(result.coordinates, place);
            router.back();
          }}
          onUseCurrentLocation={() => {
            returnToGpsLocation();
            router.back();
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
