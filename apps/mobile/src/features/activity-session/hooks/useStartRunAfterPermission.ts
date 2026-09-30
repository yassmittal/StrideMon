import { router } from 'expo-router'
import { useCallback, useEffect } from 'react'
import type { LocationPermissionState } from '../location-tracking/request-location-permission'
import { describeRunError } from '../run-error-messages'
import { useLocationPermissionRequest } from './useLocationPermissionRequest'
import { useStartActivitySession } from './useStartActivitySession'

/**
 * The explainer screen: asks for location, and once it's granted (here, or in
 * Settings) starts the run the player pressed START for, then opens it.
 */
export function useStartRunAfterPermission({
  sneakerTokenId,
  efficiency,
}: {
  sneakerTokenId: bigint
  efficiency: number
}): {
  permissionState: LocationPermissionState | 'checking'
  continueToRun: () => void
  isBusy: boolean
  errorMessage: string | null
} {
  const { permissionState, requestPermission, isRequesting } = useLocationPermissionRequest()
  const startActivitySessionMutation = useStartActivitySession()
  const { mutate: startActivitySession, status: startStatus } = startActivitySessionMutation

  const startGrantedRun = useCallback(() => {
    startActivitySession(
      { sneakerTokenId, efficiency },
      { onSuccess: () => router.replace('/run/active') },
    )
  }, [startActivitySession, sneakerTokenId, efficiency])

  useEffect(() => {
    if (permissionState === 'granted' && startStatus === 'idle') startGrantedRun()
  }, [permissionState, startStatus, startGrantedRun])

  const continueToRun = useCallback(() => {
    if (permissionState === 'granted') startGrantedRun()
    else requestPermission()
  }, [permissionState, startGrantedRun, requestPermission])

  return {
    permissionState,
    continueToRun,
    isBusy: isRequesting || startActivitySessionMutation.isPending,
    errorMessage:
      startActivitySessionMutation.error === null
        ? null
        : describeRunError(startActivitySessionMutation.error),
  }
}
