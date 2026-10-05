import { sneakerGameAbi } from '@stridemon/chain'
import { useReadContract } from 'wagmi'
import { contractAddresses } from '../../../lib/chain/contract-addresses'
import { monadChain } from '../../../lib/chain/monad-chain'

// Pausing is an admin switch, so a short poll is enough to notice it both ways.
const GAME_PAUSED_POLL_MILLISECONDS = 15_000

/**
 * True while `SneakerGame` is paused for maintenance (D-032). Unknown counts as not
 * paused: a read that fails offline shouldn't put the app into maintenance.
 */
export function useIsGamePaused(): boolean {
  const pausedQuery = useReadContract({
    address: contractAddresses.sneakerGame,
    abi: sneakerGameAbi,
    functionName: 'paused',
    chainId: monadChain.id,
    query: { refetchInterval: GAME_PAUSED_POLL_MILLISECONDS },
  })
  return pausedQuery.data === true
}
