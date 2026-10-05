import {
  getForegroundPermissionsAsync,
  hasServicesEnabledAsync,
  type LocationPermissionResponse,
  requestForegroundPermissionsAsync,
} from 'expo-location'

/**
 * Where the one location permission stands (D-020: "while using the app" only).
 * `blocked` means the OS won't show the prompt again, so only Settings can grant it.
 */
export type LocationPermissionState = 'granted' | 'notAsked' | 'denied' | 'blocked'

export async function readLocationPermissionState(): Promise<LocationPermissionState> {
  return toLocationPermissionState(await getForegroundPermissionsAsync())
}

/** Shows the OS prompt, after the explainer screen. */
export async function requestLocationPermission(): Promise<LocationPermissionState> {
  return toLocationPermissionState(await requestForegroundPermissionsAsync())
}

/** Whether the phone's location setting is on at all. */
export function isLocationServiceEnabled(): Promise<boolean> {
  return hasServicesEnabledAsync()
}

function toLocationPermissionState({
  status,
  canAskAgain,
}: LocationPermissionResponse): LocationPermissionState {
  if (status === 'granted') return 'granted'
  if (!canAskAgain) return 'blocked'
  return status === 'undetermined' ? 'notAsked' : 'denied'
}
