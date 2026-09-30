import type { LocationSample } from '@stridemon/shared/api-contracts'
import type { LocalDatabase } from './activity-session-database'

/** A fix as the location task receives it, before it has a sequence number. */
export type RecordedLocation = {
  recordedAtMilliseconds: number
  latitude: number
  longitude: number
  accuracyMeters: number | null
  speedMetersPerSecond: number | null
  isMockedLocation: boolean
}

/** A buffered fix, for the live run stats. */
export type BufferedLocationSample = RecordedLocation & { sequenceNumber: number }

type LocationSampleRow = {
  sequence_number: number
  recorded_at_milliseconds: number
  latitude: number
  longitude: number
  accuracy_meters: number | null
  speed_meters_per_second: number | null
  is_mocked_location: number
}

const SAMPLE_COLUMNS =
  'sequence_number, recorded_at_milliseconds, latitude, longitude, accuracy_meters, speed_meters_per_second, is_mocked_location'

/**
 * Appends fixes in order, each with the session's next sequence number. The
 * number is computed inside the INSERT, so two batches arriving together can't
 * be given the same one.
 */
export async function appendLocationSamples(
  database: LocalDatabase,
  {
    activitySessionId,
    recordedLocations,
  }: { activitySessionId: string; recordedLocations: readonly RecordedLocation[] },
): Promise<void> {
  for (const recordedLocation of recordedLocations) {
    await database.runAsync(
      `INSERT INTO location_samples (activity_session_id, ${SAMPLE_COLUMNS})
       VALUES (
         ?,
         (SELECT COALESCE(MAX(sequence_number) + 1, 0) FROM location_samples WHERE activity_session_id = ?),
         ?, ?, ?, ?, ?, ?
       )`,
      [
        activitySessionId,
        activitySessionId,
        recordedLocation.recordedAtMilliseconds,
        recordedLocation.latitude,
        recordedLocation.longitude,
        recordedLocation.accuracyMeters,
        recordedLocation.speedMetersPerSecond,
        recordedLocation.isMockedLocation ? 1 : 0,
      ],
    )
  }
}

/** The oldest samples not yet uploaded, shaped for `POST …/location-samples`. */
export async function readUnsentLocationSamples(
  database: LocalDatabase,
  { activitySessionId, limit }: { activitySessionId: string; limit: number },
): Promise<LocationSample[]> {
  const sampleRows = await database.getAllAsync<LocationSampleRow>(
    `SELECT ${SAMPLE_COLUMNS} FROM location_samples
     WHERE activity_session_id = ? AND is_uploaded = 0
     ORDER BY sequence_number
     LIMIT ?`,
    [activitySessionId, limit],
  )
  return sampleRows.map((sampleRow) => ({
    sequenceNumber: sampleRow.sequence_number,
    recordedAt: new Date(sampleRow.recorded_at_milliseconds).toISOString(),
    latitude: sampleRow.latitude,
    longitude: sampleRow.longitude,
    accuracyMeters: sampleRow.accuracy_meters,
    speedMetersPerSecond: sampleRow.speed_meters_per_second,
    isMockedLocation: sampleRow.is_mocked_location === 1,
  }))
}

/** Marks an uploaded batch. Samples stay until the run is finished, for the live stats. */
export async function markLocationSamplesUploaded(
  database: LocalDatabase,
  {
    activitySessionId,
    sequenceNumbers,
  }: { activitySessionId: string; sequenceNumbers: readonly number[] },
): Promise<void> {
  if (sequenceNumbers.length === 0) return
  await database.runAsync(
    `UPDATE location_samples SET is_uploaded = 1
     WHERE activity_session_id = ? AND sequence_number BETWEEN ? AND ?`,
    [activitySessionId, Math.min(...sequenceNumbers), Math.max(...sequenceNumbers)],
  )
}

export async function countUnsentLocationSamples(
  database: LocalDatabase,
  activitySessionId: string,
): Promise<number> {
  const countRow = await database.getFirstAsync<{ unsent_sample_count: number }>(
    `SELECT COUNT(*) AS unsent_sample_count FROM location_samples
     WHERE activity_session_id = ? AND is_uploaded = 0`,
    [activitySessionId],
  )
  return countRow?.unsent_sample_count ?? 0
}

/** Every buffered fix of the session, oldest first. */
export async function listBufferedLocationSamples(
  database: LocalDatabase,
  activitySessionId: string,
): Promise<BufferedLocationSample[]> {
  const sampleRows = await database.getAllAsync<LocationSampleRow>(
    `SELECT ${SAMPLE_COLUMNS} FROM location_samples
     WHERE activity_session_id = ?
     ORDER BY sequence_number`,
    [activitySessionId],
  )
  return sampleRows.map((sampleRow) => ({
    sequenceNumber: sampleRow.sequence_number,
    recordedAtMilliseconds: sampleRow.recorded_at_milliseconds,
    latitude: sampleRow.latitude,
    longitude: sampleRow.longitude,
    accuracyMeters: sampleRow.accuracy_meters,
    speedMetersPerSecond: sampleRow.speed_meters_per_second,
    isMockedLocation: sampleRow.is_mocked_location === 1,
  }))
}
