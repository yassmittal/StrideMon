import { describe, expect, it } from 'bun:test'
import { calculateHaversineDistanceMeters } from './haversine-distance'

describe('calculateHaversineDistanceMeters', () => {
  it('is zero between a point and itself', () => {
    const point = { latitude: 26.9124, longitude: 75.7873 }

    expect(calculateHaversineDistanceMeters(point, point)).toBe(0)
  })

  it('measures one degree of latitude as about 111.2 km', () => {
    const distanceMeters = calculateHaversineDistanceMeters(
      { latitude: 0, longitude: 0 },
      { latitude: 1, longitude: 0 },
    )

    expect(distanceMeters).toBeCloseTo(111_195, -1)
  })

  it('measures a quarter meridian, equator to pole, as π/2 × the mean Earth radius', () => {
    const distanceMeters = calculateHaversineDistanceMeters(
      { latitude: 0, longitude: 0 },
      { latitude: 90, longitude: 0 },
    )

    expect(distanceMeters).toBeCloseTo((Math.PI / 2) * 6_371_008.8, 3)
  })

  it('measures a short east-west step at the equator like the arc length', () => {
    const tenMicroDegrees = 0.00001
    const distanceMeters = calculateHaversineDistanceMeters(
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: tenMicroDegrees },
    )

    expect(distanceMeters).toBeCloseTo(6_371_008.8 * tenMicroDegrees * (Math.PI / 180), 6)
  })

  it('is the same in both directions', () => {
    const jaipur = { latitude: 26.9124, longitude: 75.7873 }
    const delhi = { latitude: 28.6139, longitude: 77.209 }

    expect(calculateHaversineDistanceMeters(jaipur, delhi)).toBeCloseTo(
      calculateHaversineDistanceMeters(delhi, jaipur),
      6,
    )
  })
})
