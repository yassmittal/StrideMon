import { useQuery } from '@tanstack/react-query'
import { fetchActivitySession } from '../api/activity-sessions-api'

export function buildActivitySessionQueryKey(activitySessionId: string) {
  return ['activity-session', activitySessionId] as const
}

/** One activity session from the API, e.g. for the summary screen. */
export function useActivitySession(activitySessionId: string) {
  return useQuery({
    queryKey: buildActivitySessionQueryKey(activitySessionId),
    queryFn: () => fetchActivitySession(activitySessionId),
  })
}
