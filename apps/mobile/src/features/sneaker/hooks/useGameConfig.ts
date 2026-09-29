import { sneakerGameAbi } from '@stridemon/chain'
import { useReadContract } from 'wagmi'
import { contractAddresses } from '../../../lib/chain/contract-addresses'
import { monadChain } from '../../../lib/chain/monad-chain'

// The rules change only by an admin transaction (setGameConfig), so read them rarely.
const GAME_CONFIG_STALE_MILLISECONDS = 10 * 60 * 1000

/** The rules in force (`SneakerGame.getGameConfig`): max energy, max durability, regeneration. */
export function useGameConfig() {
  return useReadContract({
    address: contractAddresses.sneakerGame,
    abi: sneakerGameAbi,
    functionName: 'getGameConfig',
    chainId: monadChain.id,
    query: { staleTime: GAME_CONFIG_STALE_MILLISECONDS },
  })
}
