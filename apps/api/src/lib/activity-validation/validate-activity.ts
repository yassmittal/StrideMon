import type { ActivityValidationResult } from '@stridemon/shared/api-contracts'
import {
  ACTIVITY_VALIDATION_WARNINGS,
  type ActivitySessionRejectionReason,
  type ActivityValidationWarning,
} from '@stridemon/shared/domain'
import { bucketSamplesIntoMinutes, type MinuteBucket } from './bucket-samples-into-minutes'
import {
  countDroppedSamples,
  type DroppedSampleCounts,
  filterPlausibleSamples,
} from './filter-plausible-samples'
import { calculateSpeedKilometersPerHour, classifyMinuteSpeed } from './speed-band'
import type { ValidationSample } from './validation-sample'

// security.md → Activity validation → Too little data.
const MINIMUM_VALID_SAMPLE_COUNT = 10

// Two decimals of km/h: finer than GPS can measure, coarse enough to read.
const AVERAGE_SPEED_DECIMAL_FACTOR = 100

export type ActivityValidationOutcome =
  | { outcome: 'accepted'; validationResult: ActivityValidationResult }
  | { outcome: 'rejected'; rejectionReason: ActivitySessionRejectionReason }

/**
 * Decides whether a run was real and how much of it counts. Applies every rule in
 * security.md → Activity validation, in its table's order, and reports
 * `activeMinutes` and `distanceMeters` for settlement. Pure: same samples in,
 * same answer out, so a retried finish validates identically.
 */
export function validateActivity({
  samples,
  startedAt,
  finishedAt,
}: {
  samples: readonly ValidationSample[]
  startedAt: Date
  finishedAt: Date
}): ActivityValidationOutcome {
  if (samples.some((sample) => sample.isMockedLocation)) {
    return { outcome: 'rejected', rejectionReason: 'MOCK_LOCATION_DETECTED' }
  }

  const { plausibleSamples, droppedSampleCounts } = filterPlausibleSamples({
    samples,
    startedAt,
    finishedAt,
  })
  if (plausibleSamples.length < MINIMUM_VALID_SAMPLE_COUNT) {
    return { outcome: 'rejected', rejectionReason: 'INSUFFICIENT_ACTIVITY_DATA' }
  }

  const { minuteBuckets, teleportSegmentCount } = bucketSamplesIntoMinutes(plausibleSamples)
  const minuteTally = tallyMinutes(minuteBuckets)
  const raisedWarnings = new Set<ActivityValidationWarning>([
    ...listSampleWarnings(droppedSampleCounts),
    ...(teleportSegmentCount > 0 ? (['teleportDetected'] as const) : []),
    ...(minuteTally.hasSamplingGap ? (['samplingGap'] as const) : []),
    ...(minuteTally.vehicleMinuteCount > 0 ? (['vehicleSpeedDetected'] as const) : []),
  ])

  return {
    outcome: 'accepted',
    validationResult: {
      activeMinutes: minuteTally.activeMinutes,
      distanceMeters: Math.round(minuteTally.activeDistanceMeters),
      averageSpeedKilometersPerHour: roundAverageSpeed(
        calculateSpeedKilometersPerHour({
          distanceMeters: minuteTally.activeDistanceMeters,
          durationSeconds: minuteTally.activeSeconds,
        }),
      ),
      rejectedSampleCount: countDroppedSamples(droppedSampleCounts),
      // In the declared order, so the same run always lists its warnings the same way.
      warnings: ACTIVITY_VALIDATION_WARNINGS.filter((warning) => raisedWarnings.has(warning)),
    },
  }
}

type MinuteTally = {
  activeMinutes: number
  activeDistanceMeters: number
  activeSeconds: number
  vehicleMinuteCount: number
  hasSamplingGap: boolean
}

function tallyMinutes(minuteBuckets: readonly MinuteBucket[]): MinuteTally {
  const minuteTally: MinuteTally = {
    activeMinutes: 0,
    activeDistanceMeters: 0,
    activeSeconds: 0,
    vehicleMinuteCount: 0,
    hasSamplingGap: false,
  }
  for (const minuteBucket of minuteBuckets) {
    if (minuteBucket.hasSamplingGap) {
      minuteTally.hasSamplingGap = true
      continue
    }
    const minuteSpeedClass = classifyMinuteSpeed(
      calculateSpeedKilometersPerHour({
        distanceMeters: minuteBucket.countedDistanceMeters,
        durationSeconds: minuteBucket.countedSeconds,
      }),
    )
    if (minuteSpeedClass === 'vehicle') minuteTally.vehicleMinuteCount += 1
    if (minuteSpeedClass !== 'active') continue

    minuteTally.activeMinutes += 1
    minuteTally.activeDistanceMeters += minuteBucket.countedDistanceMeters
    minuteTally.activeSeconds += minuteBucket.countedSeconds
  }
  return minuteTally
}

function listSampleWarnings(droppedSampleCounts: DroppedSampleCounts): ActivityValidationWarning[] {
  const warnings: ActivityValidationWarning[] = []
  if (droppedSampleCounts.inaccurate > 0) warnings.push('lowGpsAccuracy')
  const clockMismatchCount =
    droppedSampleCounts.recordedInFuture +
    droppedSampleCounts.outsideSession +
    droppedSampleCounts.outOfOrder
  if (clockMismatchCount > 0) warnings.push('deviceClockMismatch')
  if (droppedSampleCounts.afterMaximumDuration > 0) warnings.push('sessionTooLong')
  return warnings
}

function roundAverageSpeed(speedKilometersPerHour: number): number {
  return (
    Math.round(speedKilometersPerHour * AVERAGE_SPEED_DECIMAL_FACTOR) / AVERAGE_SPEED_DECIMAL_FACTOR
  )
}
