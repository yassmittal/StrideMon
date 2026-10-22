'use client'

import { useMemo } from 'react'
import { RepeatWrapping } from 'three'
import { useStoreContext } from '../store-context'
import { architectureToneMappingDefines } from '../tone-mapping'
import type { LightStripSpec } from './light-strips'
import type { BlockSpec } from './merged-blocks'
import { GLASS_RENDER_ORDER } from './render-order'
import { Glow, LitPanel, type LitQuad, LitQuads, StorePointLight } from './store-primitives'

// The night street and the shop front, ported from the film's `ShowroomWorld.tsx` (`Street`,
// `Neighbours`, `ShopFront`). The neighbours' signs are plain coloured blocks: no words, no brands.

const QUARTER_TURN = Math.PI / 2

const NEIGHBOUR_FRONTS = [
  { centerX: -9, width: 7 },
  { centerX: -16.5, width: 7.6 },
  { centerX: -24, width: 7 },
  { centerX: 9, width: 7 },
  { centerX: 16.5, width: 7.6 },
] as const

const NEIGHBOUR_WINDOWS: readonly LitQuad[] = NEIGHBOUR_FRONTS.map(({ centerX, width }) => ({
  position: [centerX, 1.4, 0.02],
  width: width * 0.7,
  height: 2.2,
}))

/** The blade sign's two lit faces, one each side. */
const BLADE_SIGN_FACES: readonly LitQuad[] = [
  { position: [-0.08, 0, 0], width: 1.4, height: 0.7, rotationY: -QUARTER_TURN },
  { position: [0.08, 0, 0], width: 1.4, height: 0.7, rotationY: QUARTER_TURN },
]

const MULLION_XS = [-5, -2.5, 0, 2.5, 5] as const

export const streetBlocks: readonly BlockSpec[] = [
  // The kerb, and the street lamp's post.
  { position: [0, -0.06, 4.55], size: [64, 0.16, 0.2], color: '#6A6A6C' },
  {
    position: [-7, 2.6, 4.3],
    size: [0.12, 5.2, 0.12],
    color: '#2B2C2F',
    metalness: 0.4,
    environmentShare: 0.6,
  },
  // The neighbours: a dim front, a dark sign band and a pier each.
  ...NEIGHBOUR_FRONTS.flatMap(({ centerX, width }): BlockSpec[] => [
    { position: [centerX, 2.15, -0.15], size: [width, 4.3, 0.3], color: '#232427' },
    { position: [centerX, 3.5, 0.2], size: [width - 0.4, 0.9, 0.3], color: '#111214' },
    { position: [centerX + width / 2, 2.15, 0.1], size: [0.5, 4.3, 0.5], color: '#3A3B3F' },
  ]),
  // The fascia, black, and the glass's frame.
  { position: [0, 3.68, 0.17], size: [10.6, 1.25, 0.34], color: '#0A0A0B', roughness: 0.4 },
  ...MULLION_XS.map(
    (mullionX): BlockSpec => ({
      position: [mullionX, 1.53, 0.04],
      size: [0.09, 3.06, 0.09],
      color: '#1B1C1F',
    }),
  ),
  { position: [0, 0.06, 0.06], size: [10, 0.12, 0.14], color: '#1B1C1F' },
  // The blade sign's box.
  { position: [5.55, 3.0, 0.75], size: [0.14, 0.74, 1.44], color: '#0B0C10' },
]

export const streetLightStrips: readonly LightStripSpec[] = [
  { position: [-7, 5.2, 4.0], size: [0.5, 0.08, 0.3], color: '#FFC07A', intensity: 2 },
]

