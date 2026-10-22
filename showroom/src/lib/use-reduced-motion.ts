'use client'

import { useSyncExternalStore } from 'react'

// `prefers-reduced-motion`, live: the walk cuts under a short fade instead of flying (brief §4).

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(listener: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION_QUERY)
  query.addEventListener('change', listener)
  return () => query.removeEventListener('change', listener)
}

export function readIsReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

export function useIsReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, readIsReducedMotion, () => false)
}

/** Whether the visitor walks with a finger (the words say "Swipe") or a wheel ("Scroll"). */
export function readIsTouchFirst(): boolean {
  return window.matchMedia('(pointer: coarse)').matches
}
