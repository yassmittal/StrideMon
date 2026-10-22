'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import type { MeshBasicMaterial, Texture } from 'three'
import { readPassDesign } from '@/lib/sneaker-design'
import { useIsReducedMotion } from '@/lib/use-reduced-motion'
import { LOOK_CLOSER } from '@/visit/walk-plan'
import { loadSneakerImage } from '../load-sneaker-images'
import { createSneakerPictureTexture, SHARP_SNEAKER_PIXELS } from '../sneaker-pictures'
import { STAND_SPOT } from '../sneaker-spots'
import { useStoreContext, useStoreLightingEffect } from '../store-context'
import { createStandCardTexture, SNEAKER_ASPECT } from '../textures'
import type { BlockSpec } from './merged-blocks'
import { SNEAKER_RENDER_ORDER } from './render-order'
import { StorePointLight } from './store-primitives'

// The white counter under the Sneakers niche and the stand on it: one Sneaker, sharp (1,024 px),
// with its little printed card. Any of the 1,000 can stand here (Find and the deep link, Part 3).
// Ported from the film's `SneakerWall`.

const STAND_SNEAKER = {
  position: STAND_SPOT.position,
  width: STAND_SPOT.width,
  rotationY: STAND_SPOT.rotationYRadians,
  rotationX: STAND_SPOT.rotationXRadians,
} as const
/** The card prints a little dimmer than white, as the film's. */
const STAND_CARD_BRIGHTNESS = 0.9

export const standBlocks: readonly BlockSpec[] = [
  { position: [3.9, 0.48, -5.4], size: [0.9, 0.96, 3.0], color: '#ECECEF', roughness: 0.45 },
  { position: [3.82, 0.97, -4.55], size: [0.2, 0.03, 0.16], color: '#F7F7F9', roughness: 0.3 },
]

type StandPictures = { layerId: number; sneaker: Texture; card: Texture }

let nextLayerId = 0

/**
 * The stand's Sneaker and its card. When Find or the deep link puts another design there, the new
 * one fades in over the old as it fades out (brief §6.3, a little life); under reduced motion it
 * simply changes.
 */
export function Stand({ designNumber }: { designNumber: number }) {
  const pictures = useStandPictures(designNumber)
  const [layers, setLayers] = useState<readonly StandPictures[]>([])
  const fadeStartedAt = useRef<number | null>(null)
  const layerGroupsRef = useRef(new Map<number, MeshBasicMaterial[]>())
  const storeBrightnessRef = useRef(1)
  const isReducedMotion = useIsReducedMotion()

  useEffect(() => {
    if (pictures === null) return
    setLayers((current) => {
      const previous = current.at(-1)
      if (previous === undefined || isReducedMotion) return [pictures]
      return [previous, pictures]
    })
    fadeStartedAt.current = null
  }, [isReducedMotion, pictures])

  const applyOpacities = (share: number) => {
    layers.forEach((layer, index) => {
      const isNewest = index === layers.length - 1
      const opacity = layers.length === 1 ? 1 : isNewest ? share : 1 - share
      for (const material of layerGroupsRef.current.get(layer.layerId) ?? []) {
        material.opacity = opacity
      }
    })
  }

  useStoreLightingEffect(({ storeBrightness }) => {
    storeBrightnessRef.current = storeBrightness
    for (const [sneakerMaterial, cardMaterial] of layerGroupsRef.current.values()) {
      sneakerMaterial?.color.setScalar(storeBrightness)
      cardMaterial?.color.setScalar(STAND_CARD_BRIGHTNESS * storeBrightness)
    }
  })

  useFrame((state) => {
    if (layers.length < 2) return
    const time = state.clock.elapsedTime
    if (fadeStartedAt.current === null) fadeStartedAt.current = time
    const share = Math.min((time - fadeStartedAt.current) / LOOK_CLOSER.standFadeSeconds, 1)
    applyOpacities(share)
    if (share >= 1) setLayers((current) => current.slice(-1))
  })

  return (
    <group>
      {layers.map((layer, index) => (
        <StandLayer
          key={layer.layerId}
          pictures={layer}
          isFadingIn={layers.length > 1 && index === layers.length - 1}
          storeBrightnessRef={storeBrightnessRef}
          onMaterials={(materials) => {
            if (materials === null) layerGroupsRef.current.delete(layer.layerId)
            else layerGroupsRef.current.set(layer.layerId, materials)
          }}
        />
      ))}
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

function StandLayer({
  pictures,
  isFadingIn,
  storeBrightnessRef,
  onMaterials,
}: {
  pictures: StandPictures
  isFadingIn: boolean
  storeBrightnessRef: { readonly current: number }
  onMaterials: (materials: MeshBasicMaterial[] | null) => void
}) {
  const sneakerMaterialRef = useRef<MeshBasicMaterial>(null)
  const cardMaterialRef = useRef<MeshBasicMaterial>(null)
  const onMaterialsRef = useRef(onMaterials)
  onMaterialsRef.current = onMaterials
  useEffect(() => {
    const sneakerMaterial = sneakerMaterialRef.current
    const cardMaterial = cardMaterialRef.current
    if (sneakerMaterial === null || cardMaterial === null) return
    // The brightness only seeds a new layer; the lighting effect keeps it after.
    sneakerMaterial.color.setScalar(storeBrightnessRef.current)
    cardMaterial.color.setScalar(STAND_CARD_BRIGHTNESS * storeBrightnessRef.current)
    onMaterialsRef.current([sneakerMaterial, cardMaterial])
    return () => {
      onMaterialsRef.current(null)
      // A layer owns its pictures: they go when it fades out.
      pictures.sneaker.dispose()
      pictures.card.dispose()
    }
  }, [pictures, storeBrightnessRef])
  const initialOpacity = isFadingIn ? 0 : 1
  return (
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
          opacity={initialOpacity}
          transparent
        />
      </mesh>
      {/* Its card stands beside it, facing the same way, leaning back a little. */}
      <group position={[3.9, 1.018, -4.27]} rotation={[0, STAND_SNEAKER.rotationY, 0]}>
        <mesh rotation={[-0.3, 0, 0]} renderOrder={SNEAKER_RENDER_ORDER}>
          <planeGeometry args={[0.2, 0.12]} />
          <meshBasicMaterial
            ref={cardMaterialRef}
            map={pictures.card}
            toneMapped={false}
            opacity={initialOpacity}
            transparent
          />
        </mesh>
      </group>
    </>
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
    const loadedImage = assets.sneakerImages.get(designNumber)
    const imagePromise =
      loadedImage === undefined ? loadSneakerImage(designNumber) : Promise.resolve(loadedImage)
    imagePromise
      .then((image) => {
        if (isCancelled) return
        // The layer that shows them disposes them (StandLayer).
        setPictures({
          layerId: nextLayerId++,
          sneaker: createSneakerPictureTexture(image, SHARP_SNEAKER_PIXELS),
          card: createStandCardTexture({
            fontFamilies: assets.fontFamilies,
            printScale: 1,
            designNumber,
            name: design.name,
          }),
        })
      })
      .catch((error: unknown) => console.error(`The stand couldn't load #${designNumber}`, error))
    return () => {
      isCancelled = true
    }
  }, [assets, designNumber])
  return pictures
}
