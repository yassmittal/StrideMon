import type { ActivitySession } from '@stridemon/shared/api-contracts'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '../../../lib/api-client'
import { playRunStoppedHaptic } from '../../../lib/haptics/play-haptic'
import { finishActivitySession } from '../api/activity-sessions-api'
import { openActivitySessionDatabase } from '../location-tracking/activity-session-database'
import { clearLocalActiveActivitySession } from '../location-tracking/local-active-activity-session'
import { flushLocationSamples } from '../location-tracking/location-sample-uploader'
import { stopLocationTracking } from '../location-tracking/location-updates'
import { buildActivitySessionQueryKey } from './useActivitySession'
import { ACTIVITY_SESSION_HISTORY_QUERY_KEY } from './useActivitySessionHistory'
import { LOCAL_ACTIVE_ACTIVITY_SESSION_QUERY_KEY } from './useLocalActiveActivitySession'

/**
 * STOP: stops GPS, uploads every buffered sample, asks the API to validate, and
 * forgets the run on the device. Safe to retry after any failure: tracking is
 * already stopped, uploads and finish are idempotent, and the buffer is only
 * cleared once the API has the finished session.
 */
export function useFinishActivitySession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: finishRun,
    onMutate: playRunStoppedHaptic,
    onSuccess: (activitySession) => {
      queryClient.setQueryData(
        buildActivitySessionQueryKey(activitySession.activitySessionId),
        activitySession,
      )
    },
    // Not awaited: the caller navigates to the summary first, so the run screen
    // never re-renders as "no run in progress" on its way out.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: LOCAL_ACTIVE_ACTIVITY_SESSION_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: ACTIVITY_SESSION_HISTORY_QUERY_KEY })
    },
  })
}

async function finishRun(activitySessionId: string): Promise<ActivitySession> {
  await stopLocationTracking()
  const database = await openActivitySessionDatabase()
  try {
    await flushLocationSamples(activitySessionId)
    const activitySession = await finishActivitySession(activitySessionId)
    await clearLocalActiveActivitySession(database, activitySessionId)
    return activitySession
  } catch (error) {
    // The API already closed this run (abandoned): nothing left to send.
    if (error instanceof ApiError && error.code === 'ACTIVITY_SESSION_NOT_ACTIVE') {
      await clearLocalActiveActivitySession(database, activitySessionId)
    }
    throw error
  }
}
