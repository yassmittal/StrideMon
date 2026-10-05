import { useQuery } from '@tanstack/react-query'
import { ApiError } from '../../../lib/api-client'
import { fetchActivitySession } from '../api/activity-sessions-api'
import { openActivitySessionDatabase } from '../location-tracking/activity-session-database'
import {
  clearLocalActiveActivitySession,
  findLocalActiveActivitySession,
  type LocalActiveActivitySession,
} from '../location-tracking/local-active-activity-session'

export const LOCAL_ACTIVE_ACTIVITY_SESSION_QUERY_KEY = ['local-active-activity-session'] as const

/**
 * The run in progress on this device, if any: read from SQLite, then checked
 * with the API. A run the API has closed (finished, abandoned), or doesn't know
 * for this player, is forgotten here. Offline, the local run is kept, so it can
 * still be resumed.
 */
export function useLocalActiveActivitySession() {
  return useQuery({
    queryKey: LOCAL_ACTIVE_ACTIVITY_SESSION_QUERY_KEY,
    queryFn: readConfirmedLocalActiveActivitySession,
  })
}

export async function readConfirmedLocalActiveActivitySession(): Promise<LocalActiveActivitySession | null> {
  const database = await openActivitySessionDatabase()
  const localActiveActivitySession = await findLocalActiveActivitySession(database)
  if (localActiveActivitySession === null) return null

  try {
    const activitySession = await fetchActivitySession(localActiveActivitySession.activitySessionId)
    if (activitySession.status === 'active') return localActiveActivitySession
  } catch (error) {
    if (!(error instanceof ApiError)) throw error
    // Unreachable API: keep the run, so it can still be resumed offline.
    if (error.code === 'NETWORK_UNREACHABLE') return localActiveActivitySession
    // Not this player's run (another wallet signed in since): forget it below.
    if (error.code !== 'NOT_FOUND') throw error
  }
  await clearLocalActiveActivitySession(database, localActiveActivitySession.activitySessionId)
  return null
}
