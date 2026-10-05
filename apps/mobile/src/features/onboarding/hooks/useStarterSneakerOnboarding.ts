import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { fetchOnboardingStatus, requestStarterSneaker } from '../api/onboarding-api'
import {
  isOnboardingInProgress,
  type StarterSneakerMintingState,
  toStarterSneakerMintingState,
} from '../starter-sneaker-minting-state'

const ONBOARDING_STATUS_QUERY_KEY = ['onboarding-status'] as const

// A Monad transaction lands in about 2 s, so this sees each step soon after it happens.
const STATUS_POLL_INTERVAL_MILLISECONDS = 2_000

/**
 * For a signed-in player without a Sneaker: requests the starter Sneaker once
 * (idempotent on the API), then polls its status until both transactions settle.
 */
export function useStarterSneakerOnboarding(): {
  mintingState: StarterSneakerMintingState
  retry: () => void
  isRetrying: boolean
} {
  const queryClient = useQueryClient()
  const {
    mutate: sendStarterSneakerRequest,
    reset: resetStarterSneakerRequest,
    status: requestStatus,
    error: requestError,
  } = useMutation({
    mutationFn: requestStarterSneaker,
    onSuccess: (onboardingStatus) => {
      queryClient.setQueryData(ONBOARDING_STATUS_QUERY_KEY, onboardingStatus)
    },
  })

  useEffect(() => {
    if (requestStatus === 'idle') sendStarterSneakerRequest()
  }, [requestStatus, sendStarterSneakerRequest])

  const statusQuery = useQuery({
    queryKey: ONBOARDING_STATUS_QUERY_KEY,
    queryFn: fetchOnboardingStatus,
    enabled: requestStatus === 'success',
    refetchInterval: (query) =>
      isOnboardingInProgress(query.state.data) ? STATUS_POLL_INTERVAL_MILLISECONDS : false,
  })

  const { refetch: refetchStatus } = statusQuery
  const retry = useCallback(() => {
    // Back to idle, and the effect above sends the request again.
    if (requestStatus === 'error') resetStarterSneakerRequest()
    else void refetchStatus()
  }, [requestStatus, resetStarterSneakerRequest, refetchStatus])

  const onboardingStatus = requestStatus === 'success' ? statusQuery.data : undefined
  return {
    mintingState: toStarterSneakerMintingState({
      requestError: requestError ?? (onboardingStatus === undefined ? statusQuery.error : null),
      onboardingStatus,
    }),
    retry,
    isRetrying: requestStatus === 'pending' || statusQuery.isRefetching,
  }
}
