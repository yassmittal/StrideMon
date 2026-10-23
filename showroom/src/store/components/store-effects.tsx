'use client'

import { Bloom, EffectComposer } from '@react-three/postprocessing'
import type { RenderTierSettings } from '@/lib/render-tier'
import { STORE_TUNING } from '../store-tuning'

// The composer: bloom above white, nothing else. No tone-mapping pass: the architecture tone-maps
// itself (brief §5.2), so the Sneakers keep their colours. No screen-space AO either: N8AO shaded
// the Sneakers too (up to 7/255 darker on Part 1's colour check), so it was dropped (brief §6.3).
// The Low tier has no composer at all.

export function StoreEffects({ tierSettings }: { tierSettings: RenderTierSettings }) {
  if (!tierSettings.isBloomOn) return null
  const { bloom } = STORE_TUNING
  return (
    <EffectComposer multisampling={tierSettings.multisampleCount}>
      <Bloom
        mipmapBlur
        luminanceThreshold={bloom.luminanceThreshold}
        luminanceSmoothing={bloom.luminanceSmoothing}
        intensity={bloom.intensity}
        radius={bloom.radius}
        resolutionScale={tierSettings.bloomResolutionScale}
        levels={tierSettings.bloomLevelCount}
      />
    </EffectComposer>
  )
}
