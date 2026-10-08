import type { FoundingPassCollectionState } from './founding-pass-chain-reader'

/** The chain's collection state, and when it was read. */
export type CachedFoundingPassCollectionState = FoundingPassCollectionState & { readAt: Date }

export type CachedFoundingPassCollectionReader = {
  /** The state, read from the chain at most once per cache period. */
  read: (now: Date) => Promise<CachedFoundingPassCollectionState>
}

/**
 * Keeps one chain read of the collection for a few seconds, so the gallery's polling and a mint
 * rush cost the RPC two calls per period, not two per request (D-043). Requests that arrive while
 * a read is in flight share it.
 */
export function createCachedFoundingPassCollectionReader({
  readCollectionState,
  cacheMilliseconds,
}: {
  readCollectionState: () => Promise<FoundingPassCollectionState>
  cacheMilliseconds: number
}): CachedFoundingPassCollectionReader {
  let cachedState: CachedFoundingPassCollectionState | null = null
  let readInFlight: Promise<CachedFoundingPassCollectionState> | null = null

  return {
    read: (now) => {
      if (
        cachedState !== null &&
        now.getTime() - cachedState.readAt.getTime() < cacheMilliseconds
      ) {
        return Promise.resolve(cachedState)
      }
      if (readInFlight !== null) return readInFlight
      readInFlight = readCollectionState()
        .then((collectionState) => {
          cachedState = { ...collectionState, readAt: now }
          return cachedState
        })
        .finally(() => {
          readInFlight = null
        })
      return readInFlight
    },
  }
}
