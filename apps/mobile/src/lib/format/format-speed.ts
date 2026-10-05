/** `5.2 km/h`. One decimal is as precise as phone GPS speed gets. */
export function formatSpeed(speedKilometersPerHour: number): string {
  return `${Math.max(0, speedKilometersPerHour).toFixed(1)} km/h`
}
