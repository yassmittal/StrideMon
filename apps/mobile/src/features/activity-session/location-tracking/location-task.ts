import { getErrorMessage } from '@stridemon/shared/errors'
import type { LocationObject } from 'expo-location'
import { defineTask, type TaskManagerTaskBody } from 'expo-task-manager'
import { openActivitySessionDatabase } from './activity-session-database'
import { findLocalActiveActivitySession } from './local-active-activity-session'
import { appendLocationSamples, type RecordedLocation } from './location-sample-buffer'
import { uploadUnsentLocationSamplesIfDue } from './location-sample-uploader'
import { LOCATION_TASK_NAME } from './location-task-name'
import { stopLocationTracking } from './location-updates'

type LocationTaskData = { locations: LocationObject[] }

// Android's first fix is often its cached last-known location, minutes old (D-024).
// A live fix reaches the task within seconds, so anything older is stale.
const MAXIMUM_FIX_AGE_MILLISECONDS = 60_000

/**
 * Buffers every fix for the run in progress, then uploads if it's time. Runs with
 * the screen locked, and headless on Android after a swipe-away (D-020), so it
 * reads everything it needs from the database, never from React state.
 */
export async function handleLocationTaskEvent({
  data,
  error,
}: TaskManagerTaskBody<LocationTaskData>): Promise<void> {
  if (error !== null) {
    console.error('Location task reported an error', error.message)
    return
  }
  const database = await openActivitySessionDatabase()
  const localActiveActivitySession = await findLocalActiveActivitySession(database)
  if (localActiveActivitySession === null) {
    // No run to record into, e.g. it was finished while a fix was in flight.
    await stopLocationTracking()
    return
  }

  const { activitySessionId } = localActiveActivitySession
  const deliveredAtMilliseconds = Date.now()
  await appendLocationSamples(database, {
    activitySessionId,
    recordedLocations: data.locations
      .filter((location) => isFreshLocation(location, deliveredAtMilliseconds))
      .map(toRecordedLocation),
  })
  // Not awaited: a slow network mustn't hold up the next fix. Samples stay buffered.
  uploadUnsentLocationSamplesIfDue(activitySessionId)?.catch((uploadError: unknown) => {
    console.warn('Location sample upload failed; will retry', getErrorMessage(uploadError))
  })
}

/** Recorded no more than a minute before it reached the task (D-024). Same clock on both sides. */
function isFreshLocation(location: LocationObject, deliveredAtMilliseconds: number): boolean {
  return deliveredAtMilliseconds - location.timestamp <= MAXIMUM_FIX_AGE_MILLISECONDS
}

function toRecordedLocation(location: LocationObject): RecordedLocation {
  return {
    recordedAtMilliseconds: location.timestamp,
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracyMeters: location.coords.accuracy,
    speedMetersPerSecond: location.coords.speed,
    // Android only; iOS never sets it (D-020).
    isMockedLocation: location.mocked === true,
  }
}

// At module scope, as TaskManager requires: index.ts imports this file before the
// router, so the task exists even when Android starts the JS headless.
defineTask<LocationTaskData>(LOCATION_TASK_NAME, handleLocationTaskEvent)
