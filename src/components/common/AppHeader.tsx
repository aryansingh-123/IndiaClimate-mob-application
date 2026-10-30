import { StyleSheet, Text, View } from "react-native";

import { AppLogo } from "@/components/common/AppLogo";
import { APP_NAME, APP_TAGLINE } from "@/constants/brand";
import { useAppTheme } from "@/context/ThemeContext";

export function AppHeader() {
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={[styles.logoTile, { backgroundColor: colors.accentSoft }]}>
        <AppLogo size={40} cloudColor={colors.textPrimary} />
      </View>
      <View style={styles.titleBlock}>
        <Text style={[styles.name, { color: colors.textPrimary }]}>{APP_NAME}</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>{APP_TAGLINE}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoTile: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  tagline: {
    fontSize: 13,
    marginTop: 2,
  },
});
