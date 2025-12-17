// backend/src/domain/simulator/geo/canadaLocations.ts
export type CanadianCity = {
  city: string;
  lat: number;
  lng: number;
  weight: number;
};

export const CANADIAN_CITIES: CanadianCity[] = [
  { city: "Toronto", lat: 43.65107, lng: -79.347015, weight: 18 },
  { city: "Montreal", lat: 45.50189, lng: -73.56739, weight: 16 },
  { city: "Vancouver", lat: 49.28273, lng: -123.120735, weight: 10 },
  { city: "Calgary", lat: 51.04427, lng: -114.062019, weight: 8 },
  { city: "Edmonton", lat: 53.546124, lng: -113.493823, weight: 7 },
  { city: "Ottawa", lat: 45.42153, lng: -75.697193, weight: 6 },
  { city: "Winnipeg", lat: 49.895077, lng: -97.138451, weight: 5 },
  { city: "Halifax", lat: 44.6488, lng: -63.57524, weight: 3 },
  { city: "Quebec City", lat: 46.813878, lng: -71.207981, weight: 3 },
  { city: "Saskatoon", lat: 52.133214, lng: -106.670046, weight: 2 },
  { city: "Regina", lat: 50.44521, lng: -104.618896, weight: 2 },
];

export function pickRandomCanadianCityWeighted() {
  const totalWeight = CANADIAN_CITIES.reduce((sum, c) => sum + c.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const city of CANADIAN_CITIES) {
    roll -= city.weight;
    if (roll <= 0) {
      return { city: city.city, lat: city.lat, lng: city.lng };
    }
  }

  const fallback = CANADIAN_CITIES[0];
  return { city: fallback.city, lat: fallback.lat, lng: fallback.lng };
}
