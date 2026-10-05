import { MAX_LOCATION_SAMPLES_PER_UPLOAD } from '@stridemon/shared/api-contracts'
import { uploadLocationSamples } from '../api/activity-sessions-api'
import { openActivitySessionDatabase } from './activity-session-database'
import { markLocationSamplesUploaded, readUnsentLocationSamples } from './location-sample-buffer'

// A fix arrives every few seconds; batching them 15 s at a time keeps requests few
// and the server's session fresh (the abandon job waits 30 minutes).
export const LOCATION_SAMPLE_UPLOAD_INTERVAL_MILLISECONDS = 15_000

let inFlightUpload: Promise<void> | null = null
let lastUploadStartedAtMilliseconds = 0

/**
 * Uploads every unsent sample of the session, in batches of up to 500, and marks
 * each batch once the API has it. Single-flight: a call while an upload runs gets
 * that upload. Rejects with the API client's `ApiError` if a batch fails; unsent
 * samples stay buffered for the next try.
 */
export function uploadUnsentLocationSamples(activitySessionId: string): Promise<void> {
  if (inFlightUpload === null) {
    lastUploadStartedAtMilliseconds = Date.now()
    inFlightUpload = uploadAllUnsentLocationSamples(activitySessionId).finally(() => {
      inFlightUpload = null
    })
  }
  return inFlightUpload
}

/**
 * The location task calls this on every fix: it uploads only if the last upload
 * started at least `LOCATION_SAMPLE_UPLOAD_INTERVAL_MILLISECONDS` ago. Returns
 * null when it's not time yet.
 */
export function uploadUnsentLocationSamplesIfDue(activitySessionId: string): Promise<void> | null {
  const millisecondsSinceLastUpload = Date.now() - lastUploadStartedAtMilliseconds
  if (millisecondsSinceLastUpload < LOCATION_SAMPLE_UPLOAD_INTERVAL_MILLISECONDS) return null
  return uploadUnsentLocationSamples(activitySessionId)
}

/**
 * Waits for any upload in progress, then uploads what's left. For finishing a run,
 * after location updates have stopped, so nothing new arrives meanwhile.
 */
export async function flushLocationSamples(activitySessionId: string): Promise<void> {
  // The in-flight upload's own failure is retried by the upload below.
  await inFlightUpload?.catch(() => undefined)
  await uploadUnsentLocationSamples(activitySessionId)
}

async function uploadAllUnsentLocationSamples(activitySessionId: string): Promise<void> {
  const database = await openActivitySessionDatabase()
  while (true) {
    const unsentSamples = await readUnsentLocationSamples(database, {
      activitySessionId,
      limit: MAX_LOCATION_SAMPLES_PER_UPLOAD,
    })
    if (unsentSamples.length === 0) return

    await uploadLocationSamples(activitySessionId, unsentSamples)
    await markLocationSamplesUploaded(database, {
      activitySessionId,
      sequenceNumbers: unsentSamples.map((sample) => sample.sequenceNumber),
    })
  }
}
