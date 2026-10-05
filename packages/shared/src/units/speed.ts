// 1 m/s = 3600 s/h ÷ 1000 m/km = 3.6 km/h.
const KILOMETERS_PER_HOUR_PER_METER_PER_SECOND = 3.6

export function metersPerSecondToKilometersPerHour(speedMetersPerSecond: number): number {
  return speedMetersPerSecond * KILOMETERS_PER_HOUR_PER_METER_PER_SECOND
}
