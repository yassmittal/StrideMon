'use client'

import dynamic from 'next/dynamic'
import { Component, type ReactNode, useEffect, useRef, useState } from 'react'
import { useSmallStore } from '@/lib/create-small-store'
import { loadingStore, showLoadingFallback } from '@/lib/loading-store'
import { useIsReducedMotion } from '@/lib/use-reduced-motion'
import { loadStoreFiles } from '@/store/store-files'
import { STORE_TUNING } from '@/store/store-tuning'
import { useDeepLink } from '@/visit/use-visit-data'
import { useWalkInput } from '@/visit/use-walk-input'
import { WalkCamera } from '@/visit/walk-camera'
import { walkController } from '@/visit/walk-controller'
import { DevPanel } from './dev/dev-panel'
import { BottomControls } from './ui/bottom-controls'
import { FindSheet } from './ui/find-sheet'
import { StoreFallback } from './ui/store-fallback'
import { StoreList } from './ui/store-list'
import { StoreLoader } from './ui/store-loader'

// The one page: the loader (in the HTML, so it paints first), the 3D store over the night
// background, the grain over it, the little left over it (D-068: the walk's controls, the hidden
// list, Find) and, in development, the dev panel. The canvas loads client-only (brief §7.1), and the store's
// files start loading alongside it. When the store can't run, a still and the ways on take its
// place (Part 4). The whole page is the walk's input surface.

const StoreCanvas = dynamic(
  () =>
    import('@/store/store-canvas').then((module) => {
      loadingStore.update({ isStoreCodeLoaded: true })
      return module.StoreCanvas
    }),
  { ssr: false },
)
const DevSceneHelpers = dynamic(
  () => import('./dev/dev-scene-helpers').then((module) => module.DevSceneHelpers),
  {
    ssr: false,
  },
)

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * The dev panel (frame rate, draw calls, tier) shows in development, and on any build with
 * `?stats` in the link, for measuring on a phone.
 */
function useIsDevPanelShown(): boolean {
  const [isShown, setIsShown] = useState(isDevelopment)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('stats')) setIsShown(true)
  }, [])
  return isShown
}

/**
 * `?still`: the lit store with no DOM layer and no arrival, for `bun run render-stills` (the
 * fallback's stills and the share card are rendered from the showroom itself).
 */
function useIsStillCapture(): boolean {
  const [isStillCapture, setIsStillCapture] = useState(false)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('still')) setIsStillCapture(true)
  }, [])
  return isStillCapture
}

/** three.js needs WebGL 2. Checked before its code is even downloaded. */
function readCanRunWebgl(): boolean {
  try {
    const context = document.createElement('canvas').getContext('webgl2')
    context?.getExtension('WEBGL_lose_context')?.loseContext()
    return context !== null
  } catch {
    return false
  }
}

/** Null until checked on the device; then the store loads, or the fallback shows. */
function useCanRunStore(): boolean | null {
  const [canRunStore, setCanRunStore] = useState<boolean | null>(null)
  useEffect(() => {
    loadingStore.update({ isPageCodeLoaded: true })
    const canRunWebgl = readCanRunWebgl()
    if (canRunWebgl) loadStoreFiles()
    else showLoadingFallback('noWebgl')
    setCanRunStore(canRunWebgl)
  }, [])
  return canRunStore
}

/** A canvas that can't start (WebGL refused at creation) shows the same fallback as no WebGL. */
class StoreCanvasBoundary extends Component<{ children: ReactNode }, { hasFailed: boolean }> {
  state = { hasFailed: false }

  static getDerivedStateFromError(): { hasFailed: boolean } {
    return { hasFailed: true }
  }

  componentDidCatch(error: unknown): void {
    console.error('The showroom could not start its 3D view', error)
    showLoadingFallback('noWebgl')
  }

  render(): ReactNode {
    return this.state.hasFailed ? null : this.props.children
  }
}

export function Showroom() {
  const surfaceRef = useRef<HTMLElement>(null)
  const veilRef = useRef<HTMLDivElement>(null)
  const isReducedMotion = useIsReducedMotion()
  const isStillCapture = useIsStillCapture()
  useEffect(
    () => walkController.setReducedMotion(isReducedMotion || isStillCapture),
    [isReducedMotion, isStillCapture],
  )
  useWalkInput(surfaceRef)
  useDeepLink()
  const isDevPanelShown = useIsDevPanelShown() && !isStillCapture
  const canRunStore = useCanRunStore()
  const loadingPhase = useSmallStore(loadingStore, (state) => state.phase)
  const isStoreShown = loadingPhase === 'loading' || loadingPhase === 'ready'
  const isWalkShown = isStoreShown && !isStillCapture

  return (
    <main
      ref={surfaceRef}
      data-loading-phase={loadingPhase}
      className="relative h-dvh w-full touch-none select-none overflow-hidden bg-night"
    >
      {canRunStore === true && isStoreShown ? (
        <StoreCanvasBoundary>
          <StoreCanvas
            renderInside={(lighting) => (
              <>
                <WalkCamera lighting={lighting} veilRef={veilRef} />
                {isDevPanelShown ? <DevSceneHelpers /> : null}
              </>
            )}
          />
        </StoreCanvasBoundary>
      ) : null}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="film-grain" style={{ opacity: STORE_TUNING.grain.opacity }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_50%,transparent_60%,rgba(0,0,0,0.22)_100%)]" />
        {/* Reduced motion's cut: a short fade to the night and back. */}
        <div ref={veilRef} className="absolute inset-0 bg-night opacity-0" />
      </div>
      <StoreFallback />
      {isWalkShown ? (
        <>
          <BottomControls />
          <StoreList />
          <FindSheet />
        </>
      ) : null}
      {isDevPanelShown ? <DevPanel /> : null}
      <StoreLoader />
    </main>
  )
}
