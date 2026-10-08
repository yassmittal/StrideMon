'use client'

import { useSyncExternalStore } from 'react'

// Favourite passes, kept in this browser only (D-044). Storage can be missing or blocked (a
// private window, cleared site data), so every read and write is wrapped and the page works
// without it: the hearts then last until the tab closes.

const FAVOURITES_STORAGE_KEY = 'stridemon:favourite-passes'
const noFavourites: readonly number[] = []

let favouriteDesignNumbers: readonly number[] | null = null
const listeners = new Set<() => void>()

function readStoredFavourites(): readonly number[] {
  try {
    const storedText = window.localStorage.getItem(FAVOURITES_STORAGE_KEY)
    if (storedText === null) return noFavourites
    const storedValue: unknown = JSON.parse(storedText)
    if (!Array.isArray(storedValue)) return noFavourites
    return storedValue.filter(
      (entry): entry is number => Number.isInteger(entry) && entry >= 1 && entry <= 1000,
    )
  } catch {
    return noFavourites
  }
}

function writeStoredFavourites(designNumbers: readonly number[]): void {
  try {
    window.localStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify(designNumbers))
  } catch {
    // Storage is full or blocked: the hearts still work for this visit.
  }
}

function readFavouritesSnapshot(): readonly number[] {
  favouriteDesignNumbers ??= readStoredFavourites()
  return favouriteDesignNumbers
}

function notifyListeners(): void {
  for (const listener of listeners) listener()
}

function subscribeToFavourites(listener: () => void): () => void {
  listeners.add(listener)
  // Another tab changed them.
  const readOtherTab = (event: StorageEvent) => {
    if (event.key !== FAVOURITES_STORAGE_KEY) return
    favouriteDesignNumbers = readStoredFavourites()
    notifyListeners()
  }
  window.addEventListener('storage', readOtherTab)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', readOtherTab)
  }
}

export function toggleFavouritePass(designNumber: number): void {
  const current = readFavouritesSnapshot()
  favouriteDesignNumbers = current.includes(designNumber)
    ? current.filter((favourite) => favourite !== designNumber)
    : [...current, designNumber]
  writeStoredFavourites(favouriteDesignNumbers)
  notifyListeners()
}

/** The hearted design numbers, in the order they were hearted. Empty on the server. */
export function useFavouritePasses(): readonly number[] {
  return useSyncExternalStore(subscribeToFavourites, readFavouritesSnapshot, () => noFavourites)
}
