'use client'

import { useSyncExternalStore } from 'react'
import { passCollectionApiUrl } from '@/content/showroom'
import { fetchPassCollection, type PassCollection, readPassSchedulePhase } from './pass-collection'
import { isMintingPhase } from './pass-schedule'

// The minted state, with the website's timing (its `use-pass-collection.ts`, D-044): one request,
// then a refresh every 15 seconds while minting is open and the tab is visible, every 2 minutes
// otherwise. A failed request keeps the last answer and tries again after 30 seconds, so a quiet
// line can say it's unavailable and go away by itself.

const MINTING_REFRESH_MILLISECONDS = 15_000
const QUIET_REFRESH_MILLISECONDS = 120_000
const RETRY_MILLISECONDS = 30_000

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
  if (state.requestStatus === 'failed') return RETRY_MILLISECONDS
  if (state.collection === null) return QUIET_REFRESH_MILLISECONDS
  const phase = readPassSchedulePhase(state.collection, new Date())
  return isMintingPhase(phase) ? MINTING_REFRESH_MILLISECONDS : QUIET_REFRESH_MILLISECONDS
}

async function requestCollection(): Promise<void> {
  if (isRequestInFlight) return
  isRequestInFlight = true
  window.clearTimeout(refreshTimeoutId)
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
  return () => {
    listeners.delete(listener)
    if (listeners.size > 0) return
    document.removeEventListener('visibilitychange', refreshWhenShown)
    window.clearTimeout(refreshTimeoutId)
  }
}

/** The last answer, for code outside React ("Surprise me"). */
export function readLatestPassCollection(): PassCollection | null {
  return state.collection
}

export function usePassCollection(): PassCollectionState {
  return useSyncExternalStore(
    subscribeToCollection,
    () => state,
    () => initialState,
  )
}
