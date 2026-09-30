import {
  Accuracy,
  ActivityType,
  hasStartedLocationUpdatesAsync,
  type LocationTaskOptions,
  startLocationUpdatesAsync,
  stopLocationUpdatesAsync,
} from 'expo-location'
import { LOCATION_TASK_NAME } from './location-task-name'

// mobile-app.md → Location tracking during a run.
const LOCATION_TASK_OPTIONS: LocationTaskOptions = {
  accuracy: Accuracy.BestForNavigation,
  // Android: at most one fix every 3 s. iOS ignores this and uses distanceInterval.
  timeInterval: 3_000,
  // Standing still sends nothing, which also keeps GPS jitter out of the distance (D-021).
  distanceInterval: 5,
  // Android: a foreground service keeps GPS running with the screen locked (D-020).
  foregroundService: {
    notificationTitle: 'Run in progress',
    notificationBody: 'StrideMon is recording your walk. Open the app to stop.',
  },
  // iOS: the blue status-bar pill, and no automatic pausing mid-run.
  showsBackgroundLocationIndicator: true,
  activityType: ActivityType.Fitness,
  pausesUpdatesAutomatically: false,
}

/** Starts the location task. A no-op if it's already running (a resumed run). */
export async function startLocationTracking(): Promise<void> {
  if (await hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME)) return
  await startLocationUpdatesAsync(LOCATION_TASK_NAME, LOCATION_TASK_OPTIONS)
}

export async function stopLocationTracking(): Promise<void> {
  if (!(await hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME))) return
  await stopLocationUpdatesAsync(LOCATION_TASK_NAME)
}
