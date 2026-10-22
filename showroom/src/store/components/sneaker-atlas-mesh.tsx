'use client'

import { useEffect, useRef } from 'react'
import type { BufferGeometry, MeshBasicMaterial, Texture } from 'three'
import { useStoreLightingEffect } from '../store-context'
import { SNEAKER_RENDER_ORDER } from './render-order'

// Sneakers as cut-outs (brief §5.2): the laced art's transparent picture, unlit, never tone-mapped,
// fogged or tinted, at a brightness of 1 when the store is lit. Drawn after the glows, over them.

/** Under this alpha a pixel is empty, as the film's cut-outs. */
const CUTOUT_ALPHA_TEST = 0.02

export function SneakerAtlasMesh({
  geometry,
  texture,
  renderOrder = SNEAKER_RENDER_ORDER,
}: {
  geometry: BufferGeometry
  texture: Texture
  renderOrder?: number
}) {
  const materialRef = useRef<MeshBasicMaterial>(null)
  useStoreLightingEffect(({ storeBrightness }) => {
    materialRef.current?.color.setScalar(storeBrightness)
  })
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <mesh geometry={geometry} renderOrder={renderOrder}>
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        toneMapped={false}
        fog={false}
        alphaTest={CUTOUT_ALPHA_TEST}
        transparent
      />
    </mesh>
  )
}
