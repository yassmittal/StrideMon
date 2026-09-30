import { describe, expect, it } from 'bun:test'
import { buildWalkingTrace } from '../../test-support/build-synthetic-trace'
import { filterPlausibleSamples } from './filter-plausible-samples'
import type { ValidationSample } from './validation-sample'

const STARTED_AT = new Date('2026-09-29T06:00:00Z')
const ONE_MINUTE_MILLISECONDS = 60_000

function buildOneMinuteWalk(): ValidationSample[] {
  return buildWalkingTrace({
    durationSeconds: 60,
    speedKilometersPerHour: 5,
    startedAt: STARTED_AT,
  })
}

function filterWalk(samples: ValidationSample[]) {
  return filterPlausibleSamples({
    samples,
    startedAt: STARTED_AT,
    finishedAt: new Date(STARTED_AT.getTime() + ONE_MINUTE_MILLISECONDS),
  })
}

function replaceSample(
  samples: ValidationSample[],
  sampleIndex: number,
  changes: Partial<ValidationSample>,
): ValidationSample[] {
  return samples.map((sample, index) =>
    index === sampleIndex ? { ...sample, ...changes } : sample,
  )
}

describe('filterPlausibleSamples', () => {
  it('keeps every sample of a clean walk', () => {
    const samples = buildOneMinuteWalk()

    const { plausibleSamples, droppedSampleCounts } = filterWalk(samples)

    expect(plausibleSamples).toHaveLength(samples.length)
    expect(Object.values(droppedSampleCounts).every((count) => count === 0)).toBe(true)
  })

  it('drops a sample less accurate than 50 m, and keeps one at exactly 50 m', () => {
    const samples = replaceSample(
      replaceSample(buildOneMinuteWalk(), 3, { accuracyMeters: 50.1 }),
      4,
      { accuracyMeters: 50 },
    )

    const { plausibleSamples, droppedSampleCounts } = filterWalk(samples)

    expect(droppedSampleCounts.inaccurate).toBe(1)
    expect(plausibleSamples.map((sample) => sample.sequenceNumber)).not.toContain(3)
    expect(plausibleSamples.map((sample) => sample.sequenceNumber)).toContain(4)
  })

  it('drops a sample that reports no accuracy at all', () => {
    const { droppedSampleCounts } = filterWalk(
      replaceSample(buildOneMinuteWalk(), 3, { accuracyMeters: null }),
    )

    expect(droppedSampleCounts.inaccurate).toBe(1)
  })

  it('drops a sample recorded more than 60 s after the server received it', () => {
    const samples = buildOneMinuteWalk()
    const sample = samples[5]!
    const tamperedSamples = replaceSample(samples, 5, {
      receivedAt: new Date(sample.recordedAt.getTime() - 61_000),
    })

    const { droppedSampleCounts } = filterWalk(tamperedSamples)

    expect(droppedSampleCounts.recordedInFuture).toBe(1)
  })

  it('keeps a sample exactly 60 s ahead of the server, the clock tolerance', () => {
    const samples = buildOneMinuteWalk()
    const sample = samples[5]!
    const skewedSamples = replaceSample(samples, 5, {
      receivedAt: new Date(sample.recordedAt.getTime() - 60_000),
    })

    const { droppedSampleCounts } = filterWalk(skewedSamples)

    expect(droppedSampleCounts.recordedInFuture).toBe(0)
  })

  it('drops a sample whose timestamp goes backwards', () => {
    const samples = buildOneMinuteWalk()
    const backwardsSamples = replaceSample(samples, 6, { recordedAt: samples[4]!.recordedAt })

    const { plausibleSamples, droppedSampleCounts } = filterWalk(backwardsSamples)

    expect(droppedSampleCounts.outOfOrder).toBe(1)
    expect(plausibleSamples.map((sample) => sample.sequenceNumber)).not.toContain(6)
  })

  it('orders samples by sequence number, whatever order they were uploaded in', () => {
    const samples = buildOneMinuteWalk()

    const { plausibleSamples } = filterWalk([...samples].reverse())

    expect(plausibleSamples.map((sample) => sample.sequenceNumber)).toEqual(
      samples.map((sample) => sample.sequenceNumber),
    )
  })

  it('drops samples outside the session, beyond the 60 s clock tolerance on each side', () => {
    const samples = buildWalkingTrace({
      durationSeconds: 60,
      speedKilometersPerHour: 5,
      startedAt: new Date(STARTED_AT.getTime() - 90_000),
    })

    const { plausibleSamples, droppedSampleCounts } = filterPlausibleSamples({
      samples,
      startedAt: STARTED_AT,
      finishedAt: new Date(STARTED_AT.getTime() + ONE_MINUTE_MILLISECONDS),
    })

    // Fixes from 90 s to 60 s before the start are out; the 60 s before it are in.
    expect(droppedSampleCounts.outsideSession).toBe(10)
    expect(plausibleSamples[0]!.recordedAt.getTime()).toBe(STARTED_AT.getTime() - 60_000)
  })

  it('drops samples recorded more than 4 hours after the start', () => {
    const fourHoursMilliseconds = 4 * 60 * 60 * 1000
    const lateStart = new Date(STARTED_AT.getTime() + fourHoursMilliseconds)
    const samples = buildWalkingTrace({
      durationSeconds: 120,
      speedKilometersPerHour: 5,
      startedAt: lateStart,
    })

    const { droppedSampleCounts } = filterPlausibleSamples({
      samples,
      startedAt: STARTED_AT,
      finishedAt: new Date(lateStart.getTime() + 120_000),
    })

    // The first 60 s past 4 h are inside the clock tolerance; the rest are dropped.
    expect(droppedSampleCounts.afterMaximumDuration).toBe(20)
  })
})
