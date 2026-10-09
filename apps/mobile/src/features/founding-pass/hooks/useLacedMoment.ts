import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { invalidateChainReads } from '../../../lib/chain/invalidate-chain-reads'
import { playLacedHaptic } from '../../../lib/haptics/play-haptic'
import { type HeldFoundingPass, useFoundingPass } from './useFoundingPass'

// The lacing transaction follows the settlement within seconds (D-043).
const LACING_POLL_INTERVAL_MILLISECONDS = 3_000

/**
 * For the run summary (D-046): once the run settles, watches the wallet's pass while it's
 * unlaced. Returns the pass when this screen saw it turn laced, so an old run never replays the
 * moment. That moment buzzes once and re-reads every chain value, so both pictures change.
 */
export function useLacedMoment({
  walletAddress,
  isSettled,
}: {
  walletAddress: string | undefined
  isSettled: boolean
}): HeldFoundingPass | null {
  const queryClient = useQueryClient()
  const { foundingPassState } = useFoundingPass(walletAddress, {
    lacingPollIntervalMilliseconds: isSettled ? LACING_POLL_INTERVAL_MILLISECONDS : false,
  })
  const heldFoundingPass =
    foundingPassState.status === 'held' ? foundingPassState.foundingPass : null
  const isLaced = heldFoundingPass?.isLaced
  const hasSeenUnlaced = useRef(false)
  const [hasJustLaced, setHasJustLaced] = useState(false)

  useEffect(() => {
    if (isLaced === false) {
      hasSeenUnlaced.current = true
      return
    }
    if (isLaced !== true || !hasSeenUnlaced.current) return
    hasSeenUnlaced.current = false
    setHasJustLaced(true)
    playLacedHaptic()
    void invalidateChainReads(queryClient)
  }, [isLaced, queryClient])

  return hasJustLaced ? heldFoundingPass : null
}
