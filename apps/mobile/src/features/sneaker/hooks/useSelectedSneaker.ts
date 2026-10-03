import { pickSneaker, useSelectedSneakerStore } from '../selected-sneaker-store'
import { type OwnedSneakers, useOwnedSneakers } from './useOwnedSneakers'

export type SelectedSneaker =
  | Exclude<OwnedSneakers, { status: 'owned' }>
  | { status: 'owned'; sneakerTokenIds: readonly bigint[]; selectedSneakerTokenId: bigint }

/**
 * The wallet's Sneakers and the one that START, repair, upgrade and transfer act on:
 * the picked one while the wallet still owns it, otherwise the first.
 */
export function useSelectedSneaker(walletAddress: string | undefined): {
  selectedSneaker: SelectedSneaker
  pickSneaker: (sneakerTokenId: bigint) => void
  refetch: () => void
} {
  const { ownedSneakers, refetch } = useOwnedSneakers(walletAddress)
  const pickedSneakerTokenId = useSelectedSneakerStore((state) => state.pickedSneakerTokenId)

  if (ownedSneakers.status !== 'owned') {
    return { selectedSneaker: ownedSneakers, pickSneaker, refetch }
  }
  const { sneakerTokenIds } = ownedSneakers
  const selectedSneakerTokenId =
    pickedSneakerTokenId !== null && sneakerTokenIds.includes(pickedSneakerTokenId)
      ? pickedSneakerTokenId
      : sneakerTokenIds[0]
  if (selectedSneakerTokenId === undefined) {
    return { selectedSneaker: { status: 'loading' }, pickSneaker, refetch }
  }
  return {
    selectedSneaker: { status: 'owned', sneakerTokenIds, selectedSneakerTokenId },
    pickSneaker,
    refetch,
  }
}
