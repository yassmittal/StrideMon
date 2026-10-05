import { useCallback, useEffect, useState } from 'react'
import { AppState } from 'react-native'
import {
  type LocationPermissionState,
  readLocationPermissionState,
  requestLocationPermission,
} from '../location-tracking/request-location-permission'

/**
 * The explainer screen's permission state. Re-checks when the app comes back to
 * the foreground, so granting access in Settings is noticed without a restart.
 */
export function useLocationPermissionRequest(): {
  permissionState: LocationPermissionState | 'checking'
  requestPermission: () => void
  isRequesting: boolean
} {
  const [permissionState, setPermissionState] = useState<LocationPermissionState | 'checking'>(
    'checking',
  )
  const [isRequesting, setIsRequesting] = useState(false)

  const recheckPermission = useCallback(() => {
    readLocationPermissionState()
      .then(setPermissionState)
      .catch((error: unknown) => {
        console.error('Reading the location permission failed', error)
        setPermissionState('denied')
      })
  }, [])

  useEffect(() => {
    recheckPermission()
    const appStateSubscription = AppState.addEventListener('change', (appStateStatus) => {
      if (appStateStatus === 'active') recheckPermission()
    })
    return () => appStateSubscription.remove()
  }, [recheckPermission])

  const requestPermission = useCallback(() => {
    setIsRequesting(true)
    requestLocationPermission()
      .then(setPermissionState)
      .catch((error: unknown) => {
        console.error('Requesting the location permission failed', error)
        setPermissionState('denied')
      })
      .finally(() => setIsRequesting(false))
  }, [])

  return { permissionState, requestPermission, isRequesting }
}
