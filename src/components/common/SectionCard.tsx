import type { PropsWithChildren, ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useAppTheme } from "@/context/ThemeContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type SectionCardProps = PropsWithChildren<{
  title: string;
  right?: ReactNode;
  delay?: number;
}>;

// Shared card with a staggered entrance. Every dashboard section uses it.
export function SectionCard({ title, right, delay = 0, children }: SectionCardProps) {
  const { colors } = useAppTheme();
  const reduceMotion = useReducedMotion();

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.delay(delay).duration(450)}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        {right}
      </View>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
});
