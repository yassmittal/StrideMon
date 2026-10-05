import type { LocationObject } from 'expo-location'
import { defineTask, type TaskManagerTaskBody } from 'expo-task-manager'
import type { LocalDatabase } from './activity-session-database'
import { createInMemoryActivitySessionDatabase } from './in-memory-database.test-support'
import { saveLocalActiveActivitySession } from './local-active-activity-session'
import { listBufferedLocationSamples } from './location-sample-buffer'
import { uploadUnsentLocationSamplesIfDue } from './location-sample-uploader'
import { handleLocationTaskEvent } from './location-task'
import { LOCATION_TASK_NAME } from './location-task-name'
import { stopLocationTracking } from './location-updates'

let mockDatabase: LocalDatabase

jest.mock('expo-task-manager', () => ({ defineTask: jest.fn() }))
jest.mock('./activity-session-database', () => ({
  ...jest.requireActual('./activity-session-database'),
  openActivitySessionDatabase: () => Promise.resolve(mockDatabase),
}))
jest.mock('./location-updates', () => ({ stopLocationTracking: jest.fn(() => Promise.resolve()) }))
jest.mock('./location-sample-uploader', () => ({
  uploadUnsentLocationSamplesIfDue: jest.fn(() => null),
}))

const ACTIVITY_SESSION_ID = '66f9c0ffee00000000000001'
const TASK_EXECUTION_INFO = { eventId: 'event-1', taskName: LOCATION_TASK_NAME }

beforeEach(async () => {
  mockDatabase = await createInMemoryActivitySessionDatabase()
  jest.mocked(stopLocationTracking).mockClear()
  jest.mocked(uploadUnsentLocationSamplesIfDue).mockClear()
})

function buildLocation(overrides: Partial<LocationObject> = {}): LocationObject {
  return {
    timestamp: Date.now(),
    coords: {
      latitude: 26.8923,
      longitude: 75.8042,
      altitude: null,
      accuracy: 6,
      altitudeAccuracy: null,
      heading: null,
      speed: 1.3,
    },
    ...overrides,
  }
}

function buildTaskBody(
  locations: LocationObject[],
): TaskManagerTaskBody<{ locations: LocationObject[] }> {
  return { data: { locations }, error: null, executionInfo: TASK_EXECUTION_INFO }
}

async function startRunOnDevice(): Promise<void> {
  await saveLocalActiveActivitySession(mockDatabase, {
    activitySessionId: ACTIVITY_SESSION_ID,
    sneakerTokenId: 7n,
    startedAt: '2026-09-29T06:00:00.000Z',
    energyAtStart: 10,
    efficiency: 10,
  })
}

describe('the location task', () => {
  it('is defined when its module loads, as TaskManager requires', () => {
    expect(defineTask).toHaveBeenCalledWith(LOCATION_TASK_NAME, handleLocationTaskEvent)
  })

  it('buffers every fix for the run in progress, then uploads if it’s time', async () => {
    await startRunOnDevice()

    await handleLocationTaskEvent(
      buildTaskBody([buildLocation(), buildLocation({ timestamp: Date.now() + 3_000 })]),
    )

    const bufferedSamples = await listBufferedLocationSamples(mockDatabase, ACTIVITY_SESSION_ID)
    expect(bufferedSamples.map((sample) => sample.sequenceNumber)).toEqual([0, 1])
    expect(bufferedSamples[0]).toMatchObject({ accuracyMeters: 6, speedMetersPerSecond: 1.3 })
    expect(uploadUnsentLocationSamplesIfDue).toHaveBeenCalledWith(ACTIVITY_SESSION_ID)
  })

  it('drops the cached last-known location Android hands out first, minutes old (D-024)', async () => {
    await startRunOnDevice()
    const cachedLocation = buildLocation({ timestamp: Date.now() - 10 * 60_000 })

    await handleLocationTaskEvent(buildTaskBody([cachedLocation, buildLocation()]))

    const bufferedSamples = await listBufferedLocationSamples(mockDatabase, ACTIVITY_SESSION_ID)
    expect(bufferedSamples).toHaveLength(1)
    expect(bufferedSamples[0]?.sequenceNumber).toBe(0)
  })

  it('records Android’s mocked flag, which is what gets a run rejected', async () => {
    await startRunOnDevice()

    await handleLocationTaskEvent(buildTaskBody([buildLocation({ mocked: true })]))

    const [bufferedSample] = await listBufferedLocationSamples(mockDatabase, ACTIVITY_SESSION_ID)
    expect(bufferedSample?.isMockedLocation).toBe(true)
  })

  it('stops tracking when no run is in progress, instead of recording into nothing', async () => {
    await handleLocationTaskEvent(buildTaskBody([buildLocation()]))

    expect(stopLocationTracking).toHaveBeenCalled()
    expect(uploadUnsentLocationSamplesIfDue).not.toHaveBeenCalled()
  })

  it('records nothing when TaskManager reports an error', async () => {
    await startRunOnDevice()
    jest.spyOn(console, 'error').mockImplementation(() => {})

    await handleLocationTaskEvent({
      data: { locations: [buildLocation()] },
      error: { code: 1, message: 'Location unavailable' },
      executionInfo: TASK_EXECUTION_INFO,
    })

    expect(await listBufferedLocationSamples(mockDatabase, ACTIVITY_SESSION_ID)).toHaveLength(0)
  })
})
