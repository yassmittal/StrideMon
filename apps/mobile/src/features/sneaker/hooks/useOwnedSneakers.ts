import { sneakerGameAbi, sneakerNftAbi } from '@stridemon/chain'
import { getAddress } from 'viem'
import { useReadContract, useReadContracts } from 'wagmi'
import { contractAddresses } from '../../../lib/chain/contract-addresses'
import { monadChain } from '../../../lib/chain/monad-chain'

// While the wallet owns no Sneaker, a starter mint or an incoming transfer may be on its
// way, so look again soon.
const OWNERSHIP_POLL_INTERVAL_MILLISECONDS = 3_000

export type OwnedSneakers =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'none'; hasClaimedStarterSneaker: boolean }
  | { status: 'owned'; sneakerTokenIds: readonly bigint[] }

/**
 * Every Sneaker the wallet owns, read from `SneakerNft` (the chain is the source of
 * truth). With none, it also reads whether the starter was already claimed, so Home
 * can tell "starter on its way" from "sent the only Sneaker away" (D-027).
 */
export function useOwnedSneakers(walletAddress: string | undefined): {
  ownedSneakers: OwnedSneakers
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
  const sneakerCount = sneakerCountQuery.data

  const sneakerTokenIdsQuery = useReadContracts({
    contracts:
      ownerAddress === undefined || sneakerCount === undefined
        ? []
        : toSneakerIndexes(sneakerCount).map(
            (sneakerIndex) =>
              ({
                address: contractAddresses.sneakerNft,
                abi: sneakerNftAbi,
                functionName: 'tokenOfOwnerByIndex',
                args: [ownerAddress, sneakerIndex],
                chainId: monadChain.id,
              }) as const,
          ),
    allowFailure: false,
    query: { enabled: sneakerCount !== undefined && sneakerCount > 0n },
  })

  const hasClaimedStarterSneakerQuery = useReadContract({
    address: contractAddresses.sneakerGame,
    abi: sneakerGameAbi,
    functionName: 'hasClaimedStarterSneaker',
    args: ownerAddress === undefined ? undefined : [ownerAddress],
    chainId: monadChain.id,
    query: { enabled: sneakerCount === 0n },
  })

  const refetch = () => {
    void sneakerCountQuery.refetch()
    if (sneakerCount !== undefined && sneakerCount > 0n) void sneakerTokenIdsQuery.refetch()
    if (sneakerCount === 0n) void hasClaimedStarterSneakerQuery.refetch()
  }

  if (
    sneakerCountQuery.isError ||
    sneakerTokenIdsQuery.isError ||
    hasClaimedStarterSneakerQuery.isError
  ) {
    return { ownedSneakers: { status: 'error' }, refetch }
  }
  if (sneakerCount === 0n) {
    const hasClaimedStarterSneaker = hasClaimedStarterSneakerQuery.data
    return {
      ownedSneakers:
        hasClaimedStarterSneaker === undefined
          ? { status: 'loading' }
          : { status: 'none', hasClaimedStarterSneaker },
      refetch,
    }
  }
  const sneakerTokenIds = sneakerTokenIdsQuery.data
  // The list can lag one read behind the count right after a transfer; wait for them to agree.
  if (sneakerTokenIds === undefined || BigInt(sneakerTokenIds.length) !== sneakerCount) {
    return { ownedSneakers: { status: 'loading' }, refetch }
  }
  return { ownedSneakers: { status: 'owned', sneakerTokenIds }, refetch }
}

/** `0n … count - 1n`. A wallet holds a handful of Sneakers, so the count fits a number. */
function toSneakerIndexes(sneakerCount: bigint): bigint[] {
  return Array.from({ length: Number(sneakerCount) }, (_, sneakerIndex) => BigInt(sneakerIndex))
}
