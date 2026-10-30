import { Tabs } from "expo-router/js-tabs";

import { BottomNav } from "@/components/navigation/BottomNav";
import { useAppTheme } from "@/context/ThemeContext";

export default function TabsLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{
        headerShown: false,
        animation: "fade",
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="map" options={{ title: "Map" }} />
    </Tabs>
  );
}
