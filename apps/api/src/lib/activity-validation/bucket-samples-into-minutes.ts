import { calculateHaversineDistanceMeters } from '@stridemon/shared/geo'
import { calculateSpeedKilometersPerHour, isTeleportSpeed } from './speed-band'
import type { ValidationSample } from './validation-sample'

// security.md → Activity validation → Sampling gaps: a longer silence breaks a minute.
export const MAXIMUM_SAMPLING_GAP_SECONDS = 60

const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const MILLISECONDS_PER_MINUTE = SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND

/** What happened inside one whole minute of the session. */
export type MinuteBucket = {
  /** Distance of the minute's movement segments (teleports and gaps excluded). */
  countedDistanceMeters: number
  /** Time those same segments took. The minute's average speed is distance over this. */
  countedSeconds: number
  /** A silence longer than `MAXIMUM_SAMPLING_GAP_SECONDS` overlaps this minute. */
  hasSamplingGap: boolean
}

type SegmentKind = 'movement' | 'teleport' | 'samplingGap'

/**
 * Cuts the time from the first sample into whole 60 s minutes and spreads each
 * segment (the line between two consecutive samples) over the minutes it spans,
 * in proportion to time. A trailing partial minute is left out: only whole
 * minutes can be active (D-021).
 *
 * `samples` must already be plausible: in order, with strictly increasing times.
 */
export function bucketSamplesIntoMinutes(samples: readonly ValidationSample[]): {
  minuteBuckets: MinuteBucket[]
  teleportSegmentCount: number
} {
  const firstSample = samples[0]
  const lastSample = samples.at(-1)
  if (firstSample === undefined || lastSample === undefined) {
    return { minuteBuckets: [], teleportSegmentCount: 0 }
  }

  const firstMilliseconds = firstSample.recordedAt.getTime()
  const wholeMinuteCount = Math.floor(
    (lastSample.recordedAt.getTime() - firstMilliseconds) / MILLISECONDS_PER_MINUTE,
  )
  const minuteBuckets: MinuteBucket[] = Array.from({ length: wholeMinuteCount }, () => ({
    countedDistanceMeters: 0,
    countedSeconds: 0,
    hasSamplingGap: false,
  }))

  let teleportSegmentCount = 0
  for (let sampleIndex = 1; sampleIndex < samples.length; sampleIndex++) {
    const segmentStart = samples[sampleIndex - 1]
    const segmentEnd = samples[sampleIndex]
    if (segmentStart === undefined || segmentEnd === undefined) continue

    const segment = measureSegment(segmentStart, segmentEnd)
    if (segment.kind === 'teleport') teleportSegmentCount += 1
    addSegmentToMinutes({ segment, minuteBuckets, firstMilliseconds })
  }
  return { minuteBuckets, teleportSegmentCount }
}

type Segment = {
  kind: SegmentKind
  startMilliseconds: number
  endMilliseconds: number
  distanceMeters: number
}

function measureSegment(segmentStart: ValidationSample, segmentEnd: ValidationSample): Segment {
  const startMilliseconds = segmentStart.recordedAt.getTime()
  const endMilliseconds = segmentEnd.recordedAt.getTime()
  const durationSeconds = (endMilliseconds - startMilliseconds) / MILLISECONDS_PER_SECOND
  const distanceMeters = calculateHaversineDistanceMeters(segmentStart, segmentEnd)
  return {
    kind: classifySegment({ distanceMeters, durationSeconds }),
    startMilliseconds,
    endMilliseconds,
    distanceMeters,
  }
}

function classifySegment({
  distanceMeters,
  durationSeconds,
}: {
  distanceMeters: number
  durationSeconds: number
}): SegmentKind {
  if (durationSeconds > MAXIMUM_SAMPLING_GAP_SECONDS) return 'samplingGap'
  if (isTeleportSpeed(calculateSpeedKilometersPerHour({ distanceMeters, durationSeconds }))) {
    return 'teleport'
  }
  return 'movement'
}

function addSegmentToMinutes({
  segment,
  minuteBuckets,
  firstMilliseconds,
}: {
  segment: Segment
  minuteBuckets: MinuteBucket[]
  firstMilliseconds: number
}): void {
  const segmentDurationMilliseconds = segment.endMilliseconds - segment.startMilliseconds
  const firstMinuteIndex = Math.floor(
    (segment.startMilliseconds - firstMilliseconds) / MILLISECONDS_PER_MINUTE,
  )

  for (let minuteIndex = firstMinuteIndex; minuteIndex < minuteBuckets.length; minuteIndex++) {
    const minuteStartMilliseconds = firstMilliseconds + minuteIndex * MILLISECONDS_PER_MINUTE
    if (minuteStartMilliseconds >= segment.endMilliseconds) break
    const minuteBucket = minuteBuckets[minuteIndex]
    if (minuteBucket === undefined) break

    const overlapMilliseconds =
      Math.min(segment.endMilliseconds, minuteStartMilliseconds + MILLISECONDS_PER_MINUTE) -
      Math.max(segment.startMilliseconds, minuteStartMilliseconds)
    if (overlapMilliseconds <= 0) continue

    switch (segment.kind) {
      case 'samplingGap':
        minuteBucket.hasSamplingGap = true
        break
      case 'teleport':
        // Ignored: neither its distance nor its time counts toward the minute.
        break
      case 'movement': {
        const overlapFraction = overlapMilliseconds / segmentDurationMilliseconds
        minuteBucket.countedDistanceMeters += segment.distanceMeters * overlapFraction
        minuteBucket.countedSeconds += overlapMilliseconds / MILLISECONDS_PER_SECOND
        break
      }
      default: {
        const unhandledSegmentKind: never = segment.kind
        throw new Error(`Unhandled segment kind: ${String(unhandledSegmentKind)}`)
      }
    }
  }
}
