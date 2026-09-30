import { describe, expect, it } from 'bun:test'
import { buildTrace, buildWalkingTrace } from '../../test-support/build-synthetic-trace'
import { bucketSamplesIntoMinutes } from './bucket-samples-into-minutes'

const STARTED_AT = new Date('2026-09-29T06:00:00Z')
// 5 km/h for one minute.
const METERS_PER_MINUTE_AT_5_KILOMETERS_PER_HOUR = 5_000 / 60

describe('bucketSamplesIntoMinutes', () => {
  it('cuts a 10-minute walk into 10 whole minutes of equal distance', () => {
    const samples = buildWalkingTrace({
      durationSeconds: 600,
      speedKilometersPerHour: 5,
      startedAt: STARTED_AT,
    })

    const { minuteBuckets } = bucketSamplesIntoMinutes(samples)

    expect(minuteBuckets).toHaveLength(10)
    for (const minuteBucket of minuteBuckets) {
      expect(minuteBucket.countedSeconds).toBeCloseTo(60, 6)
      expect(minuteBucket.countedDistanceMeters).toBeCloseTo(
        METERS_PER_MINUTE_AT_5_KILOMETERS_PER_HOUR,
        3,
      )
      expect(minuteBucket.hasSamplingGap).toBe(false)
    }
  })

  it('leaves out a trailing partial minute', () => {
    const samples = buildWalkingTrace({
      durationSeconds: 150,
      speedKilometersPerHour: 5,
      startedAt: STARTED_AT,
    })

    expect(bucketSamplesIntoMinutes(samples).minuteBuckets).toHaveLength(2)
  })

  it('splits a segment that crosses a minute boundary by time', () => {
    // Fixes at 0, 50 and 70 s, then on to 120 s: the 50→70 s segment is half in each minute.
    const samples = buildTrace({
      legs: [
        { durationSeconds: 50, speedKilometersPerHour: 5, sampleIntervalSeconds: 50 },
        { durationSeconds: 20, speedKilometersPerHour: 5, sampleIntervalSeconds: 20 },
        { durationSeconds: 50, speedKilometersPerHour: 5, sampleIntervalSeconds: 50 },
      ],
      startedAt: STARTED_AT,
    })

    const { minuteBuckets } = bucketSamplesIntoMinutes(samples)

    expect(minuteBuckets.map((minuteBucket) => minuteBucket.countedSeconds)).toEqual([60, 60])
    expect(minuteBuckets[0]!.countedDistanceMeters).toBeCloseTo(
      METERS_PER_MINUTE_AT_5_KILOMETERS_PER_HOUR,
      3,
    )
  })

  it('marks every minute a silence longer than 60 s touches', () => {
    const samples = buildTrace({
      legs: [
        { durationSeconds: 60, speedKilometersPerHour: 5 },
        { durationSeconds: 90, speedKilometersPerHour: 5, sampleIntervalSeconds: 90 },
        { durationSeconds: 90, speedKilometersPerHour: 5 },
      ],
      startedAt: STARTED_AT,
    })

    const { minuteBuckets } = bucketSamplesIntoMinutes(samples)

    // The gap runs from 60 s to 150 s: minutes 1 and 2.
    expect(minuteBuckets.map((minuteBucket) => minuteBucket.hasSamplingGap)).toEqual([
      false,
      true,
      true,
      false,
    ])
  })

  it('treats exactly 60 s between fixes as sampling, not a gap', () => {
    const samples = buildWalkingTrace({
      durationSeconds: 180,
      speedKilometersPerHour: 5,
      sampleIntervalSeconds: 60,
      startedAt: STARTED_AT,
    })

    const { minuteBuckets } = bucketSamplesIntoMinutes(samples)

    expect(minuteBuckets.some((minuteBucket) => minuteBucket.hasSamplingGap)).toBe(false)
  })

  it('counts a teleport and leaves its distance and time out of the minute', () => {
    const samples = buildTrace({
      legs: [
        { durationSeconds: 30, speedKilometersPerHour: 5 },
        // One 3 s hop of 5 km: 6,000 km/h.
        { durationSeconds: 3, speedKilometersPerHour: 6_000 },
        { durationSeconds: 27, speedKilometersPerHour: 5 },
      ],
      startedAt: STARTED_AT,
    })

    const { minuteBuckets, teleportSegmentCount } = bucketSamplesIntoMinutes(samples)

    expect(teleportSegmentCount).toBe(1)
    expect(minuteBuckets[0]!.countedSeconds).toBeCloseTo(57, 6)
    expect(minuteBuckets[0]!.countedDistanceMeters).toBeCloseTo((5_000 / 3600) * 57, 3)
  })

  it('returns no minutes for no samples', () => {
    expect(bucketSamplesIntoMinutes([])).toEqual({ minuteBuckets: [], teleportSegmentCount: 0 })
  })
})
