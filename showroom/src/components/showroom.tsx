'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import { useIsReducedMotion } from '@/lib/use-reduced-motion'
import { STORE_TUNING } from '@/store/store-tuning'
import { useWalkInput } from '@/visit/use-walk-input'
import { WalkCamera } from '@/visit/walk-camera'
import { walkController } from '@/visit/walk-controller'
import { DevPanel } from './dev/dev-panel'
import { ShowroomHeader } from './ui/showroom-header'
import { StoreFailed, StoreLoading } from './ui/store-status'
import { WalkBar } from './ui/walk-bar'

// The one page: the 3D store over the night background, the grain over it, the walk's DOM layer
// (the header, and where you are with the hint) and, in development, the dev panel. The canvas loads
// client-only (brief §7.1). The whole page is the walk's input surface.

const StoreCanvas = dynamic(
  () => import('@/store/store-canvas').then((module) => module.StoreCanvas),
  {
    ssr: false,
    loading: () => <StoreLoading progress={0} />,
  },
)
const DevSceneHelpers = dynamic(
  () => import('./dev/dev-scene-helpers').then((module) => module.DevSceneHelpers),
  {
    ssr: false,
  },
)

const isDevelopment = process.env.NODE_ENV === 'development'

export function Showroom() {
  const surfaceRef = useRef<HTMLElement>(null)
  const veilRef = useRef<HTMLDivElement>(null)
  const isReducedMotion = useIsReducedMotion()
  useEffect(() => walkController.setReducedMotion(isReducedMotion), [isReducedMotion])
  useWalkInput(surfaceRef)

  return (
    <main
      ref={surfaceRef}
      className="relative h-dvh w-full touch-none select-none overflow-hidden bg-night"
    >
      <StoreCanvas
        renderLoading={(progress) => <StoreLoading progress={progress} />}
        renderFailed={() => <StoreFailed />}
        renderInside={(lighting) => (
          <>
            <WalkCamera lighting={lighting} veilRef={veilRef} />
            {isDevelopment ? <DevSceneHelpers /> : null}
          </>
        )}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="film-grain" style={{ opacity: STORE_TUNING.grain.opacity }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_50%,transparent_60%,rgba(0,0,0,0.22)_100%)]" />
        {/* Reduced motion's cut: a short fade to the night and back. */}
        <div ref={veilRef} className="absolute inset-0 bg-night opacity-0" />
      </div>
      <ShowroomHeader />
      <WalkBar />
      {isDevelopment ? <DevPanel /> : null}
    </main>
  )
}
