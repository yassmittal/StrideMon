import { describe, expect, it } from 'bun:test'
import { metersToKilometers } from './distance'
import { metersPerSecondToKilometersPerHour } from './speed'

describe('metersToKilometers', () => {
  it('divides by a thousand', () => {
    expect(metersToKilometers(2_500)).toBe(2.5)
  })
})

describe('metersPerSecondToKilometersPerHour', () => {
  it('turns 1 m/s into 3.6 km/h', () => {
    expect(metersPerSecondToKilometersPerHour(1)).toBeCloseTo(3.6, 10)
  })

  it('turns a 10 km/h pace back into 10 km/h', () => {
    expect(metersPerSecondToKilometersPerHour(10_000 / 3600)).toBeCloseTo(10, 10)
  })
})
