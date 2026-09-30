import { FIXTURE_GAME_CONFIG } from '@stridemon/shared/game-rules/fixtures'
import { calculateLiveRunStats } from './live-run-stats'
import type { BufferedLocationSample } from './location-tracking/location-sample-buffer'

const STARTED_AT_MILLISECONDS = Date.parse('2026-09-29T06:00:00Z')
// Moving due north, one degree of latitude on the haversine sphere.
const METERS_PER_DEGREE_OF_LATITUDE = (6_371_008.8 * Math.PI) / 180

/** A walk due north: one fix every 3 s, `metersPerFix` apart. */
function buildWalk({
  fixCount,
  metersPerFix,
  accuracyMeters = 8,
}: {
  fixCount: number
  metersPerFix: number
  accuracyMeters?: number | null
}): BufferedLocationSample[] {
  return Array.from({ length: fixCount }, (_, index) => ({
    sequenceNumber: index,
    recordedAtMilliseconds: STARTED_AT_MILLISECONDS + index * 3_000,
    latitude: 26.8923 + (index * metersPerFix) / METERS_PER_DEGREE_OF_LATITUDE,
    longitude: 75.8042,
    accuracyMeters,
    speedMetersPerSecond: metersPerFix / 3,
    isMockedLocation: false,
  }))
}

function calculateStats(samples: BufferedLocationSample[], elapsedSeconds: number) {
  return calculateLiveRunStats({
    samples,
    startedAtMilliseconds: STARTED_AT_MILLISECONDS,
    nowMilliseconds: STARTED_AT_MILLISECONDS + elapsedSeconds * 1000,
    efficiency: 10,
    energyAtStart: 10,
    gameConfig: FIXTURE_GAME_CONFIG,
  })
}

describe('calculateLiveRunStats', () => {
  it('adds up the distance between fixes', () => {
    const liveRunStats = calculateStats(buildWalk({ fixCount: 11, metersPerFix: 4 }), 30)

    expect(liveRunStats.distanceMeters).toBeCloseTo(40, 6)
    expect(liveRunStats.recordedSampleCount).toBe(11)
  })

  it('leaves out fixes less accurate than 50 m, like the server', () => {
    const walk = buildWalk({ fixCount: 11, metersPerFix: 4 })
    const noisyWalk = walk.map((sample, index) =>
      index === 5 ? { ...sample, longitude: sample.longitude + 0.01, accuracyMeters: 200 } : sample,
    )

    expect(calculateStats(noisyWalk, 30).distanceMeters).toBeCloseTo(40, 6)
  })

  it('leaves out a jump faster than 40 km/h, like the server', () => {
    const walk = buildWalk({ fixCount: 3, metersPerFix: 4 })
    const jumpedFix = {
      ...walk[2]!,
      latitude: walk[1]!.latitude + 1_000 / METERS_PER_DEGREE_OF_LATITUDE,
    }

    expect(calculateStats([walk[0]!, walk[1]!, jumpedFix], 6).distanceMeters).toBeCloseTo(4, 6)
  })

  it('counts elapsed time from the server’s start, never negative', () => {
    expect(calculateStats([], 125).elapsedSeconds).toBe(125)
    expect(calculateStats([], -5).elapsedSeconds).toBe(0)
  })

  it('shows the latest fix’s speed in km/h, and nothing once it’s stale', () => {
    const walk = buildWalk({ fixCount: 5, metersPerFix: 4.5 })
    const lastFixSecond = 12

    expect(calculateStats(walk, lastFixSecond + 1).currentSpeedKilometersPerHour).toBeCloseTo(
      5.4,
      6,
    )
    expect(calculateStats(walk, lastFixSecond + 16).currentSpeedKilometersPerHour).toBeNull()
  })

  it('shows no speed when the phone reported none (iOS sends -1)', () => {
    const walk = buildWalk({ fixCount: 2, metersPerFix: 4 }).map((sample) => ({
      ...sample,
      speedMetersPerSecond: -1,
    }))

    expect(calculateStats(walk, 4).currentSpeedKilometersPerHour).toBeNull()
  })

  it('estimates reward and energy from whole elapsed minutes, capped by the energy at start', () => {
    expect(calculateStats([], 59)).toMatchObject({
      estimatedRewardWei: 0n,
      estimatedEnergyLeft: 10,
    })
    expect(calculateStats([], 3 * 60)).toMatchObject({
      estimatedRewardWei: 15n * 10n ** 18n,
      estimatedEnergyLeft: 7,
    })
    expect(calculateStats([], 25 * 60)).toMatchObject({
      estimatedRewardWei: 50n * 10n ** 18n,
      estimatedEnergyLeft: 0,
    })
  })
})
