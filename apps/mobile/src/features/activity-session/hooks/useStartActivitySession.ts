import type { ActivitySession } from '@stridemon/shared/api-contracts'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '../../../lib/api-client'
import { playRunStartedHaptic } from '../../../lib/haptics/play-haptic'
import { fetchActivitySession, startActivitySession } from '../api/activity-sessions-api'
import { openActivitySessionDatabase } from '../location-tracking/activity-session-database'
import { ensureLocationTracking } from '../location-tracking/ensure-location-tracking'
import {
  type LocalActiveActivitySession,
  saveLocalActiveActivitySession,
} from '../location-tracking/local-active-activity-session'
import { LOCAL_ACTIVE_ACTIVITY_SESSION_QUERY_KEY } from './useLocalActiveActivitySession'

type StartActivitySessionInput = {
  sneakerTokenId: bigint
  /** The Sneaker's efficiency from the chain, for the live reward estimate. */
  efficiency: number
}

/**
 * START: opens the session on the API, remembers it on the device, then starts
 * GPS. Location permission must already be granted (the explainer screen asks).
 */
export function useStartActivitySession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: startRun,
    // Straight into the cache, so the run screen opens on the new run, not a stale "none".
    onSuccess: (localActiveActivitySession) => {
      playRunStartedHaptic()
      queryClient.setQueryData(LOCAL_ACTIVE_ACTIVITY_SESSION_QUERY_KEY, localActiveActivitySession)
    },
    // A failure may still have saved the run (GPS didn't start): Home then offers Resume.
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: LOCAL_ACTIVE_ACTIVITY_SESSION_QUERY_KEY })
    },
  })
}

async function startRun({
  sneakerTokenId,
  efficiency,
}: StartActivitySessionInput): Promise<LocalActiveActivitySession> {
  const activitySession = await startOrAdoptActivitySession(sneakerTokenId)
  const localActiveActivitySession: LocalActiveActivitySession = {
    activitySessionId: activitySession.activitySessionId,
    sneakerTokenId,
    startedAt: activitySession.startedAt,
    energyAtStart: activitySession.energyAtStart,
    efficiency,
  }
  const database = await openActivitySessionDatabase()
  await saveLocalActiveActivitySession(database, localActiveActivitySession)
  // After saving: if GPS fails to start, Home still offers Resume or Finish.
  await ensureLocationTracking()
  return localActiveActivitySession
}

/**
 * Starts a session, or picks up the player's own session that's already active
 * with this Sneaker (the app was reinstalled, or its data cleared, mid-run).
 */
async function startOrAdoptActivitySession(sneakerTokenId: bigint): Promise<ActivitySession> {
  try {
    return await startActivitySession(sneakerTokenId)
  } catch (error) {
    const activeActivitySessionId = readActiveActivitySessionId(error)
    if (activeActivitySessionId === null) throw error
    const activeActivitySession = await fetchActivitySession(activeActivitySessionId)
    if (activeActivitySession.sneakerTokenId !== sneakerTokenId.toString()) throw error
    return activeActivitySession
  }
}

function readActiveActivitySessionId(error: unknown): string | null {
  if (!(error instanceof ApiError) || error.code !== 'ACTIVITY_SESSION_ALREADY_ACTIVE') return null
  const activitySessionId = error.details?.activitySessionId
  return typeof activitySessionId === 'string' ? activitySessionId : null
}
