'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Texture } from 'three'
import { useSmallStore } from '@/lib/create-small-store'
import { visitStore } from '@/lib/visit-store'
import { loadSneakerImage } from '../load-sneaker-images'
import { createCounterScreenTexture } from '../print-textures'
import { HERO_DESIGN_NUMBER } from '../sneaker-placements'
import { printSpots } from '../sneaker-spots'
import { useStoreContext } from '../store-context'
import { useLookCloserPrint } from '../use-look-closer-print'
import { LitPanel } from './store-primitives'

// The upright screen on the Founding Pass counter (brief §10, #2): #0137, as the film, until the
// schedule reaches the waitlist window; then the newest mint, "Just minted" with its founder
// number. visitStore's `counterScreen` says which (use-counter-screen-design.ts).

type ScreenPicture = { image: HTMLImageElement; designNumber: number; founderNumber: number | null }

export function CounterScreen() {
  const { assets, tierSettings } = useStoreContext()
  const counterScreen = useSmallStore(visitStore, (state) => state.counterScreen)
  const picture = useScreenPicture(counterScreen.designNumber, counterScreen.founderNumber)
  const [drawnTexture, setDrawnTexture] = useState<Texture | null>(null)
  const isFilmScreen = picture === null

  const createAtScale = useCallback(
    (printScale: number) =>
      createCounterScreenTexture({
        fontFamilies: assets.fontFamilies,
        printScale,
        sneakerImages:
          picture === null
            ? assets.sneakerImages
            : new Map([[picture.designNumber, picture.image]]),
        designNumber: picture?.designNumber ?? HERO_DESIGN_NUMBER,
        founderNumber: picture?.founderNumber ?? null,
      }),
    [assets, picture],
  )

  useEffect(() => {
    if (isFilmScreen) return
    const texture = createAtScale(tierSettings.printScale)
    setDrawnTexture(texture)
    return () => {
      setDrawnTexture(null)
      texture.dispose()
    }
  }, [createAtScale, isFilmScreen, tierSettings.printScale])

  const texture = useLookCloserPrint(
    'counterScreen',
    isFilmScreen || drawnTexture === null ? assets.counterScreen : drawnTexture,
    createAtScale,
  )
  const { counterScreen: spot } = printSpots
  return (
    <LitPanel
      texture={texture}
      position={spot.position}
      width={spot.width}
      height={spot.height}
      isPrint
    />
  )
}

/** The newest mint's Sneaker, loaded if the store didn't load it; null for the film's #0137. */
function useScreenPicture(
  designNumber: number,
  founderNumber: number | null,
): ScreenPicture | null {
  const { assets } = useStoreContext()
  const [picture, setPicture] = useState<ScreenPicture | null>(null)
  const isFilmScreen = designNumber === HERO_DESIGN_NUMBER && founderNumber === null

  useEffect(() => {
    if (isFilmScreen) {
      setPicture(null)
      return
    }
    let isCancelled = false
    const loadedImage = assets.sneakerImages.get(designNumber)
    const imagePromise =
      loadedImage === undefined ? loadSneakerImage(designNumber) : Promise.resolve(loadedImage)
    imagePromise
      .then((image) => {
        if (!isCancelled) setPicture({ image, designNumber, founderNumber })
      })
      .catch((error: unknown) =>
        console.error(`The counter's screen couldn't load #${designNumber}`, error),
      )
    return () => {
      isCancelled = true
    }
  }, [assets, designNumber, founderNumber, isFilmScreen])

  return isFilmScreen ? null : picture
}
