import type { GeoCoordinates } from "@/types/location";

export type CitySearchResult = {
  id: number;
  name: string;
  coordinates: GeoCoordinates;
  region: string | null;
  country: string | null;
  countryCode: string | null;
};
