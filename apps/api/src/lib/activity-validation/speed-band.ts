import { metersPerSecondToKilometersPerHour } from '@stridemon/shared/units'

// security.md → Activity validation. Walking starts around 3 km/h and a fast runner
// holds about 20 km/h; below 1 is standing still, above 20 is a bike or a car.
export const MINIMUM_ACTIVE_SPEED_KILOMETERS_PER_HOUR = 1
export const MAXIMUM_ACTIVE_SPEED_KILOMETERS_PER_HOUR = 20
// No one covers ground on foot at this speed between two fixes: it's a GPS jump.
export const TELEPORT_SPEED_KILOMETERS_PER_HOUR = 40

export type MinuteSpeedClass = 'idle' | 'active' | 'vehicle'

export function calculateSpeedKilometersPerHour({
  distanceMeters,
  durationSeconds,
}: {
  distanceMeters: number
  durationSeconds: number
}): number {
  if (durationSeconds <= 0) return 0
  return metersPerSecondToKilometersPerHour(distanceMeters / durationSeconds)
}

/** Whether a minute's average speed earns it: 1–20 km/h inclusive is `active`. */
export function classifyMinuteSpeed(speedKilometersPerHour: number): MinuteSpeedClass {
  if (speedKilometersPerHour < MINIMUM_ACTIVE_SPEED_KILOMETERS_PER_HOUR) return 'idle'
  if (speedKilometersPerHour > MAXIMUM_ACTIVE_SPEED_KILOMETERS_PER_HOUR) return 'vehicle'
  return 'active'
}

/** Whether the implied speed between two consecutive fixes is a jump, not movement. */
export function isTeleportSpeed(speedKilometersPerHour: number): boolean {
  return speedKilometersPerHour > TELEPORT_SPEED_KILOMETERS_PER_HOUR
}
