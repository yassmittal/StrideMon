import { create } from 'zustand'

/**
 * The Sneaker the player picked on Home or the Sneaker tab, shared by both (D-027).
 * `null` until they pick one. It may name a Sneaker the wallet no longer owns, so
 * read it through `useSelectedSneaker`, which falls back to the first owned one.
 */
export const useSelectedSneakerStore = create<{ pickedSneakerTokenId: bigint | null }>(() => ({
  pickedSneakerTokenId: null,
}))

export function pickSneaker(sneakerTokenId: bigint): void {
  useSelectedSneakerStore.setState({ pickedSneakerTokenId: sneakerTokenId })
}
