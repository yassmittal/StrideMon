import type { ValidationSample } from '../lib/activity-validation/validation-sample'

/** One stretch of a synthetic run: a steady speed due north for a while. */
export type TraceLeg = {
  durationSeconds: number
  speedKilometersPerHour: number
  /** Seconds between fixes on this leg. Defaults to the trace's interval. */
  sampleIntervalSeconds?: number
}

type BuildTraceOptions = {
  legs: readonly TraceLeg[]
  /** Time of the first fix. */
  startedAt: Date
  sampleIntervalSeconds?: number
  accuracyMeters?: number | null
  /** How long after each fix the upload reaches the server. */
  uploadDelaySeconds?: number
}

// A running track in Jaipur. Any point works; a real one keeps the numbers familiar.
const TRACE_START_POINT = { latitude: 26.8923, longitude: 75.8042 }
// Moving due north, one degree of latitude is exactly this far on the haversine sphere.
const METERS_PER_DEGREE_OF_LATITUDE = (6_371_008.8 * Math.PI) / 180
const DEFAULT_SAMPLE_INTERVAL_SECONDS = 3
const DEFAULT_ACCURACY_METERS = 8
const DEFAULT_UPLOAD_DELAY_SECONDS = 5
const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_HOUR = 3600
const METERS_PER_KILOMETER = 1000

/**
 * A synthetic GPS trace (conventions/testing.md → Activity validation tests): one fix
 * at the start, then fixes every interval along each leg in turn. Sequence numbers
 * count from 0.
 */
export function buildTrace({
  legs,
  startedAt,
  sampleIntervalSeconds = DEFAULT_SAMPLE_INTERVAL_SECONDS,
  accuracyMeters = DEFAULT_ACCURACY_METERS,
  uploadDelaySeconds = DEFAULT_UPLOAD_DELAY_SECONDS,
}: BuildTraceOptions): ValidationSample[] {
  let elapsedSeconds = 0
  let northwardMeters = 0

  const buildSample = (sequenceNumber: number): ValidationSample => {
    const recordedAtMilliseconds = startedAt.getTime() + elapsedSeconds * MILLISECONDS_PER_SECOND
    return {
      sequenceNumber,
      recordedAt: new Date(recordedAtMilliseconds),
      receivedAt: new Date(recordedAtMilliseconds + uploadDelaySeconds * MILLISECONDS_PER_SECOND),
      latitude: TRACE_START_POINT.latitude + northwardMeters / METERS_PER_DEGREE_OF_LATITUDE,
      longitude: TRACE_START_POINT.longitude,
      accuracyMeters,
      isMockedLocation: false,
    }
  }

  const samples = [buildSample(0)]
  for (const leg of legs) {
    const legIntervalSeconds = leg.sampleIntervalSeconds ?? sampleIntervalSeconds
    const speedMetersPerSecond =
      (leg.speedKilometersPerHour * METERS_PER_KILOMETER) / SECONDS_PER_HOUR
    let legElapsedSeconds = 0
    while (legElapsedSeconds < leg.durationSeconds) {
      const stepSeconds = Math.min(legIntervalSeconds, leg.durationSeconds - legElapsedSeconds)
      legElapsedSeconds += stepSeconds
      elapsedSeconds += stepSeconds
      northwardMeters += speedMetersPerSecond * stepSeconds
      samples.push(buildSample(samples.length))
    }
  }
  return samples
}

/** A steady walk (or run, or drive) at one speed: `buildTrace` with a single leg. */
export function buildWalkingTrace({
  durationSeconds,
  speedKilometersPerHour,
  startedAt,
  ...options
}: Omit<BuildTraceOptions, 'legs'> & TraceLeg): ValidationSample[] {
  return buildTrace({ legs: [{ durationSeconds, speedKilometersPerHour }], startedAt, ...options })
}
