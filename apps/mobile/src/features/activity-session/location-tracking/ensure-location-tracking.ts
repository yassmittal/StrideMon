import { getErrorMessage } from '@stridemon/shared/errors'
import { LocationTrackingError } from './location-tracking-error'
import { startLocationTracking } from './location-updates'
import {
  isLocationServiceEnabled,
  readLocationPermissionState,
} from './request-location-permission'

/**
 * Makes sure the location task is recording: location is on, permission is
 * granted, and updates are started (a no-op when they already are). Throws a
 * `LocationTrackingError` saying which of those failed.
 */
export async function ensureLocationTracking(): Promise<void> {
  if (!(await isLocationServiceEnabled())) {
    throw new LocationTrackingError('LOCATION_SERVICES_OFF', 'Location services are turned off')
  }
  if ((await readLocationPermissionState()) !== 'granted') {
    throw new LocationTrackingError('LOCATION_PERMISSION_MISSING', 'Location permission is missing')
  }
  try {
    await startLocationTracking()
  } catch (error) {
    throw new LocationTrackingError('LOCATION_TRACKING_FAILED', getErrorMessage(error))
  }
}
