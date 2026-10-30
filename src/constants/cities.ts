import type { GeoCoordinates } from "@/types/location";

export type MajorCity = {
  id: string;
  name: string;
  region: string;
  coordinates: GeoCoordinates;
};

// Map markers for weather exploration. Coordinates are city-centre points.
export const MAJOR_CITIES: readonly MajorCity[] = [
  { id: "new-delhi", name: "New Delhi", region: "Delhi", coordinates: { latitude: 28.6139, longitude: 77.209 } },
  { id: "mumbai", name: "Mumbai", region: "Maharashtra", coordinates: { latitude: 19.076, longitude: 72.8777 } },
  { id: "bengaluru", name: "Bengaluru", region: "Karnataka", coordinates: { latitude: 12.9716, longitude: 77.5946 } },
  { id: "hyderabad", name: "Hyderabad", region: "Telangana", coordinates: { latitude: 17.385, longitude: 78.4867 } },
  { id: "chennai", name: "Chennai", region: "Tamil Nadu", coordinates: { latitude: 13.0827, longitude: 80.2707 } },
  { id: "kolkata", name: "Kolkata", region: "West Bengal", coordinates: { latitude: 22.5726, longitude: 88.3639 } },
  { id: "pune", name: "Pune", region: "Maharashtra", coordinates: { latitude: 18.5204, longitude: 73.8567 } },
  { id: "jaipur", name: "Jaipur", region: "Rajasthan", coordinates: { latitude: 26.9124, longitude: 75.7873 } },
  { id: "lucknow", name: "Lucknow", region: "Uttar Pradesh", coordinates: { latitude: 26.8467, longitude: 80.9462 } },
  { id: "patna", name: "Patna", region: "Bihar", coordinates: { latitude: 25.5941, longitude: 85.1376 } },
  { id: "bhopal", name: "Bhopal", region: "Madhya Pradesh", coordinates: { latitude: 23.2599, longitude: 77.4126 } },
  { id: "ahmedabad", name: "Ahmedabad", region: "Gujarat", coordinates: { latitude: 23.0225, longitude: 72.5714 } },
  { id: "chandigarh", name: "Chandigarh", region: "Chandigarh", coordinates: { latitude: 30.7333, longitude: 76.7794 } },
  { id: "guwahati", name: "Guwahati", region: "Assam", coordinates: { latitude: 26.1445, longitude: 91.7362 } },
  { id: "kochi", name: "Kochi", region: "Kerala", coordinates: { latitude: 9.9312, longitude: 76.2673 } },
  { id: "begusarai", name: "Begusarai", region: "Bihar", coordinates: { latitude: 25.4182, longitude: 86.1272 } },
];
