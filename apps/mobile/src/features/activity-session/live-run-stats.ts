import { estimateLiveReward, type GameConfig } from '@stridemon/shared/game-rules'
import { calculateHaversineDistanceMeters } from '@stridemon/shared/geo'
import { metersPerSecondToKilometersPerHour } from '@stridemon/shared/units'
import type { BufferedLocationSample } from './location-tracking/location-sample-buffer'

// Mirrors the API's plausibility and teleport rules (security.md → Activity validation),
// so the live distance is close to what validation will report. Estimates only.
const MAXIMUM_SAMPLE_ACCURACY_METERS = 50
const TELEPORT_SPEED_KILOMETERS_PER_HOUR = 40
// A speed older than this says nothing about now (the player may have stopped).
const CURRENT_SPEED_MAXIMUM_AGE_MILLISECONDS = 15_000
const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60

export type LiveRunStats = {
  elapsedSeconds: number
  distanceMeters: number
  /** `null` until there's a recent fix with a speed. */
  currentSpeedKilometersPerHour: number | null
  /** Energy the run hasn't used yet, if every elapsed minute counts. */
  estimatedEnergyLeft: number
  estimatedRewardWei: bigint
  recordedSampleCount: number
}

/**
 * What the live run screen shows, from the buffered fixes. Labelled "estimated"
 * in the UI: validation (distance, active minutes) and the contract (reward)
 * decide the real numbers.
 */
export function calculateLiveRunStats({
  samples,
  startedAtMilliseconds,
  nowMilliseconds,
  efficiency,
  energyAtStart,
  gameConfig,
}: {
  samples: readonly BufferedLocationSample[]
  startedAtMilliseconds: number
  nowMilliseconds: number
  efficiency: number
  energyAtStart: number
  gameConfig: GameConfig
}): LiveRunStats {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((nowMilliseconds - startedAtMilliseconds) / MILLISECONDS_PER_SECOND),
  )
  const elapsedWholeMinutes = Math.floor(elapsedSeconds / SECONDS_PER_MINUTE)
  return {
    elapsedSeconds,
    distanceMeters: calculatePlausibleDistanceMeters(samples),
    currentSpeedKilometersPerHour: readCurrentSpeedKilometersPerHour(samples, nowMilliseconds),
    estimatedEnergyLeft: Math.max(0, energyAtStart - elapsedWholeMinutes),
    estimatedRewardWei: estimateLiveReward({
      elapsedActiveSeconds: elapsedSeconds,
      efficiency,
      currentEnergy: energyAtStart,
      gameConfig,
    }),
    recordedSampleCount: samples.length,
  }
}

function calculatePlausibleDistanceMeters(samples: readonly BufferedLocationSample[]): number {
  let distanceMeters = 0
  let previousSample: BufferedLocationSample | null = null
  for (const sample of samples) {
    if (!isAccurateEnough(sample)) continue
    if (
      previousSample !== null &&
      sample.recordedAtMilliseconds > previousSample.recordedAtMilliseconds
    ) {
      const segmentDistanceMeters = calculateHaversineDistanceMeters(previousSample, sample)
      const segmentSeconds =
        (sample.recordedAtMilliseconds - previousSample.recordedAtMilliseconds) /
        MILLISECONDS_PER_SECOND
      const segmentSpeedKilometersPerHour = metersPerSecondToKilometersPerHour(
        segmentDistanceMeters / segmentSeconds,
      )
      if (segmentSpeedKilometersPerHour <= TELEPORT_SPEED_KILOMETERS_PER_HOUR) {
        distanceMeters += segmentDistanceMeters
      }
    }
    previousSample = sample
  }
  return distanceMeters
}

function readCurrentSpeedKilometersPerHour(
  samples: readonly BufferedLocationSample[],
  nowMilliseconds: number,
): number | null {
  const latestSample = samples.at(-1)
  if (latestSample === undefined) return null
  if (
    nowMilliseconds - latestSample.recordedAtMilliseconds >
    CURRENT_SPEED_MAXIMUM_AGE_MILLISECONDS
  ) {
    return null
  }
  // iOS reports -1 when it has no speed.
  if (latestSample.speedMetersPerSecond === null || latestSample.speedMetersPerSecond < 0) {
    return null
  }
  return metersPerSecondToKilometersPerHour(latestSample.speedMetersPerSecond)
}

function isAccurateEnough(sample: BufferedLocationSample): boolean {
  return sample.accuracyMeters !== null && sample.accuracyMeters <= MAXIMUM_SAMPLE_ACCURACY_METERS
}
