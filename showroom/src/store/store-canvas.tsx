'use client'

import { PerformanceMonitor } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { type ReactNode, useEffect, useState } from 'react'
import { useSmallStore } from '@/lib/create-small-store'
import {
  chooseStartingRenderTier,
  type RenderTier,
  renderTierSettings,
  toLowerRenderTier,
} from '@/lib/render-tier'
import { visitStore } from '@/lib/visit-store'
import { StoreEffects } from './components/store-effects'
import { StoreWorld } from './components/store-world'
import { StoreContextProvider } from './store-context'
import { StoreLighting, storeLightingPresets } from './store-lighting'
import { patchArchitectureToneMapping } from './tone-mapping'
import { type StoreAssets, useStoreAssets } from './use-store-assets'
import { useStoreEnvironmentMap } from './use-store-environment-map'

// The 3D store, client-only (loaded with `next/dynamic`, `ssr: false`). It picks the device's
// starting tier, loads the Sneakers, then renders the world, its effects and whatever the visit
// adds inside the canvas (`children`, which get the store's light levels).

patchArchitectureToneMapping()

export type StoreCanvasProps = {
  /** Rendered inside the canvas, given the store's light levels. */
  renderInside?: (lighting: StoreLighting) => ReactNode
  /** Rendered over the canvas while the Sneakers load (Part 4 makes the real loader). */
  renderLoading: (progress: number) => ReactNode
  renderFailed: () => ReactNode
}

export function StoreCanvas({ renderInside, renderLoading, renderFailed }: StoreCanvasProps) {
  const tier = useSmallStore(visitStore, (state) => state.tier)
  useEffect(() => {
    if (visitStore.read().tier === null) visitStore.update({ tier: chooseStartingRenderTier() })
  }, [])
  const assetsState = useStoreAssets(tier)
  const [lighting] = useState(() => new StoreLighting(storeLightingPresets.lit))

  if (assetsState.phase === 'failed') return renderFailed()
  if (assetsState.phase === 'loading' || tier === null) {
    return renderLoading(assetsState.phase === 'loading' ? assetsState.progress : 0)
  }
  const tierSettings = renderTierSettings[tier]
  return (
    <Canvas
      flat
      dpr={[1, tierSettings.maxPixelRatio]}
      camera={{ near: 0.05, far: 120, fov: 60, position: [0.6, 1.5, 7.6] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <StoreScene assets={assetsState.assets} tier={tier} lighting={lighting} />
      {renderInside?.(lighting)}
    </Canvas>
  )
}

function StoreScene({
  assets,
  tier,
  lighting,
}: {
  assets: StoreAssets
  tier: RenderTier
  lighting: StoreLighting
}) {
  const environmentMap = useStoreEnvironmentMap()
  const tierSettings = renderTierSettings[tier]
  return (
    <StoreContextProvider value={{ assets, lighting, tierSettings, environmentMap }}>
      <StoreWorld />
      <StoreEffects tierSettings={tierSettings} />
      <PerformanceMonitor onDecline={stepDownTierUnlessChosenByHand} />
    </StoreContextProvider>
  )
}

/** Wired, not tuned: Part 4 sets when a device steps down (brief §7.6). */
function stepDownTierUnlessChosenByHand(): void {
  const { tier, isTierChosenByHand } = visitStore.read()
  if (tier === null || isTierChosenByHand) return
  visitStore.update({ tier: toLowerRenderTier(tier) })
}
