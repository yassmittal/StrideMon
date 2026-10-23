import { useSyncExternalStore } from 'react'

// A store for a few values that React and the 3D frame loop both read (brief §7.1: one small
// store for the visit). Plain `useSyncExternalStore`, no library.

export type SmallStore<State> = {
  read: () => State
  update: (changes: Partial<State>) => void
  subscribe: (listener: () => void) => () => void
}

export function createSmallStore<State extends object>(initialState: State): SmallStore<State> {
  let state = initialState
  const listeners = new Set<() => void>()
  return {
    read: () => state,
    update: (changes) => {
      state = { ...state, ...changes }
      for (const listener of listeners) listener()
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

export function useSmallStore<State extends object, Selected>(
  store: SmallStore<State>,
  select: (state: State) => Selected,
): Selected {
  return useSyncExternalStore(
    store.subscribe,
    () => select(store.read()),
    () => select(store.read()),
  )
}
