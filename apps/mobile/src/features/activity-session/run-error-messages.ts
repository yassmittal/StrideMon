import { ApiError } from '../../lib/api-client'
import { LocationTrackingError } from './location-tracking/location-tracking-error'

/** Player-facing copy for a failed start, resume or finish. Switches on codes, never messages. */
export function describeRunError(error: unknown): string {
  if (error instanceof LocationTrackingError) {
    switch (error.code) {
      case 'LOCATION_SERVICES_OFF':
        return 'Location is turned off on this phone. Turn it on in Settings, then try again.'
      case 'LOCATION_PERMISSION_MISSING':
        return 'StrideMon needs location access to record your run. Allow it in Settings, then try again.'
      case 'LOCATION_TRACKING_FAILED':
        return 'Couldn’t start GPS tracking. Try again, or restart the app.'
      default: {
        const unhandledCode: never = error.code
        return `Location error: ${String(unhandledCode)}`
      }
    }
  }
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'SNEAKER_OUT_OF_ENERGY':
        return 'Your Sneaker is out of energy. It regenerates over time.'
      case 'SNEAKER_NEEDS_REPAIR':
        return 'Your Sneaker is worn out. Repair it before your next run.'
      case 'SNEAKER_NOT_OWNED':
        return 'This wallet no longer owns that Sneaker.'
      case 'ACTIVITY_SESSION_ALREADY_ACTIVE':
        return 'Another run is already in progress on this wallet or Sneaker.'
      case 'ACTIVITY_SESSION_NOT_ACTIVE':
        return 'This run was closed because nothing arrived from it for 30 minutes.'
      case 'NETWORK_UNREACHABLE':
        return 'Can’t reach StrideMon. Check your connection and try again.'
      default:
        return error.message
    }
  }
  return 'Something went wrong. Try again.'
}
