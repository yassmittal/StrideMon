import { createActivitySessionTables, type LocalDatabase } from './activity-session-database'
import { createInMemoryActivitySessionDatabase } from './in-memory-database.test-support'
import {
  clearLocalActiveActivitySession,
  findLocalActiveActivitySession,
  saveLocalActiveActivitySession,
} from './local-active-activity-session'
import {
  appendLocationSamples,
  countUnsentLocationSamples,
  listBufferedLocationSamples,
  markLocationSamplesUploaded,
  type RecordedLocation,
  readUnsentLocationSamples,
} from './location-sample-buffer'

const ACTIVITY_SESSION_ID = '66f9c0ffee00000000000001'
const OTHER_ACTIVITY_SESSION_ID = '66f9c0ffee00000000000002'
const FIRST_FIX_MILLISECONDS = Date.parse('2026-09-29T06:00:00Z')

let database: LocalDatabase

beforeEach(async () => {
  database = await createInMemoryActivitySessionDatabase()
})

function buildRecordedLocations(count: number, firstSecond = 0): RecordedLocation[] {
  return Array.from({ length: count }, (_, index) => ({
    recordedAtMilliseconds: FIRST_FIX_MILLISECONDS + (firstSecond + index * 3) * 1000,
    latitude: 26.8923 + index * 0.00001,
    longitude: 75.8042,
    accuracyMeters: 8,
    speedMetersPerSecond: 1.4,
    isMockedLocation: false,
  }))
}

describe('location sample buffer', () => {
  it('numbers appended samples 0, 1, 2… in the order they arrive', async () => {
    await appendLocationSamples(database, {
      activitySessionId: ACTIVITY_SESSION_ID,
      recordedLocations: buildRecordedLocations(2),
    })
    await appendLocationSamples(database, {
      activitySessionId: ACTIVITY_SESSION_ID,
      recordedLocations: buildRecordedLocations(1, 6),
    })

    const bufferedSamples = await listBufferedLocationSamples(database, ACTIVITY_SESSION_ID)

    expect(bufferedSamples.map((sample) => sample.sequenceNumber)).toEqual([0, 1, 2])
  })

  it('numbers each activity session separately', async () => {
    await appendLocationSamples(database, {
      activitySessionId: ACTIVITY_SESSION_ID,
      recordedLocations: buildRecordedLocations(3),
    })

    await appendLocationSamples(database, {
      activitySessionId: OTHER_ACTIVITY_SESSION_ID,
      recordedLocations: buildRecordedLocations(1),
    })

    const otherSamples = await listBufferedLocationSamples(database, OTHER_ACTIVITY_SESSION_ID)
    expect(otherSamples.map((sample) => sample.sequenceNumber)).toEqual([0])
  })

  it('reads unsent samples oldest first, up to the limit, shaped for the upload API', async () => {
    await appendLocationSamples(database, {
      activitySessionId: ACTIVITY_SESSION_ID,
      recordedLocations: buildRecordedLocations(5),
    })

    const unsentSamples = await readUnsentLocationSamples(database, {
      activitySessionId: ACTIVITY_SESSION_ID,
      limit: 2,
    })

    expect(unsentSamples).toEqual([
      {
        sequenceNumber: 0,
        recordedAt: '2026-09-29T06:00:00.000Z',
        latitude: 26.8923,
        longitude: 75.8042,
        accuracyMeters: 8,
        speedMetersPerSecond: 1.4,
        isMockedLocation: false,
      },
      expect.objectContaining({ sequenceNumber: 1, recordedAt: '2026-09-29T06:00:03.000Z' }),
    ])
  })

  it('keeps a missing accuracy and a mocked flag as they were recorded', async () => {
    await appendLocationSamples(database, {
      activitySessionId: ACTIVITY_SESSION_ID,
      recordedLocations: [
        { ...buildRecordedLocations(1)[0]!, accuracyMeters: null, isMockedLocation: true },
      ],
    })

    const [unsentSample] = await readUnsentLocationSamples(database, {
      activitySessionId: ACTIVITY_SESSION_ID,
      limit: 1,
    })

    expect(unsentSample).toMatchObject({ accuracyMeters: null, isMockedLocation: true })
  })

  it('stops offering samples once they are marked uploaded, but keeps them for live stats', async () => {
    await appendLocationSamples(database, {
      activitySessionId: ACTIVITY_SESSION_ID,
      recordedLocations: buildRecordedLocations(5),
    })

    await markLocationSamplesUploaded(database, {
      activitySessionId: ACTIVITY_SESSION_ID,
      sequenceNumbers: [0, 1, 2],
    })

    const unsentSamples = await readUnsentLocationSamples(database, {
      activitySessionId: ACTIVITY_SESSION_ID,
      limit: 10,
    })
    expect(unsentSamples.map((sample) => sample.sequenceNumber)).toEqual([3, 4])
    expect(await countUnsentLocationSamples(database, ACTIVITY_SESSION_ID)).toBe(2)
    expect(await listBufferedLocationSamples(database, ACTIVITY_SESSION_ID)).toHaveLength(5)
  })

  it('keeps every sample when the schema runs again on the next launch', async () => {
    await appendLocationSamples(database, {
      activitySessionId: ACTIVITY_SESSION_ID,
      recordedLocations: buildRecordedLocations(3),
    })

    await createActivitySessionTables(database)

    expect(await countUnsentLocationSamples(database, ACTIVITY_SESSION_ID)).toBe(3)
  })
})

describe('local active activity session', () => {
  const localActiveActivitySession = {
    activitySessionId: ACTIVITY_SESSION_ID,
    sneakerTokenId: 7n,
    startedAt: '2026-09-29T06:00:00.000Z',
    energyAtStart: 10,
    efficiency: 12,
  }

  it('is null when no run is in progress', async () => {
    expect(await findLocalActiveActivitySession(database)).toBeNull()
  })

  it('remembers the run in progress, token id included', async () => {
    await saveLocalActiveActivitySession(database, localActiveActivitySession)

    expect(await findLocalActiveActivitySession(database)).toEqual(localActiveActivitySession)
  })

  it('holds one run at most: saving another replaces it', async () => {
    await saveLocalActiveActivitySession(database, localActiveActivitySession)

    await saveLocalActiveActivitySession(database, {
      ...localActiveActivitySession,
      activitySessionId: OTHER_ACTIVITY_SESSION_ID,
    })

    expect((await findLocalActiveActivitySession(database))?.activitySessionId).toBe(
      OTHER_ACTIVITY_SESSION_ID,
    )
  })

  it('forgets the run and its samples when cleared, and leaves other sessions alone', async () => {
    await saveLocalActiveActivitySession(database, localActiveActivitySession)
    await appendLocationSamples(database, {
      activitySessionId: ACTIVITY_SESSION_ID,
      recordedLocations: buildRecordedLocations(3),
    })
    await appendLocationSamples(database, {
      activitySessionId: OTHER_ACTIVITY_SESSION_ID,
      recordedLocations: buildRecordedLocations(1),
    })

    await clearLocalActiveActivitySession(database, ACTIVITY_SESSION_ID)

    expect(await findLocalActiveActivitySession(database)).toBeNull()
    expect(await listBufferedLocationSamples(database, ACTIVITY_SESSION_ID)).toHaveLength(0)
    expect(await listBufferedLocationSamples(database, OTHER_ACTIVITY_SESSION_ID)).toHaveLength(1)
  })
})
