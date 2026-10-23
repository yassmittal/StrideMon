'use client'

import { useEffect, useRef } from 'react'
import type { MeshBasicMaterial, Texture } from 'three'
import { useSmallStore } from '@/lib/create-small-store'
import { visitStore } from '@/lib/visit-store'
import { type StoreButtonId, storeButtonSpots } from '../store-buttons'
import { useStoreContext, useStoreLightingEffect } from '../store-context'
import { SNEAKER_RENDER_ORDER } from './render-order'
import { type LightingSource, readLightLevel } from './store-primitives'

// The store's own buttons (D-068): flat, unlit pictures at a little under white, so the bloom never
// picks them up, a touch brighter under a laptop's pointer. Drawn over the glows, like the prints.
// While looking closer they step back (hidden, and taps pass them by), so the Sneaker and its tag
// have the screen. The blade sign is the shop front's own; a tap on it finds it all the same.

const DEGREES_TO_RADIANS = Math.PI / 180
/** Under the bloom's threshold (1): a button is lit, never glowing. */
const RESTING_BRIGHTNESS = 0.92
const HOVERED_BRIGHTNESS = 1

/** On the glass, facing the street: lit with the signs. */
export function StreetButtons() {
  const { assets } = useStoreContext()
  return (
    <group>
      <ButtonPanel id="doorDecal" texture={assets.doorDecal} lightingSource="sign" />
      <ButtonPanel id="windowDecal" texture={assets.windowDecal} lightingSource="sign" />
    </group>
  )
}

/** Inside: lit with the store. */
export function InsideButtons() {
  const { assets } = useStoreContext()
  return (
    <group>
      <ButtonPanel id="counterPass" texture={assets.counterPass} lightingSource="store" />
      <ButtonPanel id="waitlistKiosk" texture={assets.waitlistKiosk} lightingSource="store" />
      <ButtonPanel id="findPlate" texture={assets.findPlate} lightingSource="store" />
    </group>
  )
}

function ButtonPanel({
  id,
  texture,
  lightingSource,
}: {
  id: StoreButtonId
  texture: Texture
  lightingSource: LightingSource
}) {
  const spot = storeButtonSpots[id]
  const isHovered = useSmallStore(visitStore, (state) => state.hoveredHitId === id)
  const isLookingCloser = useSmallStore(visitStore, (state) => state.lookCloserTargetId !== null)
  const materialRef = useRef<MeshBasicMaterial>(null)
  const lightLevelRef = useRef(1)
  const isHoveredRef = useRef(isHovered)
  isHoveredRef.current = isHovered

  const applyBrightness = () => {
    const brightness = isHoveredRef.current ? HOVERED_BRIGHTNESS : RESTING_BRIGHTNESS
    materialRef.current?.color.setScalar(brightness * lightLevelRef.current)
  }
  useStoreLightingEffect((levels) => {
    lightLevelRef.current = readLightLevel(levels, lightingSource)
    applyBrightness()
  })
  // biome-ignore lint/correctness/useExhaustiveDependencies: it reads the hover through its ref.
  useEffect(applyBrightness, [isHovered])

  return (
    <mesh
      visible={!isLookingCloser}
      position={spot.center}
      rotation={[0, spot.facingDegrees * DEGREES_TO_RADIANS, 0]}
      renderOrder={SNEAKER_RENDER_ORDER}
    >
      <planeGeometry args={[spot.width, spot.height]} />
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        toneMapped={false}
        fog={false}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}
