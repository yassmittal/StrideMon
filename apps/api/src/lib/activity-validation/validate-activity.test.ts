import { describe, expect, it } from 'bun:test'
import {
  buildTrace,
  buildWalkingTrace,
  type TraceLeg,
} from '../../test-support/build-synthetic-trace'
import { type ActivityValidationOutcome, validateActivity } from './validate-activity'
import type { ValidationSample } from './validation-sample'

const STARTED_AT = new Date('2026-09-29T06:00:00Z')
const FINISH_DELAY_MILLISECONDS = 5_000

describe('validateActivity (conventions/testing.md cases)', () => {
  it('counts a steady 10-minute walk at 5 km/h as 10 active minutes', () => {
    const validationResult = expectAccepted(
      validateTrace(
        buildWalkingTrace({
          durationSeconds: 600,
          speedKilometersPerHour: 5,
          startedAt: STARTED_AT,
        }),
      ),
    )

    expect(validationResult.activeMinutes).toBe(10)
    expect(validationResult.averageSpeedKilometersPerHour).toBe(5)
    expect(validationResult.warnings).toEqual([])
  })

  it('counts a 50 km/h car trip as 0 active minutes', () => {
    const validationResult = expectAccepted(
      validateTrace(
        buildWalkingTrace({
          durationSeconds: 600,
          speedKilometersPerHour: 50,
          startedAt: STARTED_AT,
        }),
      ),
    )

    expect(validationResult.activeMinutes).toBe(0)
    expect(validationResult.distanceMeters).toBe(0)
    expect(validationResult.averageSpeedKilometersPerHour).toBe(0)
    // Every 3 s hop is over the 40 km/h teleport limit, so all of it is ignored as jumps.
    // `vehicleSpeedDetected` is for minutes between 20 and 40 km/h (see the bike test).
    expect(validationResult.warnings).toEqual(['teleportDetected'])
  })

  it('drops a teleport jump in the middle and still counts the rest of the walk', () => {
    const validationResult = expectAccepted(
      validateLegs([
        { durationSeconds: 300, speedKilometersPerHour: 5 },
        { durationSeconds: 3, speedKilometersPerHour: 6_000 },
        { durationSeconds: 297, speedKilometersPerHour: 5 },
      ]),
    )

    expect(validationResult.activeMinutes).toBe(10)
    // The 5 km hop isn't in the distance: 597 s at 5 km/h is about 829 m.
    expect(validationResult.distanceMeters).toBe(829)
    expect(validationResult.warnings).toEqual(['teleportDetected'])
  })

  it('rejects a session with a mocked location', () => {
    const samples = buildWalkingTrace({
      durationSeconds: 600,
      speedKilometersPerHour: 5,
      startedAt: STARTED_AT,
    })
    const mockedSamples = samples.map((sample, index) =>
      index === 100 ? { ...sample, isMockedLocation: true } : sample,
    )

    expect(validateTrace(mockedSamples)).toEqual({
      outcome: 'rejected',
      rejectionReason: 'MOCK_LOCATION_DETECTED',
    })
  })

  it('drops samples from a clock set into the future, and reports it', () => {
    const samples = buildWalkingTrace({
      durationSeconds: 600,
      speedKilometersPerHour: 5,
      startedAt: STARTED_AT,
    })
    const futureSamples = samples.map((sample) =>
      sample.sequenceNumber >= 190
        ? { ...sample, receivedAt: new Date(sample.recordedAt.getTime() - 5 * 60_000) }
        : sample,
    )

    const validationResult = expectAccepted(validateTrace(futureSamples))

    expect(validationResult.rejectedSampleCount).toBe(11)
    expect(validationResult.warnings).toContain('deviceClockMismatch')
    expect(validationResult.activeMinutes).toBe(9)
  })

  it('doesn’t count a full minute of standing still inside a walk', () => {
    const validationResult = expectAccepted(
      validateLegs([
        { durationSeconds: 240, speedKilometersPerHour: 5 },
        { durationSeconds: 60, speedKilometersPerHour: 0 },
        { durationSeconds: 300, speedKilometersPerHour: 5 },
      ]),
    )

    expect(validationResult.activeMinutes).toBe(9)
  })

  it('still counts a minute with 30 s of standing, since its average stays in the band (D-021)', () => {
    const validationResult = expectAccepted(
      validateLegs([
        { durationSeconds: 270, speedKilometersPerHour: 5 },
        { durationSeconds: 30, speedKilometersPerHour: 0 },
        { durationSeconds: 300, speedKilometersPerHour: 5 },
      ]),
    )

    expect(validationResult.activeMinutes).toBe(10)
  })
})

