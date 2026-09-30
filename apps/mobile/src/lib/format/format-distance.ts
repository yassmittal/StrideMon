import { metersToKilometers } from '@stridemon/shared/units'

// Under a kilometer, whole meters read better than "0.84 km".
const METERS_SHOWN_BELOW = 1000

/** `842 m` under a kilometer, `1.23 km` from there up. */
export function formatDistance(distanceMeters: number): string {
  const nonNegativeDistanceMeters = Math.max(0, distanceMeters)
  if (nonNegativeDistanceMeters < METERS_SHOWN_BELOW) {
    return `${Math.floor(nonNegativeDistanceMeters)} m`
  }
  return `${metersToKilometers(nonNegativeDistanceMeters).toFixed(2)} km`
}