export function Street() {
  const { assets } = useStoreContext()
  const paving = useMemo(() => {
    const repeatedPaving = assets.paving.clone()
    repeatedPaving.wrapS = RepeatWrapping
    repeatedPaving.wrapT = RepeatWrapping
    repeatedPaving.repeat.set(16, 1.2)
    repeatedPaving.needsUpdate = true
    return repeatedPaving
  }, [assets.paving])
  return (
    <group>
      {/* The pavement, 4.5 m deep, and the road beyond the kerb. */}
      <mesh position={[0, 0, 2.25]} rotation={[-QUARTER_TURN, 0, 0]}>
        <planeGeometry args={[64, 4.5]} />
        <meshStandardMaterial
          defines={architectureToneMappingDefines}
          map={paving}
          roughness={0.75}
        />
      </mesh>
      <mesh position={[0, -0.14, 20]} rotation={[-QUARTER_TURN, 0, 0]}>
        <planeGeometry args={[64, 31]} />
        <meshStandardMaterial
          defines={architectureToneMappingDefines}
          color="#17181B"
          roughness={0.6}
        />
      </mesh>
      {/* A warm sodium lamp on the kerb. */}
      <Glow
        texture={assets.glow}
        position={[-7, 5.1, 4.0]}
        size={[3.4, 3.4]}
        color="#FFB36B"
        opacity={0.6}
        lightingSource="none"
      />
      <StorePointLight
        position={[-7, 4.9, 3.6]}
        color="#FFB36B"
        intensity={40}
        distance={18}
        decay={1.6}
        lightingSource="none"
      />
    </group>
  )
}

/** The buildings either side and above: dim fronts with a few small lit signs, no words. */
export function Neighbours() {
  const { assets } = useStoreContext()
  return (
    <group>
      {/* The upper floors, one long wall. */}
      <mesh position={[0, 8.4, 0]}>
        <planeGeometry args={[64, 8.2]} />
        <meshStandardMaterial
          defines={architectureToneMappingDefines}
          color="#2F3034"
          roughness={0.95}
        />
      </mesh>
      {/* Their shop windows, warm and dim. */}
      <LitQuads
        texture={assets.glow}
        quads={NEIGHBOUR_WINDOWS}
        brightness={0.18}
        lightingSource="sign"
        isTransparent
      />
      {NEIGHBOUR_FRONTS.map(({ centerX, width }, index) => (
        <LitPanel
          key={centerX}
          texture={assets.neighbourSigns[index % assets.neighbourSigns.length] ?? assets.glow}
          position={[centerX - width * 0.12, 3.5, 0.36]}
          width={2.6}
          height={0.65}
          brightness={0.75}
          lightingSource="sign"
        />
      ))}
    </group>
  )
}

export function ShopFront() {
  const { assets, environmentMap } = useStoreContext()
  return (
    <group>
      {/* The fascia's lit STRIDEMON letters and their glow. */}
      <LitPanel
        texture={assets.storeSign}
        position={[0, 3.68, 0.35]}
        width={6.4}
        height={1.0}
        brightness={1.15}
        lightingSource="sign"
        isTransparent
      />
      <Glow
        texture={assets.glow}
        position={[0, 3.68, 0.6]}
        size={[9, 2.6]}
        color="#DDE4FF"
        opacity={0.28}
        lightingSource="sign"
      />
      {/* The glass. */}
      <mesh position={[0, 1.53, 0.02]} renderOrder={GLASS_RENDER_ORDER}>
        <planeGeometry args={[10, 3.06]} />
        <meshStandardMaterial
          defines={architectureToneMappingDefines}
          color="#9FB2C4"
          transparent
          opacity={0.12}
          roughness={0.05}
          metalness={0.3}
          envMap={environmentMap}
          depthWrite={false}
        />
      </mesh>
      {/* The blade sign over the pavement, both faces lit. */}
      <group position={[5.55, 3.0, 0.75]}>
        <LitQuads
          texture={assets.bladeSign}
          quads={BLADE_SIGN_FACES}
          lightingSource="sign"
          isDrawnOverGlows
        />
        <Glow
          texture={assets.glow}
          position={[0, 0, 0]}
          size={[2.4, 1.6]}
          color="#9FB4FF"
          opacity={0.25}
          lightingSource="sign"
        />
      </group>
      {/* A poster in the window, facing the street. */}
      <LitPanel
        texture={assets.windowPoster}
        position={[2.9, 1.25, -0.45]}
        width={1.0}
        height={1.5}
        lightingSource="sign"
        isPrint
      />
    </group>
  )
}
