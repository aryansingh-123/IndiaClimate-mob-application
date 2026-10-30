import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { LocateFixed, MapPin, Search, X } from "lucide-react-native";

import { ErrorState } from "@/components/common/ErrorState";
import { useAppTheme } from "@/context/ThemeContext";
import { useCitySearch } from "@/hooks/useCitySearch";
import type { CitySearchResult } from "@/types/search";
import type { ResolvedPlace } from "@/types/location";

type CitySearchPanelProps = {
  onSelect: (result: CitySearchResult, place: ResolvedPlace) => void;
  onUseCurrentLocation: () => void;
};

// Converts a search hit into the place shape the location state stores.
export function toResolvedPlace(result: CitySearchResult): ResolvedPlace {
  return {
    city: result.name,
    district: null,
    region: result.region,
    country: result.country,
    countryCode: result.countryCode,
  };
}

export function CitySearchPanel({ onSelect, onUseCurrentLocation }: CitySearchPanelProps) {
  const { colors } = useAppTheme();
  const [input, setInput] = useState("");
  const search = useCitySearch(input);

  const showEmpty = search.status === "ready" && search.results.length === 0 && search.query.length >= 2;

  return (
    <View style={styles.container}>
      <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search size={18} color={colors.textSecondary} />
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Search Indian cities"
          placeholderTextColor={colors.textSecondary}
          autoFocus
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
          accessibilityLabel="Search Indian cities"
          style={[styles.input, { color: colors.textPrimary }]}
        />
        {search.isPending || search.status === "loading" ? (
          <ActivityIndicator size="small" color={colors.accent} />
        ) : input.length > 0 ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setInput("")} hitSlop={8}>
            <X size={18} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Use my current location"
        onPress={onUseCurrentLocation}
        style={({ pressed }) => [
          styles.gpsRow,
          { backgroundColor: colors.accentSoft, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <LocateFixed size={18} color={colors.accent} />
        <Text style={[styles.gpsLabel, { color: colors.textPrimary }]}>Use My Current Location</Text>
      </Pressable>

      {search.isTooShort ? (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>Type at least 2 letters.</Text>
      ) : null}

      {search.status === "error" ? (
        <ErrorState code={search.errorCode} onRetry={search.retry} compact />
      ) : null}

      {showEmpty ? (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          No Indian city matches “{search.query}”. Try another spelling.
        </Text>
      ) : null}

      <FlatList
        data={search.status === "error" ? [] : search.results}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.name}${item.region ? `, ${item.region}` : ""}`}
            onPress={() => onSelect(item, toResolvedPlace(item))}
            style={({ pressed }) => [
              styles.result,
              { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <View style={[styles.resultIcon, { backgroundColor: colors.surfaceMuted }]}>
              <MapPin size={16} color={colors.accent} />
            </View>
            <View style={styles.resultText}>
              <Text style={[styles.resultName, { color: colors.textPrimary }]}>{item.name}</Text>
              <Text style={[styles.resultMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                {[item.region, item.country].filter(Boolean).join(", ")}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  gpsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  gpsLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  hint: {
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 8,
  },
  list: {
    gap: 8,
    paddingBottom: 24,
  },
  result: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  resultText: {
    flex: 1,
    gap: 2,
  },
  resultName: {
    fontSize: 15,
    fontWeight: "700",
  },
  resultMeta: {
    fontSize: 12,
  },
});