describe('validateActivity (every rule in security.md)', () => {
  it('measures a known 1 km route within 1%', () => {
    // 12 minutes at 5 km/h is exactly 1,000 m.
    const validationResult = expectAccepted(
      validateTrace(
        buildWalkingTrace({
          durationSeconds: 720,
          speedKilometersPerHour: 5,
          startedAt: STARTED_AT,
        }),
      ),
    )

    expect(validationResult.activeMinutes).toBe(12)
    expect(Math.abs(validationResult.distanceMeters - 1_000)).toBeLessThanOrEqual(10)
  })

  it('counts a run at 15 km/h', () => {
    const validationResult = expectAccepted(
      validateTrace(
        buildWalkingTrace({
          durationSeconds: 300,
          speedKilometersPerHour: 15,
          startedAt: STARTED_AT,
        }),
      ),
    )

    expect(validationResult.activeMinutes).toBe(5)
  })

  it('doesn’t count a 25 km/h bike ride, though it isn’t fast enough to be a teleport', () => {
    const validationResult = expectAccepted(
      validateTrace(
        buildWalkingTrace({
          durationSeconds: 300,
          speedKilometersPerHour: 25,
          startedAt: STARTED_AT,
        }),
      ),
    )

    expect(validationResult.activeMinutes).toBe(0)
    expect(validationResult.warnings).toEqual(['vehicleSpeedDetected'])
  })

  it('doesn’t count a stroll under 1 km/h, and raises no warning for it', () => {
    const validationResult = expectAccepted(
      validateTrace(
        buildWalkingTrace({
          durationSeconds: 300,
          speedKilometersPerHour: 0.5,
          startedAt: STARTED_AT,
        }),
      ),
    )

    expect(validationResult.activeMinutes).toBe(0)
    expect(validationResult.warnings).toEqual([])
  })

  it('doesn’t count the minutes a sampling gap over 60 s touches', () => {
    const validationResult = expectAccepted(
      validateLegs([
        { durationSeconds: 120, speedKilometersPerHour: 5 },
        { durationSeconds: 90, speedKilometersPerHour: 5, sampleIntervalSeconds: 90 },
        { durationSeconds: 270, speedKilometersPerHour: 5 },
      ]),
    )

    // 8 whole minutes; the gap from 120 s to 210 s touches minutes 2 and 3.
    expect(validationResult.activeMinutes).toBe(6)
    expect(validationResult.warnings).toEqual(['samplingGap'])
  })

  it('ignores inaccurate fixes and reports low GPS accuracy', () => {
    const samples = buildWalkingTrace({
      durationSeconds: 600,
      speedKilometersPerHour: 5,
      startedAt: STARTED_AT,
    })
    const noisySamples = samples.map((sample) =>
      sample.sequenceNumber % 10 === 5 ? { ...sample, accuracyMeters: 120 } : sample,
    )

    const validationResult = expectAccepted(validateTrace(noisySamples))

    expect(validationResult.activeMinutes).toBe(10)
    expect(validationResult.rejectedSampleCount).toBe(20)
    expect(validationResult.warnings).toEqual(['lowGpsAccuracy'])
  })

  it('ignores samples past 4 hours and reports the session as too long', () => {
    const samples = buildWalkingTrace({
      durationSeconds: 4 * 3600 + 300,
      speedKilometersPerHour: 5,
      sampleIntervalSeconds: 10,
      startedAt: STARTED_AT,
    })

    const validationResult = expectAccepted(validateTrace(samples))

    // Samples count up to 4 h + 60 s of clock tolerance: 241 whole minutes.
    expect(validationResult.activeMinutes).toBe(241)
    expect(validationResult.warnings).toEqual(['sessionTooLong'])
  })

  it('rejects a session with fewer than 10 valid samples', () => {
    const samples = buildWalkingTrace({
      durationSeconds: 24,
      speedKilometersPerHour: 5,
      startedAt: STARTED_AT,
    })
    expect(samples).toHaveLength(9)

    expect(validateTrace(samples)).toEqual({
      outcome: 'rejected',
      rejectionReason: 'INSUFFICIENT_ACTIVITY_DATA',
    })
  })

  it('accepts exactly 10 valid samples', () => {
    const samples = buildWalkingTrace({
      durationSeconds: 27,
      speedKilometersPerHour: 5,
      startedAt: STARTED_AT,
    })
    expect(samples).toHaveLength(10)

    expect(validateTrace(samples).outcome).toBe('accepted')
  })

  it('counts only valid samples toward the minimum of 10', () => {
    const samples = buildWalkingTrace({
      durationSeconds: 60,
      speedKilometersPerHour: 5,
      accuracyMeters: 200,
      startedAt: STARTED_AT,
    })

    expect(validateTrace(samples)).toEqual({
      outcome: 'rejected',
      rejectionReason: 'INSUFFICIENT_ACTIVITY_DATA',
    })
  })

  it('rejects a session with no samples at all', () => {
    expect(validateTrace([])).toEqual({
      outcome: 'rejected',
      rejectionReason: 'INSUFFICIENT_ACTIVITY_DATA',
    })
  })

  it('gives the same answer every time for the same samples', () => {
    const samples = buildWalkingTrace({
      durationSeconds: 600,
      speedKilometersPerHour: 5,
      startedAt: STARTED_AT,
    })

    expect(validateTrace(samples)).toEqual(validateTrace(samples))
  })
})

function validateLegs(legs: TraceLeg[]): ActivityValidationOutcome {
  return validateTrace(buildTrace({ legs, startedAt: STARTED_AT }))
}

function validateTrace(samples: ValidationSample[]): ActivityValidationOutcome {
  const lastRecordedAt = samples.at(-1)?.recordedAt ?? STARTED_AT
  return validateActivity({
    samples,
    startedAt: STARTED_AT,
    finishedAt: new Date(lastRecordedAt.getTime() + FINISH_DELAY_MILLISECONDS),
  })
}

function expectAccepted(validationOutcome: ActivityValidationOutcome) {
  if (validationOutcome.outcome !== 'accepted') {
    throw new Error(`Expected the session to be accepted, got ${JSON.stringify(validationOutcome)}`)
  }
  return validationOutcome.validationResult
}
