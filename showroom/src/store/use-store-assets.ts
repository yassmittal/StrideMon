import { useEffect, useState } from 'react'
import type { Texture } from 'three'
import { type RenderTier, renderTierSettings } from '@/lib/render-tier'
import {
  createCounterPassTexture,
  createDoorDecalTexture,
  createFindPlateTexture,
  createWaitlistKioskTexture,
  createWindowDecalTexture,
} from './button-textures'
import type { SneakerImages } from './load-sneaker-images'
import {
  createFoundingPassLightboxTexture,
  createHeroLightboxTexture,
  createLegendaryPosterTexture,
  createWindowPosterTexture,
} from './print-textures'
import { createSneakerAtlas, type SneakerAtlas } from './sneaker-pictures'
import { RARE_WALL_DESIGN_NUMBERS, SNEAKER_WALL_DESIGN_NUMBERS } from './sneaker-placements'
import { loadStoreFiles, type StoreFiles } from './store-files'
import type { StoreFontFamilies } from './store-fonts'
import {
  createBladeSignTexture,
  createGlowTexture,
  createNeighbourSignTexture,
  createPavingTexture,
  createStoreSignTexture,
  createTaglinePanelTexture,
  createWallTitleTexture,
} from './textures'

// Waits for the store's Sneakers and fonts (store-files.ts, with real progress), then draws every
// texture at the tier's sizes. Ported from the film's `useShowroomAssets.ts`: Remotion's
// `staticFile`/`delayRender` became `fetch`, and the Sneakers are rasterised from their SVGs.

export type StoreAssets = {
  fontFamilies: StoreFontFamilies
  sneakerImages: SneakerImages
  storeSign: Texture
  bladeSign: Texture
  heroLightbox: Texture
  taglinePanel: Texture
  legendaryPoster: Texture
  foundingPassTitle: Texture
  foundingPassLightbox: Texture
  windowPoster: Texture
  /** The store's own buttons (D-068). */
  doorDecal: Texture
  windowDecal: Texture
  counterPass: Texture
  waitlistKiosk: Texture
  findPlate: Texture
  sneakersLabel: Texture
  rareLabel: Texture
  paving: Texture
  glow: Texture
  neighbourSigns: readonly Texture[]
  sneakerWall: SneakerAtlas
  rareWall: SneakerAtlas
}

export type StoreAssetsState =
  | { phase: 'loading' }
  | { phase: 'failed'; error: unknown }
  | { phase: 'ready'; assets: StoreAssets }

export function useStoreAssets(tier: RenderTier | null): StoreAssetsState {
  const [loadedFiles, setLoadedFiles] = useState<StoreFiles | null>(null)
  const [loadError, setLoadError] = useState<unknown>(null)
  const [assets, setAssets] = useState<StoreAssets | null>(null)

  useEffect(() => {
    let isCancelled = false
    // Already started by the page (store-files.ts), so this only waits for it.
    loadStoreFiles().then(
      (files) => {
        if (!isCancelled) setLoadedFiles(files)
      },
      (error: unknown) => {
        if (!isCancelled) setLoadError(error)
      },
    )
    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    if (loadedFiles === null || tier === null) return
    const builtAssets = buildStoreAssets(loadedFiles, tier)
    setAssets(builtAssets)
    return () => disposeStoreAssets(builtAssets)
  }, [loadedFiles, tier])

  if (loadError !== null) return { phase: 'failed', error: loadError }
  if (assets !== null) return { phase: 'ready', assets }
  return { phase: 'loading' }
}

function buildStoreAssets(
  { fontFamilies, sneakerImages }: StoreFiles,
  tier: RenderTier,
): StoreAssets {
  const { printScale, wallSneakerPixels } = renderTierSettings[tier]
  const printOptions = { fontFamilies, printScale, sneakerImages }
  return {
    fontFamilies,
    sneakerImages,
    storeSign: createStoreSignTexture(printOptions),
    bladeSign: createBladeSignTexture(printOptions),
    heroLightbox: createHeroLightboxTexture(printOptions),
    taglinePanel: createTaglinePanelTexture(printOptions),
    legendaryPoster: createLegendaryPosterTexture(printOptions),
    foundingPassTitle: createWallTitleTexture({ ...printOptions, text: 'Founding Pass' }),
    foundingPassLightbox: createFoundingPassLightboxTexture(printOptions),
    windowPoster: createWindowPosterTexture(printOptions),
    doorDecal: createDoorDecalTexture(printOptions),
    windowDecal: createWindowDecalTexture(printOptions),
    counterPass: createCounterPassTexture(printOptions),
    waitlistKiosk: createWaitlistKioskTexture(printOptions),
    findPlate: createFindPlateTexture(printOptions),
    sneakersLabel: createWallTitleTexture({ ...printOptions, text: 'Sneakers', color: '#141515' }),
    rareLabel: createWallTitleTexture({ ...printOptions, text: 'Rare', color: '#141515' }),
    paving: createPavingTexture(printScale),
    glow: createGlowTexture(),
    neighbourSigns: [
      createNeighbourSignTexture('#1D4FA8', '#F2F2F2'),
      createNeighbourSignTexture('#C23B2E', '#FFE8A3'),
      createNeighbourSignTexture('#E8E2CF', '#2A2A2A'),
      createNeighbourSignTexture('#1F7A4D', '#F2F2F2'),
    ],
    sneakerWall: createSneakerAtlas({
      sneakerImages,
      designNumbers: SNEAKER_WALL_DESIGN_NUMBERS,
      sneakerPixels: wallSneakerPixels,
    }),
    rareWall: createSneakerAtlas({
      sneakerImages,
      designNumbers: RARE_WALL_DESIGN_NUMBERS,
      sneakerPixels: wallSneakerPixels,
    }),
  }
}

function disposeStoreAssets(assets: StoreAssets): void {
  for (const value of Object.values(assets)) {
    if (isTexture(value)) value.dispose()
  }
  for (const texture of assets.neighbourSigns) texture.dispose()
  assets.sneakerWall.texture.dispose()
  assets.rareWall.texture.dispose()
}

function isTexture(value: unknown): value is Texture {
  return typeof value === 'object' && value !== null && 'isTexture' in value
}
