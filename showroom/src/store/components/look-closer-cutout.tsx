'use client'

import { useEffect, useRef, useState } from 'react'
import type { MeshBasicMaterial, Texture } from 'three'
import { useSmallStore } from '@/lib/create-small-store'
import { visitStore } from '@/lib/visit-store'
import { readLookCloserTarget, readNormal } from '@/visit/look-closer-targets'
import { createSneakerPictureTexture, SHARP_SNEAKER_PIXELS } from '../sneaker-pictures'
import { useStoreContext, useStoreLightingEffect } from '../store-context'
import { SNEAKER_ASPECT } from '../textures'
import { SNEAKER_RENDER_ORDER } from './render-order'

// Look closer at a shelf Sneaker (brief §5.3, D-066): its own sharp picture (1,024 px) laid exactly
// over its cell of the wall's atlas, a hair in front, and released when you leave. Unlit, never
// tone-mapped, fogged or tinted, like the atlas under it.

/** In front of the atlas, so it draws over its own cell (transparent things draw back to front). */
const IN_FRONT_METERS = 0.002
const DEGREES_TO_RADIANS = Math.PI / 180

export function LookCloserCutout() {
  const { assets } = useStoreContext()
  const targetId = useSmallStore(visitStore, (state) => state.lookCloserTargetId)
  const target = readLookCloserTarget(targetId)
  const shelfTarget = target?.kind === 'shelf' ? target : null
  const designNumber = typeof shelfTarget?.design === 'number' ? shelfTarget.design : null
  const [texture, setTexture] = useState<Texture | null>(null)
  const materialRef = useRef<MeshBasicMaterial>(null)
  useStoreLightingEffect(({ storeBrightness }) => {
    materialRef.current?.color.setScalar(storeBrightness)
  })

  useEffect(() => {
    if (designNumber === null) return
    const image = assets.sneakerImages.get(designNumber)
    if (image === undefined) return
    const sharpTexture = createSneakerPictureTexture(image, SHARP_SNEAKER_PIXELS)
    setTexture(sharpTexture)
    return () => {
      setTexture(null)
      sharpTexture.dispose()
    }
  }, [assets, designNumber])

  if (shelfTarget === null || texture === null) return null
  const normal = readNormal(shelfTarget.facingDegrees)
  const [centerX, centerY, centerZ] = shelfTarget.center
  return (
    <mesh
      position={[
        centerX + normal.x * IN_FRONT_METERS,
        centerY,
        centerZ + normal.z * IN_FRONT_METERS,
      ]}
      rotation={[0, shelfTarget.facingDegrees * DEGREES_TO_RADIANS, 0]}
      renderOrder={SNEAKER_RENDER_ORDER}
    >
      <planeGeometry args={[shelfTarget.frameWidth, shelfTarget.frameWidth * SNEAKER_ASPECT]} />
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        toneMapped={false}
        fog={false}
        alphaTest={0.02}
        transparent
      />
    </mesh>
  )
}
