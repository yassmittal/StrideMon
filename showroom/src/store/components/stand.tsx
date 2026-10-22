'use client'

import { useEffect, useRef, useState } from 'react'
import type { MeshBasicMaterial, Texture } from 'three'
import { readPassDesign } from '@/lib/sneaker-design'
import { loadSneakerImage } from '../load-sneaker-images'
import { createSneakerPictureTexture, SHARP_SNEAKER_PIXELS } from '../sneaker-pictures'
import { useStoreContext, useStoreLightingEffect } from '../store-context'
import { createStandCardTexture, SNEAKER_ASPECT } from '../textures'
import type { BlockSpec } from './merged-blocks'
import { SNEAKER_RENDER_ORDER } from './render-order'
import { StorePointLight } from './store-primitives'

// The white counter under the Sneakers niche and the stand on it: one Sneaker, sharp (1,024 px),
// with its little printed card. Any of the 1,000 can stand here (Find and deep links, Part 3).
// Ported from the film's `SneakerWall`.

const STAND_SNEAKER = {
  position: [3.8, 1.13, -4.55],
  width: 0.44,
  rotationY: -1.05,
  rotationX: -0.08,
} as const
/** The card prints a little dimmer than white, as the film's. */
const STAND_CARD_BRIGHTNESS = 0.9

export const standBlocks: readonly BlockSpec[] = [
  { position: [3.9, 0.48, -5.4], size: [0.9, 0.96, 3.0], color: '#ECECEF', roughness: 0.45 },
  { position: [3.82, 0.97, -4.55], size: [0.2, 0.03, 0.16], color: '#F7F7F9', roughness: 0.3 },
]

type StandPictures = { sneaker: Texture; card: Texture }

export function Stand({ designNumber }: { designNumber: number }) {
  const pictures = useStandPictures(designNumber)
  const sneakerMaterialRef = useRef<MeshBasicMaterial>(null)
  const cardMaterialRef = useRef<MeshBasicMaterial>(null)
  useStoreLightingEffect(({ storeBrightness }) => {
    sneakerMaterialRef.current?.color.setScalar(storeBrightness)
    cardMaterialRef.current?.color.setScalar(STAND_CARD_BRIGHTNESS * storeBrightness)
  })
  return (
    <group>
      {pictures === null ? null : (
        <>
          <mesh
            position={STAND_SNEAKER.position}
            rotation={[STAND_SNEAKER.rotationX, STAND_SNEAKER.rotationY, 0]}
            renderOrder={SNEAKER_RENDER_ORDER}
          >
            <planeGeometry args={[STAND_SNEAKER.width, STAND_SNEAKER.width * SNEAKER_ASPECT]} />
            <meshBasicMaterial
              ref={sneakerMaterialRef}
              map={pictures.sneaker}
              toneMapped={false}
              fog={false}
              alphaTest={0.02}
              transparent
            />
          </mesh>
          {/* Its card stands beside it, facing the same way, leaning back a little. */}
          <group position={[3.9, 1.018, -4.27]} rotation={[0, STAND_SNEAKER.rotationY, 0]}>
            <mesh rotation={[-0.3, 0, 0]}>
              <planeGeometry args={[0.2, 0.12]} />
              <meshBasicMaterial ref={cardMaterialRef} map={pictures.card} toneMapped={false} />
            </mesh>
          </group>
        </>
      )}
      <StorePointLight
        position={[3.2, 2.6, -5.4]}
        color="#F2F2FF"
        intensity={4}
        distance={4}
        decay={1.4}
      />
    </group>
  )
}

/** The stand's sharp Sneaker and its card, drawn for whichever design stands there. */
function useStandPictures(designNumber: number): StandPictures | null {
  const { assets } = useStoreContext()
  const [pictures, setPictures] = useState<StandPictures | null>(null)
  useEffect(() => {
    const design = readPassDesign(designNumber)
    if (design === undefined) throw new Error(`There's no design #${designNumber}`)
    let isCancelled = false
    let drawnPictures: StandPictures | null = null
    const loadedImage = assets.sneakerImages.get(designNumber)
    const imagePromise =
      loadedImage === undefined ? loadSneakerImage(designNumber) : Promise.resolve(loadedImage)
    imagePromise
      .then((image) => {
        if (isCancelled) return
        drawnPictures = {
          sneaker: createSneakerPictureTexture(image, SHARP_SNEAKER_PIXELS),
          card: createStandCardTexture({
            fontFamilies: assets.fontFamilies,
            printScale: 1,
            designNumber,
            name: design.name,
          }),
        }
        setPictures(drawnPictures)
      })
      .catch((error: unknown) => console.error(`The stand couldn't load #${designNumber}`, error))
    return () => {
      isCancelled = true
      drawnPictures?.sneaker.dispose()
      drawnPictures?.card.dispose()
    }
  }, [assets, designNumber])
  return pictures
}
