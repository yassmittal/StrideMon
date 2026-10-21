import { useEffect, useState } from 'react'
import { cancelRender, continueRender, delayRender, staticFile } from 'remotion'
import type { Texture } from 'three'
import { fontFamilies } from '../../theme'
import {
  RARE_WALL_DESIGN_NUMBERS,
  SHOWROOM_DESIGN_NUMBERS,
  SNEAKER_WALL_DESIGN_NUMBERS,
  STAND_DESIGN_NUMBER,
} from '../sneakers'
import {
  createBladeSignTexture,
  createCounterScreenTexture,
  createFoundingPassLightboxTexture,
  createGlowTexture,
  createHeroLightboxTexture,
  createLegendaryPosterTexture,
  createNeighbourSignTexture,
  createPavingTexture,
  createSneakerTexture,
  createStandCardTexture,
  createStoreSignTexture,
  createTaglinePanelTexture,
  createWallTitleTexture,
  createWindowPosterTexture,
  type SneakerImages,
} from '../textures'

export type ShowroomAssets = {
  storeSign: Texture
  bladeSign: Texture
  heroLightbox: Texture
  taglinePanel: Texture
  legendaryPoster: Texture
  foundingPassTitle: Texture
  foundingPassLightbox: Texture
  counterScreen: Texture
  windowPoster: Texture
  sneakersLabel: Texture
  rareLabel: Texture
  standCard: Texture
  paving: Texture
  glow: Texture
  neighbourSigns: readonly Texture[]
  sneakerWall: readonly Texture[]
  rareWall: readonly Texture[]
  standSneaker: Texture
}

const STAND_DESIGN_NAME = 'Ember Court Night'
const WINDOW_POSTER_DESIGN_NUMBER = 542

function toSneakerPath(designNumber: number): string {
  return staticFile(`showroom/sneakers/${String(designNumber).padStart(4, '0')}.png`)
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Couldn't load ${source}`))
    image.src = source
  })
}

function buildAssets(sneakerImages: SneakerImages): ShowroomAssets {
  const toSneaker = (designNumber: number) => {
    const image = sneakerImages.get(designNumber)
    if (image === undefined) throw new Error(`Sneaker #${designNumber} isn't loaded`)
    return createSneakerTexture(image)
  }
  return {
    storeSign: createStoreSignTexture(),
    bladeSign: createBladeSignTexture(),
    heroLightbox: createHeroLightboxTexture(sneakerImages),
    taglinePanel: createTaglinePanelTexture(),
    legendaryPoster: createLegendaryPosterTexture(sneakerImages),
    foundingPassTitle: createWallTitleTexture('Founding Pass'),
    foundingPassLightbox: createFoundingPassLightboxTexture(sneakerImages),
    counterScreen: createCounterScreenTexture(sneakerImages),
    windowPoster: createWindowPosterTexture(sneakerImages, WINDOW_POSTER_DESIGN_NUMBER),
    sneakersLabel: createWallTitleTexture('Sneakers', '#141515'),
    rareLabel: createWallTitleTexture('Rare', '#141515'),
    standCard: createStandCardTexture(STAND_DESIGN_NUMBER, STAND_DESIGN_NAME),
    paving: createPavingTexture(),
    glow: createGlowTexture(),
    neighbourSigns: [
      createNeighbourSignTexture('#1D4FA8', '#F2F2F2'),
      createNeighbourSignTexture('#C23B2E', '#FFE8A3'),
      createNeighbourSignTexture('#E8E2CF', '#2A2A2A'),
      createNeighbourSignTexture('#1F7A4D', '#F2F2F2'),
    ],
    sneakerWall: SNEAKER_WALL_DESIGN_NUMBERS.map(toSneaker),
    rareWall: RARE_WALL_DESIGN_NUMBERS.map(toSneaker),
    standSneaker: toSneaker(STAND_DESIGN_NUMBER),
  }
}

/**
 * Loads the film's Sneakers and fonts, then draws every texture once. Holds the render until it's
 * done, so no frame is drawn without its art.
 */
export function useShowroomAssets(): ShowroomAssets | null {
  const [assets, setAssets] = useState<ShowroomAssets | null>(null)
  const [handle] = useState(() => delayRender('Loading the showroom’s Sneakers and fonts'))

  useEffect(() => {
    let isCancelled = false
    Promise.all([
      Promise.all(
        SHOWROOM_DESIGN_NUMBERS.map(
          async (designNumber) => [designNumber, await loadImage(toSneakerPath(designNumber))] as const,
        ),
      ),
      document.fonts.load(`700 100px ${fontFamilies.satoshi}`),
      document.fonts.load(`500 100px "${fontFamilies.mono}"`),
    ])
      .then(([loadedSneakers]) => {
        if (isCancelled) return
        setAssets(buildAssets(new Map(loadedSneakers)))
        continueRender(handle)
      })
      .catch((error: unknown) => cancelRender(error))
    return () => {
      isCancelled = true
    }
  }, [handle])

  return assets
}
