import { sneakerNftAbi } from '@stridemon/chain'
import { useReadContract } from 'wagmi'
import { contractAddresses } from '../../../lib/chain/contract-addresses'
import { monadChain } from '../../../lib/chain/monad-chain'

/**
 * Whether the Sneaker is a Founder Sneaker, from `SneakerNft.foundingPassTokenIdOf` (0 for a
 * normal Sneaker, D-042). `undefined` while it loads. Founder Sneakers can't be sent.
 */
export function useIsFounderSneaker(sneakerTokenId: bigint): boolean | undefined {
  const foundingPassTokenIdQuery = useReadContract({
    address: contractAddresses.sneakerNft,
    abi: sneakerNftAbi,
    functionName: 'foundingPassTokenIdOf',
    args: [sneakerTokenId],
    chainId: monadChain.id,
  })
  const foundingPassTokenId = foundingPassTokenIdQuery.data
  // A failed read counts as a normal Sneaker: the contract refuses a Founder Sneaker's transfer anyway.
  if (foundingPassTokenIdQuery.isError) return false
  return foundingPassTokenId === undefined ? undefined : foundingPassTokenId !== 0n
}
