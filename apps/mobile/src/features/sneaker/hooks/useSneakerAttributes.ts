import { sneakerNftAbi } from '@stridemon/chain'
import { useReadContract } from 'wagmi'
import { contractAddresses } from '../../../lib/chain/contract-addresses'
import { monadChain } from '../../../lib/chain/monad-chain'

/**
 * The Sneaker's stored stats from `SneakerNft.getAttributes`. `storedEnergy`
 * doesn't include regeneration: show `useSneakerEnergy` for energy.
 */
export function useSneakerAttributes(sneakerTokenId: bigint | undefined) {
  return useReadContract({
    address: contractAddresses.sneakerNft,
    abi: sneakerNftAbi,
    functionName: 'getAttributes',
    args: sneakerTokenId === undefined ? undefined : [sneakerTokenId],
    chainId: monadChain.id,
    query: { enabled: sneakerTokenId !== undefined },
  })
}
