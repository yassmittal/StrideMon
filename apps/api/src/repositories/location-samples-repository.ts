import { type Collection, type Db, MongoBulkWriteError, ObjectId } from 'mongodb'

const MONGO_DUPLICATE_KEY_ERROR_CODE = 11000

/** Raw GPS. Kept out of `activitySessions`, and never logged or sent on-chain. */
export type LocationSampleDocument = {
  _id: ObjectId
  activitySessionId: ObjectId
  /** Assigned on the device. Unique per session, so a re-sent batch is a no-op. */
  sequenceNumber: number
  /** The device's clock. */
  recordedAt: Date
  latitude: number
  longitude: number
  accuracyMeters: number | null
  speedMetersPerSecond: number | null
  isMockedLocation: boolean
  /** The server's clock, to detect a device clock set ahead. */
  receivedAt: Date
}

export type NewLocationSample = Omit<
  LocationSampleDocument,
  '_id' | 'activitySessionId' | 'receivedAt'
>

export function getLocationSamplesCollection(database: Db): Collection<LocationSampleDocument> {
  return database.collection<LocationSampleDocument>('locationSamples')
}

/**
 * Stores a batch. Samples the session already has (same sequence number) are
 * skipped and counted, so retrying an upload after a network error is harmless.
 */
export async function insertLocationSamples(
  database: Db,
  {
    activitySessionId,
    samples,
    receivedAt,
  }: { activitySessionId: ObjectId; samples: readonly NewLocationSample[]; receivedAt: Date },
): Promise<{ newSampleCount: number; duplicateSampleCount: number }> {
  const sampleDocuments: LocationSampleDocument[] = samples.map((sample) => ({
    _id: new ObjectId(),
    ...sample,
    activitySessionId,
    receivedAt,
  }))
  try {
    const insertResult = await getLocationSamplesCollection(database).insertMany(sampleDocuments, {
      ordered: false,
    })
    return { newSampleCount: insertResult.insertedCount, duplicateSampleCount: 0 }
  } catch (error) {
    if (!(error instanceof MongoBulkWriteError)) throw error
    const writeErrors = Array.isArray(error.writeErrors) ? error.writeErrors : [error.writeErrors]
    if (writeErrors.some((writeError) => writeError.code !== MONGO_DUPLICATE_KEY_ERROR_CODE)) {
      throw error
    }
    return { newSampleCount: error.insertedCount, duplicateSampleCount: writeErrors.length }
  }
}

/** Every sample of a session, in the order the device recorded them. */
export function listLocationSamplesOfActivitySession(
  database: Db,
  activitySessionId: ObjectId,
): Promise<LocationSampleDocument[]> {
  return getLocationSamplesCollection(database)
    .find({ activitySessionId })
    .sort({ sequenceNumber: 1 })
    .toArray()
}
