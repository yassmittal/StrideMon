'use client'

import dynamic from 'next/dynamic'
import { STORE_TUNING } from '@/store/store-tuning'
import { DevPanel } from './dev/dev-panel'
import { StoreFailed, StoreLoading } from './ui/store-status'

// The one page: the 3D store over the night background, the grain over it, and (in development)
// the dev panel. The canvas loads client-only (brief §7.1).

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
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-night">
      <StoreCanvas
        renderLoading={(progress) => <StoreLoading progress={progress} />}
        renderFailed={() => <StoreFailed />}
        renderInside={(lighting) =>
          isDevelopment ? <DevSceneHelpers lighting={lighting} /> : null
        }
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="film-grain" style={{ opacity: STORE_TUNING.grain.opacity }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_50%,transparent_60%,rgba(0,0,0,0.22)_100%)]" />
      </div>
      {isDevelopment ? <DevPanel /> : null}
    </main>
  )
}
