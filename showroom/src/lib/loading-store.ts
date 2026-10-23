import { createSmallStore } from './create-small-store'

// The store's loading (Part 4): what the loader draws, and what the page shows when the 3D store
// can't run. The progress is real (brief §4): the code arriving, each file, then the shaders, never
// a timer.

/**
 * `loading` until the shaders are compiled and the first frames are drawn; `ready` after. The rest
 * are the fallbacks: no WebGL (or a canvas that couldn't start), a lost context, files that failed.
 */
export type LoadingPhase = 'loading' | 'ready' | 'noWebgl' | 'contextLost' | 'filesFailed'

export type LoadingState = {
  phase: LoadingPhase
  /** The page's own code has run (hydrated). It carries three.js: the walk's maths uses it. */
  isPageCodeLoaded: boolean
  /** The store's own code (the canvas chunk: React Three Fiber, drei, the effects) has arrived. */
  isStoreCodeLoaded: boolean
  loadedFileCount: number
  totalFileCount: number
  /** The shaders are compiled and the first frames are drawn under the loader. */
  isSceneWarm: boolean
}

export const loadingStore = createSmallStore<LoadingState>({
  phase: 'loading',
  isPageCodeLoaded: false,
  isStoreCodeLoaded: false,
  loadedFileCount: 0,
  totalFileCount: 1,
  isSceneWarm: false,
})

/**
 * How much of the loader's mark is drawn, 0 to 1, weighted by what each step costs on a phone:
 * the page's code is the biggest download (about 400 KB gzipped, three.js included), the store's
 * chunk and the files come next, and the shaders draw the lime stroke last.
 */
export const LOADING_WEIGHTS = {
  pageCode: 0.3,
  storeCode: 0.1,
  files: 0.45,
  scene: 0.15,
} as const

export function readLoadingProgress(state: LoadingState): number {
  const fileShare = Math.min(state.loadedFileCount / Math.max(state.totalFileCount, 1), 1)
  return (
    (state.isPageCodeLoaded ? LOADING_WEIGHTS.pageCode : 0) +
    (state.isStoreCodeLoaded ? LOADING_WEIGHTS.storeCode : 0) +
    fileShare * LOADING_WEIGHTS.files +
    (state.isSceneWarm ? LOADING_WEIGHTS.scene : 0)
  )
}

/** A fallback replaces the loader; a later failure never replaces an earlier one. */
export function showLoadingFallback(phase: Exclude<LoadingPhase, 'loading' | 'ready'>): void {
  const current = loadingStore.read().phase
  if (current === 'loading' || current === 'ready') loadingStore.update({ phase })
}
