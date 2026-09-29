import { sneakerNftAbi } from '@stridemon/chain'
import { getAddress } from 'viem'
import { useReadContract } from 'wagmi'
import { contractAddresses } from '../../../lib/chain/contract-addresses'
import { monadChain } from '../../../lib/chain/monad-chain'

// While the wallet owns no Sneaker the starter mint is on its way, so look again soon.
const OWNERSHIP_POLL_INTERVAL_MILLISECONDS = 3_000

export type OwnedSneaker =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'none' }
  | { status: 'owned'; sneakerTokenId: bigint }

/**
 * The player's Sneaker, read from `SneakerNft` (the chain is the source of truth).
 * One Sneaker per player for now, so it's the first one the wallet enumerates.
 */
export function useOwnedSneaker(walletAddress: string | undefined): {
  ownedSneaker: OwnedSneaker
  refetch: () => void
} {
  const ownerAddress = walletAddress === undefined ? undefined : getAddress(walletAddress)

  const sneakerCountQuery = useReadContract({
    address: contractAddresses.sneakerNft,
    abi: sneakerNftAbi,
    functionName: 'balanceOf',
    args: ownerAddress === undefined ? undefined : [ownerAddress],
    chainId: monadChain.id,
    query: {
      enabled: ownerAddress !== undefined,
      refetchInterval: (query) =>
        query.state.data === 0n ? OWNERSHIP_POLL_INTERVAL_MILLISECONDS : false,
    },
  })
  const ownsSneaker = sneakerCountQuery.data !== undefined && sneakerCountQuery.data > 0n

  const firstSneakerQuery = useReadContract({
    address: contractAddresses.sneakerNft,
    abi: sneakerNftAbi,
    functionName: 'tokenOfOwnerByIndex',
    args: ownerAddress === undefined ? undefined : [ownerAddress, 0n],
    chainId: monadChain.id,
    query: { enabled: ownsSneaker },
  })

  const refetch = () => {
    void sneakerCountQuery.refetch()
    if (ownsSneaker) void firstSneakerQuery.refetch()
  }

  if (sneakerCountQuery.isError || firstSneakerQuery.isError) {
    return { ownedSneaker: { status: 'error' }, refetch }
  }
  if (sneakerCountQuery.data === 0n) return { ownedSneaker: { status: 'none' }, refetch }
  if (firstSneakerQuery.data === undefined) return { ownedSneaker: { status: 'loading' }, refetch }
  return { ownedSneaker: { status: 'owned', sneakerTokenId: firstSneakerQuery.data }, refetch }
}
