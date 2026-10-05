import type { LocationSample } from '@stridemon/shared/api-contracts'
import { ApiError } from '../../../lib/api-client'
import { uploadLocationSamples } from '../api/activity-sessions-api'
import type { LocalDatabase } from './activity-session-database'
import { createInMemoryActivitySessionDatabase } from './in-memory-database.test-support'
import { appendLocationSamples, countUnsentLocationSamples } from './location-sample-buffer'
import {
  flushLocationSamples,
  LOCATION_SAMPLE_UPLOAD_INTERVAL_MILLISECONDS,
  uploadUnsentLocationSamples,
  uploadUnsentLocationSamplesIfDue,
} from './location-sample-uploader'

let mockDatabase: LocalDatabase

jest.mock('./activity-session-database', () => ({
  ...jest.requireActual('./activity-session-database'),
  openActivitySessionDatabase: () => Promise.resolve(mockDatabase),
}))
jest.mock('../api/activity-sessions-api', () => ({ uploadLocationSamples: jest.fn() }))

const ACTIVITY_SESSION_ID = '66f9c0ffee00000000000001'
// Each test moves the clock well past the throttle, since the uploader keeps its state.
let fakeNowMilliseconds = Date.parse('2026-09-29T06:00:00Z')

beforeEach(async () => {
  mockDatabase = await createInMemoryActivitySessionDatabase()
  jest.mocked(uploadLocationSamples).mockReset()
  jest
    .mocked(uploadLocationSamples)
    .mockResolvedValue({ newSampleCount: 0, duplicateSampleCount: 0 })
  fakeNowMilliseconds += 10 * LOCATION_SAMPLE_UPLOAD_INTERVAL_MILLISECONDS
  jest.spyOn(Date, 'now').mockImplementation(() => fakeNowMilliseconds)
})

async function bufferSamples(count: number): Promise<void> {
  await appendLocationSamples(mockDatabase, {
    activitySessionId: ACTIVITY_SESSION_ID,
    recordedLocations: Array.from({ length: count }, (_, index) => ({
      recordedAtMilliseconds: fakeNowMilliseconds + index * 3_000,
      latitude: 26.8923,
      longitude: 75.8042,
      accuracyMeters: 8,
      speedMetersPerSecond: 1.4,
      isMockedLocation: false,
    })),
  })
}

function readUploadedBatches(): LocationSample[][] {
  return jest.mocked(uploadLocationSamples).mock.calls.map(([, samples]) => [...samples])
}

describe('uploadUnsentLocationSamples', () => {
  it('uploads everything unsent in batches of at most 500, and marks each batch', async () => {
    await bufferSamples(1_203)

    await uploadUnsentLocationSamples(ACTIVITY_SESSION_ID)

    expect(readUploadedBatches().map((batch) => batch.length)).toEqual([500, 500, 203])
    expect(await countUnsentLocationSamples(mockDatabase, ACTIVITY_SESSION_ID)).toBe(0)
  })

  it('keeps a failed batch buffered for the next try', async () => {
    await bufferSamples(20)
    jest
      .mocked(uploadLocationSamples)
      .mockRejectedValueOnce(
        new ApiError({ code: 'NETWORK_UNREACHABLE', message: 'offline', statusCode: null }),
      )

    await expect(uploadUnsentLocationSamples(ACTIVITY_SESSION_ID)).rejects.toThrow('offline')

    expect(await countUnsentLocationSamples(mockDatabase, ACTIVITY_SESSION_ID)).toBe(20)
  })

  it('shares one upload between callers who ask at the same time', async () => {
    await bufferSamples(10)

    await Promise.all([
      uploadUnsentLocationSamples(ACTIVITY_SESSION_ID),
      uploadUnsentLocationSamples(ACTIVITY_SESSION_ID),
    ])

    expect(uploadLocationSamples).toHaveBeenCalledTimes(1)
  })
})

describe('uploadUnsentLocationSamplesIfDue', () => {
  it('uploads at most once per interval, however often fixes arrive', async () => {
    await bufferSamples(5)
    await uploadUnsentLocationSamplesIfDue(ACTIVITY_SESSION_ID)

    fakeNowMilliseconds += LOCATION_SAMPLE_UPLOAD_INTERVAL_MILLISECONDS - 1
    expect(uploadUnsentLocationSamplesIfDue(ACTIVITY_SESSION_ID)).toBeNull()

    fakeNowMilliseconds += 1
    await bufferSamples(1)
    await uploadUnsentLocationSamplesIfDue(ACTIVITY_SESSION_ID)
    expect(uploadLocationSamples).toHaveBeenCalledTimes(2)
  })
})

describe('flushLocationSamples', () => {
  it('uploads the samples that arrived after an upload already in progress', async () => {
    await bufferSamples(3)
    const uploadInProgress = uploadUnsentLocationSamples(ACTIVITY_SESSION_ID)
    await bufferSamples(2)

    await flushLocationSamples(ACTIVITY_SESSION_ID)
    await uploadInProgress

    expect(await countUnsentLocationSamples(mockDatabase, ACTIVITY_SESSION_ID)).toBe(0)
  })
})
