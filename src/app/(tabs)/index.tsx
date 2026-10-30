import { useCallback } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "@/components/common/AppHeader";
import { DataStatusBanner } from "@/components/common/DataStatusBanner";
import { ErrorState } from "@/components/common/ErrorState";
import { HomeSkeleton } from "@/components/common/LoadingSkeleton";
import { SectionCard } from "@/components/common/SectionCard";
import { ThemeModeSelector } from "@/components/common/ThemeModeSelector";
import { LocationHeader } from "@/components/location/LocationHeader";
import { LocationStatusCard } from "@/components/location/LocationStatusCard";
import { AirQualityCard } from "@/components/weather/AirQualityCard";
import { CurrentWeather, TodaySummary } from "@/components/weather/CurrentWeather";
import { DailyForecast } from "@/components/weather/DailyForecast";
import { HourlyForecast } from "@/components/weather/HourlyForecast";
import { SunriseSunset } from "@/components/weather/SunriseSunset";
import { WeatherDetails } from "@/components/weather/WeatherDetails";
import { useAppTheme } from "@/context/ThemeContext";
import { useAirQuality } from "@/hooks/useAirQuality";
import { useLocation } from "@/hooks/useLocation";
import { useWeather } from "@/hooks/useWeather";
import { formatDeviceDateTime } from "@/utils/formatters";

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const { activePoint, activeSource, gps, refreshGpsLocation } = useLocation();
  const weather = useWeather();
  const air = useAirQuality();
  const { reload: reloadWeather } = weather;
  const { reload: reloadAir } = air;

  const isRefreshing = gps.status === "locating" || weather.status === "loading" || air.status === "loading";

  // Pull-to-refresh re-reads GPS and bypasses the cache for both data sets.
  const handleRefresh = useCallback(async () => {
    await refreshGpsLocation();
    reloadWeather();
    reloadAir();
  }, [refreshGpsLocation, reloadWeather, reloadAir]);

  const { report } = weather;

  // The location card explains permission, GPS, and cache states. It shows when
  // something needs attention, or when a non-GPS source is active.
  const showLocationCard = !activePoint || gps.errorCode !== null || activeSource !== "gps";

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void handleRefresh()}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        <AppHeader />
        <LocationHeader />

        {report ? (
          <DataStatusBanner
            isOffline={weather.isOffline}
            origin={weather.origin}
            savedAt={weather.savedAt}
            onRetry={weather.reload}
          />
        ) : null}

        {showLocationCard ? <LocationStatusCard /> : null}

        {!report && activePoint && weather.status !== "error" ? <HomeSkeleton /> : null}

        {!report && activePoint && weather.status === "error" ? (
          <ErrorState code={weather.failure} onRetry={weather.reload} />
        ) : null}

        {report ? (
          <View style={styles.stack}>
            <CurrentWeather report={report} />
            <TodaySummary report={report} delay={80} />
            <HourlyForecast hourly={report.hourly} delay={160} />
            <DailyForecast daily={report.daily} delay={240} />
            <WeatherDetails current={report.current} delay={320} />
            <AirQualityCard
              air={air.air}
              loading={air.status === "loading"}
              failure={air.failure}
              onRetry={air.reload}
              delay={400}
            />
            <SunriseSunset sun={report.sun} currentTime={report.current.time} delay={480} />

            <SectionCard title="Appearance" delay={560}>
              <ThemeModeSelector />
            </SectionCard>

            <Text style={[styles.updated, { color: colors.textSecondary }]}>
              Data from {formatDeviceDateTime(weather.savedAt ?? report.fetchedAt)}
            </Text>
            <Text style={[styles.updated, { color: colors.textSecondary }]}>
              Weather and air quality data: Open-Meteo.com, licensed under CC BY 4.0.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 16,
  },
  stack: {
    gap: 16,
  },
  updated: {
    fontSize: 12,
    textAlign: "center",
  },
});
