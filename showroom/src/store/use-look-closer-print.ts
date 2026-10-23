'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Texture } from 'three'
import { useSmallStore } from '@/lib/create-small-store'
import { visitStore } from '@/lib/visit-store'
import { readLookCloserTarget } from '@/visit/look-closer-targets'
import {
  createFoundingPassLightboxTexture,
  createHeroLightboxTexture,
  createLegendaryPosterTexture,
  createWindowPosterTexture,
  type PrintOptions,
} from './print-textures'
import { type PrintId, printSpots } from './sneaker-spots'
import { useStoreContext } from './store-context'
import { useDisposeWhenReplaced } from './use-dispose-when-replaced'

// Look closer at a print (D-066): the print redraws itself with the Sneaker you're looking at at
// about 1,024 px (brief §5.3), and goes back to its tier's size when you leave. A redraw, not an
// overlay, because the Founding Pass lightbox's Sneakers overlap and keep their drawing order.

const SHARP_SNEAKER_PIXELS = 1024
const MAX_SHARP_PRINT_SIDE_PIXELS = 2048
/** Not worth a redraw for less than this much sharper. */
const MIN_SHARPER_SHARE = 1.2

const printCreators: Record<PrintId, (options: PrintOptions) => Texture> = {
  heroLightbox: createHeroLightboxTexture,
  legendaryPoster: createLegendaryPosterTexture,
  foundingPassLightbox: createFoundingPassLightboxTexture,
  windowPoster: createWindowPosterTexture,
}

/** The print's scale that draws one of its Sneakers at about 1,024 px, within the size cap. */
export function readSharpPrintScale(printId: PrintId, sneakerIndex: number): number {
  const spot = printSpots[printId]
  const sneakerWidthPixels = spot.sneakers[sneakerIndex]?.width ?? spot.canvasWidth
  return Math.min(
    SHARP_SNEAKER_PIXELS / sneakerWidthPixels,
    MAX_SHARP_PRINT_SIDE_PIXELS / Math.max(spot.canvasWidth, spot.canvasHeight),
  )
}

/** The texture a print shows: its own, or a sharper redraw while look closer is on it. */
export function useLookCloserPrint(printId: PrintId, baseTexture: Texture): Texture {
  const { assets, tierSettings } = useStoreContext()
  const targetId = useSmallStore(visitStore, (state) => state.lookCloserTargetId)
  const target = readLookCloserTarget(targetId)
  const sharpScale =
    target?.printId === printId ? readSharpPrintScale(printId, target.printSneakerIndex) : null
  const isWorthRedrawing =
    sharpScale !== null && sharpScale > tierSettings.printScale * MIN_SHARPER_SHARE
  const create = useMemo(() => {
    const createPrint = printCreators[printId]
    return (printScale: number) =>
      createPrint({
        fontFamilies: assets.fontFamilies,
        sneakerImages: assets.sneakerImages,
        printScale,
      })
  }, [assets, printId])
  const [sharpTexture, setSharpTexture] = useState<Texture | null>(null)

  useEffect(() => {
    setSharpTexture(!isWorthRedrawing || sharpScale === null ? null : create(sharpScale))
  }, [create, isWorthRedrawing, sharpScale])
  useDisposeWhenReplaced(sharpTexture)

  return sharpTexture ?? baseTexture
}
