'use client'

import { useEffect, useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  type BufferGeometry,
  type Color,
  type MeshBasicMaterial,
  PlaneGeometry,
  type PointLight,
  type Sprite,
  type SpriteMaterial,
  type Texture,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Vector3Tuple } from '../camera-poses'
import { useStoreContext, useStoreLightingEffect } from '../store-context'
import type { StoreLightingLevels } from '../store-lighting'
import { useNotReflected } from './reflection-layer'
import { GLOW_RENDER_ORDER, SNEAKER_RENDER_ORDER } from './render-order'

// The store's building blocks, ported from the film's `ShowroomWorld.tsx`. Lit things are unlit
// materials at full colour, scaled by the store's light level; everything else is lit softly.

/** Which light level a thing follows: the room's, the signs' outside, or none (always on). */
export type LightingSource = 'store' | 'sign' | 'none'

export function readLightLevel(levels: StoreLightingLevels, source: LightingSource): number {
  if (source === 'store') return levels.storeBrightness
  if (source === 'sign') return levels.signBrightness
  return 1
}

/** With bloom on, the film's glow sprites turn down, so the two don't add up (brief §6.3). */
const GLOW_SHARE_WITH_BLOOM = 0.7

export function useGlowShare(): number {
  return useStoreContext().tierSettings.isBloomOn ? GLOW_SHARE_WITH_BLOOM : 1
}

type LitPanelProps = {
  texture: Texture
  position: Vector3Tuple
  width: number
  height: number
  rotationY?: number
  rotationX?: number
  brightness?: number
  lightingSource?: LightingSource
  isTransparent?: boolean
  /** A print with a Sneaker in it: never fogged, drawn over the glows (brief §5.2). */
  isPrint?: boolean
}

/** A picture that gives off its own light: a sign, a lightbox, a screen. */
export function LitPanel({
  texture,
  position,
  width,
  height,
  rotationY = 0,
  rotationX = 0,
  brightness = 1,
  lightingSource = 'store',
  isTransparent = false,
  isPrint = false,
}: LitPanelProps) {
  const materialRef = useRef<MeshBasicMaterial>(null)
  useStoreLightingEffect((levels) => {
    materialRef.current?.color.setScalar(brightness * readLightLevel(levels, lightingSource))
  })
  const isDrawnAfterGlows = isPrint || isTransparent
  return (
    <mesh
      position={position}
      rotation={[rotationX, rotationY, 0]}
      renderOrder={isPrint ? SNEAKER_RENDER_ORDER : 0}
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        toneMapped={false}
        fog={!isPrint}
        transparent={isDrawnAfterGlows}
        depthWrite={!isTransparent}
      />
    </mesh>
  )
}

type GlowProps = {
  texture: Texture
  position: Vector3Tuple
  size: readonly [number, number]
  color?: string
  opacity: number
  lightingSource?: LightingSource
}

/** A soft glow, always facing the camera, added on top of whatever is behind it. */
export function Glow({
  texture,
  position,
  size,
  color = '#FFFFFF',
  opacity,
  lightingSource = 'store',
}: GlowProps) {
  const materialRef = useRef<SpriteMaterial>(null)
  const spriteRef = useRef<Sprite>(null)
  useNotReflected(spriteRef)
  const glowShare = useGlowShare()
  useStoreLightingEffect((levels) => {
    if (materialRef.current === null) return
    materialRef.current.opacity = opacity * glowShare * readLightLevel(levels, lightingSource)
  })
  return (
    <sprite
      ref={spriteRef}
      position={position}
      scale={[size[0], size[1], 1]}
      renderOrder={GLOW_RENDER_ORDER}
    >
      <spriteMaterial
        ref={materialRef}
        map={texture}
        color={color}
        blending={AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
        transparent
      />
    </sprite>
  )
}

/** A point light whose intensity follows the store's light level. */
export function StorePointLight({
  position,
  color,
  intensity,
  distance,
  decay,
  lightingSource = 'store',
}: {
  position: Vector3Tuple
  color: string
  intensity: number
  distance: number
  decay: number
  lightingSource?: LightingSource
}) {
  const lightRef = useRef<PointLight>(null)
  useStoreLightingEffect((levels) => {
    if (lightRef.current !== null) {
      lightRef.current.intensity = intensity * readLightLevel(levels, lightingSource)
    }
  })
  return (
    <pointLight
      ref={lightRef}
      position={position}
      color={color}
      distance={distance}
      decay={decay}
    />
  )
}

/** Sets a basic material's colour to `baseColor` times the light level. */
export function scaleColor(
  target: Color,
  baseColor: readonly [number, number, number],
  level: number,
): void {
  target.setRGB(baseColor[0] * level, baseColor[1] * level, baseColor[2] * level)
}

export type LitQuad = { position: Vector3Tuple; width: number; height: number; rotationY?: number }

/** Several lit pictures with one texture and brightness, drawn as one mesh. */
export function LitQuads({
  texture,
  quads,
  brightness = 1,
  lightingSource = 'store',
  isTransparent = false,
}: {
  texture: Texture
  quads: readonly LitQuad[]
  brightness?: number
  lightingSource?: LightingSource
  isTransparent?: boolean
}) {
  const materialRef = useRef<MeshBasicMaterial>(null)
  const geometry = useMemo(() => mergeQuads(quads), [quads])
  useEffect(() => () => geometry.dispose(), [geometry])
  useStoreLightingEffect((levels) => {
    materialRef.current?.color.setScalar(brightness * readLightLevel(levels, lightingSource))
  })
  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        toneMapped={false}
        transparent={isTransparent}
        depthWrite={!isTransparent}
      />
    </mesh>
  )
}

function mergeQuads(quads: readonly LitQuad[]): BufferGeometry {
  const geometries = quads.map(({ position, width, height, rotationY = 0 }) =>
    new PlaneGeometry(width, height).rotateY(rotationY).translate(...position),
  )
  const merged = mergeGeometries(geometries)
  for (const geometry of geometries) geometry.dispose()
  if (merged === null) throw new Error("The lit pictures couldn't be merged")
  return merged
}
