'use client'

import { PerformanceMonitor } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { type ReactNode, useEffect, useState } from 'react'
import { useSmallStore } from '@/lib/create-small-store'
import { loadingStore, showLoadingFallback } from '@/lib/loading-store'
import {
  chooseStartingRenderTier,
  type RenderTier,
  readTierStepDownBounds,
  renderTierSettings,
  TIER_STEP_DOWN,
  toLowerRenderTier,
} from '@/lib/render-tier'
import { visitStore } from '@/lib/visit-store'
import { StoreEffects } from './components/store-effects'
import { StoreWarmUp } from './components/store-warm-up'
import { StoreWorld } from './components/store-world'
import { StoreContextProvider } from './store-context'
import { StoreLighting, storeLightingPresets } from './store-lighting'
import { patchArchitectureToneMapping } from './tone-mapping'
import { type StoreAssets, useStoreAssets } from './use-store-assets'
import { useStoreEnvironmentMap } from './use-store-environment-map'

// The 3D store, client-only (loaded with `next/dynamic`, `ssr: false`). It picks the device's
// starting tier, waits for the Sneakers, then renders the world, its effects and whatever the visit
// adds inside the canvas (`renderInside`, given the store's light levels). The loader and the
// fallbacks are the page's (loading-store.ts): this reports a lost context or failed files to them.

patchArchitectureToneMapping()

export type StoreCanvasProps = {
  /** Rendered inside the canvas, given the store's light levels. */
  renderInside?: (lighting: StoreLighting) => ReactNode
}

export function StoreCanvas({ renderInside }: StoreCanvasProps) {
  const tier = useSmallStore(visitStore, (state) => state.tier)
  useEffect(() => {
    if (visitStore.read().tier !== null) return
    const { tier: startingTier, isChosenByHand } = chooseStartingRenderTier()
    visitStore.update({ tier: startingTier, isTierChosenByHand: isChosenByHand })
  }, [])
  const assetsState = useStoreAssets(tier)
  const [lighting] = useState(() => new StoreLighting(storeLightingPresets.lit))

  if (assetsState.phase !== 'ready' || tier === null) return null
  const tierSettings = renderTierSettings[tier]
  return (
    <Canvas
      flat
      dpr={[1, tierSettings.maxPixelRatio]}
      camera={{ near: 0.05, far: 120, fov: 60, position: [0.6, 1.5, 7.6] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        // three keeps the page alive; the visitor gets the fallback and "Try again".
        gl.domElement.addEventListener('webglcontextlost', () => showLoadingFallback('contextLost'))
      }}
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
  const isSceneWarm = useSmallStore(loadingStore, (state) => state.isSceneWarm)
  return (
    <StoreContextProvider value={{ assets, lighting, tierSettings, environmentMap }}>
      <StoreWorld />
      <StoreEffects tierSettings={tierSettings} />
      <StoreWarmUp />
      {/*
        Measures only once the loader is gone, and starts again after each step down (the key),
        so the rebuild's own hitch never counts. It only ever steps down, so it can't flicker.
      */}
      {isSceneWarm ? (
        <PerformanceMonitor
          key={tier}
          ms={TIER_STEP_DOWN.sampleMilliseconds}
          iterations={TIER_STEP_DOWN.sampleCount}
          threshold={TIER_STEP_DOWN.slowShare}
          bounds={readTierStepDownBounds}
          onDecline={stepDownTierUnlessChosenByHand}
        />
      ) : null}
    </StoreContextProvider>
  )
}

/** One tier down when the frame rate stays low (brief §7.6), unless a tier was held by hand. */
function stepDownTierUnlessChosenByHand(): void {
  const { tier, isTierChosenByHand } = visitStore.read()
  if (tier === null || isTierChosenByHand) return
  visitStore.update({ tier: toLowerRenderTier(tier) })
}
