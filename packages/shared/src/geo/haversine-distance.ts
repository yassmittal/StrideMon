/** A point on Earth in decimal degrees (WGS 84, as GPS reports it). */
export type GeoPoint = {
  latitude: number
  longitude: number
}

// The mean Earth radius (IUGG). A sphere is within about 0.5% of the ellipsoid,
// which is far below GPS noise at walking scale.
const EARTH_MEAN_RADIUS_METERS = 6_371_008.8
const RADIANS_PER_DEGREE = Math.PI / 180

/**
 * The great-circle distance between two points, in meters. Used by the API's
 * activity validation and by the app's live run estimate, so both measure alike.
 */
export function calculateHaversineDistanceMeters(from: GeoPoint, to: GeoPoint): number {
  const fromLatitudeRadians = from.latitude * RADIANS_PER_DEGREE
  const toLatitudeRadians = to.latitude * RADIANS_PER_DEGREE
  const latitudeDeltaRadians = toLatitudeRadians - fromLatitudeRadians
  const longitudeDeltaRadians = (to.longitude - from.longitude) * RADIANS_PER_DEGREE

  const haversineOfCentralAngle =
    Math.sin(latitudeDeltaRadians / 2) ** 2 +
    Math.cos(fromLatitudeRadians) *
      Math.cos(toLatitudeRadians) *
      Math.sin(longitudeDeltaRadians / 2) ** 2
  const centralAngleRadians = 2 * Math.asin(Math.min(1, Math.sqrt(haversineOfCentralAngle)))
  return EARTH_MEAN_RADIUS_METERS * centralAngleRadians
}
