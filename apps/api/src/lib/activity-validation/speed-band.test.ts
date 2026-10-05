import { describe, expect, it } from 'bun:test'
import { calculateSpeedKilometersPerHour, classifyMinuteSpeed, isTeleportSpeed } from './speed-band'

describe('classifyMinuteSpeed', () => {
  it('counts 1 and 20 km/h, the edges of the band, as active', () => {
    expect(classifyMinuteSpeed(1)).toBe('active')
    expect(classifyMinuteSpeed(20)).toBe('active')
  })

  it('calls anything under 1 km/h idle', () => {
    expect(classifyMinuteSpeed(0.99)).toBe('idle')
  })

  it('calls anything over 20 km/h a vehicle', () => {
    expect(classifyMinuteSpeed(20.01)).toBe('vehicle')
  })
})

describe('isTeleportSpeed', () => {
  it('treats an implied speed over 40 km/h as a jump, and 40 km/h itself as movement', () => {
    expect(isTeleportSpeed(40)).toBe(false)
    expect(isTeleportSpeed(40.01)).toBe(true)
  })
})

describe('calculateSpeedKilometersPerHour', () => {
  it('turns 1 km in 12 minutes into 5 km/h', () => {
    expect(
      calculateSpeedKilometersPerHour({ distanceMeters: 1_000, durationSeconds: 720 }),
    ).toBeCloseTo(5, 10)
  })

  it('is 0 for no time, instead of dividing by zero', () => {
    expect(calculateSpeedKilometersPerHour({ distanceMeters: 5, durationSeconds: 0 })).toBe(0)
  })
})
