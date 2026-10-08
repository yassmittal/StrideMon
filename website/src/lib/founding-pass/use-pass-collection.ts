'use client'

import { useSyncExternalStore } from 'react'
import { passCollectionApiUrl } from '@/content/site'
import { fetchPassCollection, type PassCollection } from './pass-collection'
import { calculatePassSchedulePosition, isMintingPhase } from './pass-schedule'

// The gallery's live state, shared by every part of the page that shows it (D-044): one request,
// then a refresh every 15 seconds while minting is open and the tab is visible, every 2 minutes
// otherwise. A failed refresh keeps the last answer.

const MINTING_REFRESH_MILLISECONDS = 15_000
const QUIET_REFRESH_MILLISECONDS = 120_000

export type PassCollectionState = {
  collection: PassCollection | null
  /** `failed`: the last request didn't get an answer. With no collection, the minted state is unknown. */
  requestStatus: 'loading' | 'loaded' | 'failed'
}

const initialState: PassCollectionState = { collection: null, requestStatus: 'loading' }

let state = initialState
let lastAnsweredAtMilliseconds = 0
let refreshTimeoutId: number | undefined
let isRequestInFlight = false
const listeners = new Set<() => void>()

function setState(nextState: PassCollectionState): void {
  state = nextState
  for (const listener of listeners) listener()
}

function readRefreshMilliseconds(): number {
  const collection = state.collection
  if (collection === null) return QUIET_REFRESH_MILLISECONDS
  const { phase } = calculatePassSchedulePosition({
    scheduleTimes: collection.scheduleTimes,
    mintedCount: collection.mintedCount,
    now: new Date(),
  })
  return isMintingPhase(phase) ? MINTING_REFRESH_MILLISECONDS : QUIET_REFRESH_MILLISECONDS
}

async function requestCollection(): Promise<void> {
  if (isRequestInFlight) return
  isRequestInFlight = true
  window.clearTimeout(refreshTimeoutId)
  if (state.requestStatus === 'failed') setState({ ...state, requestStatus: 'loading' })
  const collection = await fetchPassCollection(passCollectionApiUrl)
  isRequestInFlight = false
  if (collection === null) {
    setState({ collection: state.collection, requestStatus: 'failed' })
  } else {
    lastAnsweredAtMilliseconds = Date.now()
    setState({ collection, requestStatus: 'loaded' })
  }
  scheduleRefresh()
}

function scheduleRefresh(): void {
  window.clearTimeout(refreshTimeoutId)
  if (listeners.size === 0) return
  refreshTimeoutId = window.setTimeout(() => {
    // A hidden tab waits; it refreshes as soon as it's shown again.
    if (document.visibilityState === 'visible') void requestCollection()
  }, readRefreshMilliseconds())
}

function refreshWhenShown(): void {
  if (document.visibilityState !== 'visible') return
  if (Date.now() - lastAnsweredAtMilliseconds >= readRefreshMilliseconds()) {
    void requestCollection()
  }
}

function subscribeToCollection(listener: () => void): () => void {
  listeners.add(listener)
  if (listeners.size === 1) {
    document.addEventListener('visibilitychange', refreshWhenShown)
    if (!isRequestInFlight) {
      const isStale = Date.now() - lastAnsweredAtMilliseconds >= readRefreshMilliseconds()
      if (isStale) void requestCollection()
      else scheduleRefresh()
    }
  }
  return () => unsubscribeFromCollection(listener)
}

function unsubscribeFromCollection(listener: () => void): void {
  listeners.delete(listener)
  if (listeners.size > 0) return
  document.removeEventListener('visibilitychange', refreshWhenShown)
  window.clearTimeout(refreshTimeoutId)
}

/** The last answer, for code outside React (the mint's similar passes). */
export function readLatestPassCollection(): PassCollection | null {
  return state.collection
}

/** Asks again now, for the "Try again" buttons. */
export function retryPassCollection(): void {
  void requestCollection()
}

export function usePassCollection(): PassCollectionState {
  return useSyncExternalStore(
    subscribeToCollection,
    () => state,
    () => initialState,
  )
}
