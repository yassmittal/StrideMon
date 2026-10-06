import type { ActivitySessionStatus } from '@stridemon/shared/domain'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { invalidateChainReads } from '../../../lib/chain/invalidate-chain-reads'
import { playSuccessHaptic } from '../../../lib/haptics/play-haptic'
import { fetchActivitySession } from '../api/activity-sessions-api'
import { ACTIVITY_SESSION_HISTORY_QUERY_KEY } from './useActivitySessionHistory'

// A Monad settlement lands in about a second, so this shows the result soon after.
const SETTLEMENT_POLL_INTERVAL_MILLISECONDS = 2_000

export function buildActivitySessionQueryKey(activitySessionId: string) {
  return ['activity-session', activitySessionId] as const
}

/**
 * One activity session from the API, for the summary screen. Polls while the
 * server is still validating or settling it. When a settlement lands, the chain
 * reads (Sneaker, energy, STRIDE) and the history are refreshed, so Home is current,
 * and a run that earned STRIDE buzzes.
 */
export function useActivitySession(activitySessionId: string) {
  const queryClient = useQueryClient()
  const activitySessionQuery = useQuery({
    queryKey: buildActivitySessionQueryKey(activitySessionId),
    queryFn: () => fetchActivitySession(activitySessionId),
    refetchInterval: (query) =>
      isAwaitingResult(query.state.data?.status) ? SETTLEMENT_POLL_INTERVAL_MILLISECONDS : false,
  })

  const status = activitySessionQuery.data?.status
  const hasEarnedReward = (activitySessionQuery.data?.settlement?.rewardedMinutes ?? 0) > 0
  const previousStatus = useRef(status)
  useEffect(() => {
    const hasJustSettled = isAwaitingResult(previousStatus.current) && status === 'settled'
    previousStatus.current = status
    if (!hasJustSettled) return
    if (hasEarnedReward) playSuccessHaptic()
    void invalidateChainReads(queryClient)
    void queryClient.invalidateQueries({ queryKey: ACTIVITY_SESSION_HISTORY_QUERY_KEY })
  }, [status, hasEarnedReward, queryClient])

  return activitySessionQuery
}

function isAwaitingResult(status: ActivitySessionStatus | undefined): boolean {
  return status === 'validating' || status === 'settling'
}
