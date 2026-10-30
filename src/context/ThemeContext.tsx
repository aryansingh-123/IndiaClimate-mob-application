import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useColorScheme } from "react-native";

import { darkColors, lightColors, type ThemeColors } from "@/constants/colors";
import { STORAGE_KEYS } from "@/constants/storage";
import { readStoredValue, writeStoredValue } from "@/services/storage";
import type { ResolvedTheme, ThemePreference } from "@/types/theme";

type ThemeContextValue = {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  isDark: boolean;
  colors: ThemeColors;
  setPreference: (next: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  // Restore the saved preference once on mount. Until it loads, "system" applies.
  useEffect(() => {
    let active = true;
    readStoredValue(STORAGE_KEYS.themePreference).then((stored) => {
      if (active && isThemePreference(stored)) {
        setPreferenceState(stored);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    void writeStoredValue(STORAGE_KEYS.themePreference, next);
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const resolvedTheme: ResolvedTheme =
      preference === "system" ? (systemScheme === "dark" ? "dark" : "light") : preference;
    const isDark = resolvedTheme === "dark";

    return {
      preference,
      resolvedTheme,
      isDark,
      colors: isDark ? darkColors : lightColors,
      setPreference,
    };
  }, [preference, systemScheme, setPreference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used inside ThemeProvider");
  }
  return context;
}
