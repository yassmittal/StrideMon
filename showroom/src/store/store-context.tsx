'use client'

import { createContext, type ReactNode, useContext, useEffect, useRef } from 'react'
import type { Texture } from 'three'
import type { RenderTierSettings } from '@/lib/render-tier'
import type { StoreLighting, StoreLightingLevels } from './store-lighting'
import type { StoreAssets } from './use-store-assets'

// What every part of the store reads: its pictures, its light levels, the tier and the
// environment map for the few shiny things.

export type StoreContextValue = {
  assets: StoreAssets
  lighting: StoreLighting
  tierSettings: RenderTierSettings
  /** Null until it's rendered on the first frame. */
  environmentMap: Texture | null
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreContextProvider({
  value,
  children,
}: {
  value: StoreContextValue
  children: ReactNode
}) {
  return <StoreContext value={value}>{children}</StoreContext>
}

export function useStoreContext(): StoreContextValue {
  const value = useContext(StoreContext)
  if (value === null) throw new Error('useStoreContext needs a StoreContextProvider')
  return value
}

/**
 * Runs `applyLevels` now and whenever the store's light levels change (the lights-on moment),
 * without re-rendering React. Keep `applyLevels` cheap: it can run every frame of a fade.
 */
export function useStoreLightingEffect(applyLevels: (levels: StoreLightingLevels) => void): void {
  const { lighting } = useStoreContext()
  const applyLevelsRef = useRef(applyLevels)
  applyLevelsRef.current = applyLevels
  useEffect(() => lighting.subscribe((levels) => applyLevelsRef.current(levels)), [lighting])
}
