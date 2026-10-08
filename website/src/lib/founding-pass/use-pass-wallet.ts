'use client'

import { useSyncExternalStore } from 'react'
import type * as PassWalletConnection from './wallet/pass-wallet-connection'
import type { PassWalletAccount } from './wallet/pass-wallet-connection'

// The wallet code, loaded on demand (D-045). `requestPassWallet()` asks `PassWalletLoader` to
// mount the wallet bridge (through `next/dynamic` with `ssr: false`), and the bridge hands the
// loaded module back here. Until someone taps "Connect wallet", nothing of it is downloaded.

export type PassWalletApi = typeof PassWalletConnection

export type PassWalletState = {
  loadStatus: 'idle' | 'loading' | 'ready' | 'failed'
  account: PassWalletAccount | null
}

const initialState: PassWalletState = { loadStatus: 'idle', account: null }

let state = initialState
let walletApi: PassWalletApi | null = null
let waitingRequests: {
  resolve: (api: PassWalletApi) => void
  reject: (error: Error) => void
}[] = []
const listeners = new Set<() => void>()

function setState(nextState: PassWalletState): void {
  state = nextState
  for (const listener of listeners) listener()
}

/** The wallet module, loading it first if needed. Rejects when it can't be downloaded. */
export function requestPassWallet(): Promise<PassWalletApi> {
  if (walletApi !== null) return Promise.resolve(walletApi)
  return new Promise((resolve, reject) => {
    waitingRequests.push({ resolve, reject })
    if (state.loadStatus !== 'loading') setState({ ...state, loadStatus: 'loading' })
  })
}

/** Called by the bridge once the module has loaded. */
export function registerPassWallet(loadedApi: PassWalletApi): void {
  if (walletApi !== null) return
  walletApi = loadedApi
  setState({ loadStatus: 'ready', account: loadedApi.readPassWalletAccount() })
  loadedApi.subscribeToPassWalletAccount((account) => setState({ ...state, account }))
  for (const waitingRequest of waitingRequests) waitingRequest.resolve(loadedApi)
  waitingRequests = []
}

/** Called when the module couldn't be downloaded (offline, or a new deploy removed the file). */
export function failPassWalletLoad(): void {
  setState({ ...state, loadStatus: 'failed' })
  for (const waitingRequest of waitingRequests) {
    waitingRequest.reject(new Error('The wallet code did not load'))
  }
  waitingRequests = []
}

/** Disconnects the wallet if its code is loaded. Nothing to do otherwise. */
export async function disconnectLoadedPassWallet(): Promise<void> {
  try {
    await walletApi?.disconnectPassWallet()
  } catch {
    // Already gone.
  }
}

function subscribeToWallet(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function usePassWallet(): PassWalletState {
  return useSyncExternalStore(
    subscribeToWallet,
    () => state,
    () => initialState,
  )
}
