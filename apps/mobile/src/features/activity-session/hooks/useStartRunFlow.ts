import { router } from 'expo-router'
import { useCallback } from 'react'
import { readLocationPermissionState } from '../location-tracking/request-location-permission'
import { describeRunError } from '../run-error-messages'
import { useStartActivitySession } from './useStartActivitySession'

type StartRunInput = { sneakerTokenId: bigint; efficiency: number }

/**
 * START on Home: straight into the run when location is already allowed,
 * otherwise to the explainer screen, which asks and then starts the run itself.
 */
export function useStartRunFlow(): {
  startRun: (startRunInput: StartRunInput) => void
  isStarting: boolean
  errorMessage: string | null
} {
  const startActivitySessionMutation = useStartActivitySession()
  const { mutate: startActivitySession } = startActivitySessionMutation

  const startRun = useCallback(
    (startRunInput: StartRunInput) => {
      readLocationPermissionState()
        .catch((error: unknown) => {
          console.error('Reading the location permission failed', error)
          return 'notAsked' as const
        })
        .then((permissionState) => {
          if (permissionState !== 'granted') {
            router.push({
              pathname: '/run/location-permission',
              params: {
                sneakerTokenId: startRunInput.sneakerTokenId.toString(),
                efficiency: String(startRunInput.efficiency),
              },
            })
            return
          }
          startActivitySession(startRunInput, { onSuccess: () => router.push('/run/active') })
        })
    },
    [startActivitySession],
  )

  return {
    startRun,
    isStarting: startActivitySessionMutation.isPending,
    errorMessage:
      startActivitySessionMutation.error === null
        ? null
        : describeRunError(startActivitySessionMutation.error),
  }
}
