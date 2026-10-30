import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { House, Map as MapIcon, type LucideIcon } from "lucide-react-native";
import type { BottomTabBarProps } from "expo-router/js-tabs";

import { useAppTheme } from "@/context/ThemeContext";

// Icons are keyed by route name, so the bar stays in sync with the tab layout.
const TAB_ICONS: Record<string, LucideIcon> = {
  index: House,
  map: MapIcon,
};

const BAR_HEIGHT = 60;
const PILL_HEIGHT = 44;
const MAX_PILL_WIDTH = 76;

export function BottomNav({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const { colors } = useAppTheme();
  const [rowWidth, setRowWidth] = useState(0);

  const tabCount = state.routes.length;
  const tabWidth = tabCount > 0 ? rowWidth / tabCount : 0;
  const pillWidth = Math.min(tabWidth * 0.72, MAX_PILL_WIDTH);
  const indicatorX = useSharedValue(0);

  // Slide the active pill to the focused tab with a spring.
  useEffect(() => {
    indicatorX.value = withSpring(state.index * tabWidth + (tabWidth - pillWidth) / 2, {
      damping: 20,
      stiffness: 220,
    });
  }, [state.index, tabWidth, pillWidth, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    setRowWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 10),
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View style={styles.row} onLayout={handleLayout}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            { width: pillWidth, backgroundColor: colors.tabIndicator },
            indicatorStyle,
          ]}
        />

        {state.routes.map((route, index) => {
          const Icon = TAB_ICONS[route.name];
          if (!Icon) return null;

          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const focused = state.index === index;

          const handlePress = () => {
            const event = emitter.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigateToTab(route.key);
            }
          };

          const handleLongPress = () => {
            emitter.emit({ type: "tabLongPress", target: route.key });
          };

          return (
            <TabItem
              key={route.key}
              label={label}
              Icon={Icon}
              focused={focused}
              activeColor={colors.accent}
              inactiveColor={colors.textSecondary}
              onPress={handlePress}
              onLongPress={handleLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

type TabItemProps = {
  label: string;
  Icon: LucideIcon;
  focused: boolean;
  activeColor: string;
  inactiveColor: string;
  onPress: () => void;
  onLongPress: () => void;
};

function TabItem({ label, Icon, focused, activeColor, inactiveColor, onPress, onLongPress }: TabItemProps) {
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, { duration: 220 });
  }, [focused, progress]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -2 * progress.value }, { scale: 1 + 0.08 * progress.value }],
  }));

  const tint = focused ? activeColor : inactiveColor;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.item}
    >
      <Animated.View style={iconStyle}>
        <Icon size={22} color={tint} strokeWidth={focused ? 2.4 : 2} />
      </Animated.View>
      <Text style={[styles.label, { color: tint }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  row: {
    height: BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
  },
  indicator: {
    position: "absolute",
    top: (BAR_HEIGHT - PILL_HEIGHT) / 2,
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
  },
  item: {
    flex: 1,
    height: BAR_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
});
