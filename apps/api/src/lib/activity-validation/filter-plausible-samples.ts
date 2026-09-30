import type { ValidationSample } from './validation-sample'

// security.md → Activity validation → Sample plausibility and Duration sanity.
export const MAXIMUM_SAMPLE_ACCURACY_METERS = 50
// How far the phone's clock may differ from the server's (D-021).
export const MAXIMUM_DEVICE_CLOCK_SKEW_SECONDS = 60
export const MAXIMUM_SESSION_DURATION_SECONDS = 4 * 60 * 60

const MILLISECONDS_PER_SECOND = 1000
const MAXIMUM_DEVICE_CLOCK_SKEW_MILLISECONDS =
  MAXIMUM_DEVICE_CLOCK_SKEW_SECONDS * MILLISECONDS_PER_SECOND

/** How many samples each rule dropped. A sample is counted under the first rule it fails. */
export type DroppedSampleCounts = {
  inaccurate: number
  recordedInFuture: number
  outsideSession: number
  afterMaximumDuration: number
  outOfOrder: number
}

/**
 * Keeps the samples validation can trust, in `sequenceNumber` order, and counts
 * the rest by the rule that dropped them. Mocked samples aren't handled here:
 * one of those rejects the whole session.
 */
export function filterPlausibleSamples({
  samples,
  startedAt,
  finishedAt,
}: {
  samples: readonly ValidationSample[]
  startedAt: Date
  finishedAt: Date
}): { plausibleSamples: ValidationSample[]; droppedSampleCounts: DroppedSampleCounts } {
  const droppedSampleCounts: DroppedSampleCounts = {
    inaccurate: 0,
    recordedInFuture: 0,
    outsideSession: 0,
    afterMaximumDuration: 0,
    outOfOrder: 0,
  }
  const sessionWindow = buildSessionWindow({ startedAt, finishedAt })
  const samplesInSequence = [...samples].sort(
    (first, second) => first.sequenceNumber - second.sequenceNumber,
  )

  const plausibleSamples: ValidationSample[] = []
  for (const sample of samplesInSequence) {
    const previousKeptSample = plausibleSamples.at(-1)
    const dropReason = findDropReason({ sample, previousKeptSample, sessionWindow })
    if (dropReason === null) plausibleSamples.push(sample)
    else droppedSampleCounts[dropReason] += 1
  }
  return { plausibleSamples, droppedSampleCounts }
}

/** Total samples dropped, for `validationResult.rejectedSampleCount`. */
export function countDroppedSamples(droppedSampleCounts: DroppedSampleCounts): number {
  return Object.values(droppedSampleCounts).reduce((total, count) => total + count, 0)
}

type SessionWindow = {
  earliestMilliseconds: number
  latestMilliseconds: number
  maximumDurationEndMilliseconds: number
}

function buildSessionWindow({
  startedAt,
  finishedAt,
}: {
  startedAt: Date
  finishedAt: Date
}): SessionWindow {
  const startedAtMilliseconds = startedAt.getTime()
  return {
    earliestMilliseconds: startedAtMilliseconds - MAXIMUM_DEVICE_CLOCK_SKEW_MILLISECONDS,
    latestMilliseconds: finishedAt.getTime() + MAXIMUM_DEVICE_CLOCK_SKEW_MILLISECONDS,
    maximumDurationEndMilliseconds:
      startedAtMilliseconds +
      MAXIMUM_SESSION_DURATION_SECONDS * MILLISECONDS_PER_SECOND +
      MAXIMUM_DEVICE_CLOCK_SKEW_MILLISECONDS,
  }
}

function findDropReason({
  sample,
  previousKeptSample,
  sessionWindow,
}: {
  sample: ValidationSample
  previousKeptSample: ValidationSample | undefined
  sessionWindow: SessionWindow
}): keyof DroppedSampleCounts | null {
  const recordedAtMilliseconds = sample.recordedAt.getTime()

  if (sample.accuracyMeters === null || sample.accuracyMeters > MAXIMUM_SAMPLE_ACCURACY_METERS) {
    return 'inaccurate'
  }
  if (
    recordedAtMilliseconds >
    sample.receivedAt.getTime() + MAXIMUM_DEVICE_CLOCK_SKEW_MILLISECONDS
  ) {
    return 'recordedInFuture'
  }
  if (
    recordedAtMilliseconds < sessionWindow.earliestMilliseconds ||
    recordedAtMilliseconds > sessionWindow.latestMilliseconds
  ) {
    return 'outsideSession'
  }
  if (recordedAtMilliseconds > sessionWindow.maximumDurationEndMilliseconds) {
    return 'afterMaximumDuration'
  }
  if (
    previousKeptSample !== undefined &&
    recordedAtMilliseconds <= previousKeptSample.recordedAt.getTime()
  ) {
    return 'outOfOrder'
  }
  return null
}
