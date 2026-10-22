'use client'

import { MeshReflectorMaterial } from '@react-three/drei'
import { useLayoutEffect, useRef } from 'react'
import {
  AdditiveBlending,
  type AmbientLight,
  DoubleSide,
  type InstancedMesh,
  type Material,
  type MeshBasicMaterial,
  Object3D,
} from 'three'
import { useStoreContext, useStoreLightingEffect } from '../store-context'
import { STORE_TUNING } from '../store-tuning'
import { architectureToneMappingDefines } from '../tone-mapping'
import type { BlockSpec } from './merged-blocks'
import { useNotReflected } from './reflection-layer'
import { GLOW_RENDER_ORDER } from './render-order'
import { StorePointLight, scaleColor, useGlowShare } from './store-primitives'

// The room: floor, ceiling and its downlights, the three walls and the soft light. Ported from the
// film's `Room`. The 16 downlights and their glows are two instanced meshes; the floor reflects
// on the tiers that can afford it (brief §6.3).

export const STORE_HALF_WIDTH = 5
export const STORE_DEPTH = 10
export const CEILING_HEIGHT = 3.2
const QUARTER_TURN = Math.PI / 2

const DOWNLIGHT_XS = [-3.4, -1.0, 1.4, 3.6] as const
const DOWNLIGHT_ZS = [-1.4, -3.9, -6.4, -8.9] as const
const DOWNLIGHT_POSITIONS = DOWNLIGHT_XS.flatMap((lightX) =>
  DOWNLIGHT_ZS.map((lightZ) => [lightX, lightZ] as const),
)
/** The film's downlight colour, brighter than white so the bloom picks it up. */
const DOWNLIGHT_COLOR = [1.6, 1.55, 1.7] as const
const DOWNLIGHT_RADIUS = 0.09
const DOWNLIGHT_GLOW_SIZE = 0.55
const DOWNLIGHT_GLOW_OPACITY = 0.5

export const roomBlocks: readonly BlockSpec[] = [
  // Skirting, so the walls meet the floor.
  {
    position: [-STORE_HALF_WIDTH + 0.02, 0.05, -STORE_DEPTH / 2],
    size: [0.04, 0.1, STORE_DEPTH],
    color: '#BDBDC2',
  },
  {
    position: [STORE_HALF_WIDTH - 0.02, 0.05, -STORE_DEPTH / 2],
    size: [0.04, 0.1, STORE_DEPTH],
    color: '#BDBDC2',
  },
]

export function Room() {
  return (
    <group>
      <StoreFloor />
      <mesh position={[0, CEILING_HEIGHT, -STORE_DEPTH / 2]} rotation={[QUARTER_TURN, 0, 0]}>
        <planeGeometry args={[STORE_HALF_WIDTH * 2, STORE_DEPTH]} />
        <meshStandardMaterial
          defines={architectureToneMappingDefines}
          color="#C9C9CF"
          roughness={0.9}
          side={DoubleSide}
        />
      </mesh>
      <Downlights />
      {/* Walls: left (x = −5), right (x = 5) and back (z = −10). */}
      <mesh
        position={[-STORE_HALF_WIDTH, CEILING_HEIGHT / 2, -STORE_DEPTH / 2]}
        rotation={[0, QUARTER_TURN, 0]}
      >
        <planeGeometry args={[STORE_DEPTH, CEILING_HEIGHT]} />
        <meshStandardMaterial
          defines={architectureToneMappingDefines}
          color="#E6E6EA"
          roughness={0.85}
        />
      </mesh>
      <mesh
        position={[STORE_HALF_WIDTH, CEILING_HEIGHT / 2, -STORE_DEPTH / 2]}
        rotation={[0, -QUARTER_TURN, 0]}
      >
        <planeGeometry args={[STORE_DEPTH, CEILING_HEIGHT]} />
        <meshStandardMaterial
          defines={architectureToneMappingDefines}
          color="#E6E6EA"
          roughness={0.85}
        />
      </mesh>
      <mesh position={[0, CEILING_HEIGHT / 2, -STORE_DEPTH]}>
        <planeGeometry args={[STORE_HALF_WIDTH * 2, CEILING_HEIGHT]} />
        <meshStandardMaterial
          defines={architectureToneMappingDefines}
          color="#E2E2E6"
          roughness={0.85}
        />
      </mesh>
      <RoomLight />
    </group>
  )
}

/** Warm grey polished concrete: a blurred reflection where the tier allows, else a rougher floor. */
function StoreFloor() {
  const { tierSettings, environmentMap } = useStoreContext()
  const reflectionPixels = tierSettings.floorReflectionPixels
  const floor = STORE_TUNING.floor
  return (
    <mesh position={[0, 0.001, -STORE_DEPTH / 2]} rotation={[-QUARTER_TURN, 0, 0]}>
      <planeGeometry args={[STORE_HALF_WIDTH * 2, STORE_DEPTH]} />
      {reflectionPixels === null ? (
        <meshStandardMaterial
          defines={architectureToneMappingDefines}
          color="#8E8A84"
          roughness={floor.lowTierRoughness}
          metalness={0.05}
        />
      ) : (
        <MeshReflectorMaterial
          key={reflectionPixels}
          ref={addArchitectureToneMapping}
          color="#8E8A84"
          roughness={0.32}
          metalness={0.05}
          envMap={environmentMap}
          envMapIntensity={floor.environmentShare}
          resolution={reflectionPixels}
          blur={floor.reflectionBlur}
          mixBlur={floor.mixBlur}
          mixStrength={floor.mixStrength}
          mixContrast={floor.mixContrast}
          mirror={0}
          depthScale={0}
        />
      )}
    </mesh>
  )
}

/**
 * The reflector sets its own defines (`USE_BLUR`…), so it can't take a `defines` prop: the
 * tone-mapping define is added to its own instead.
 */
function addArchitectureToneMapping(material: Material | null): void {
  if (material === null || material.defines?.ARCHITECTURE_TONE_MAPPING !== undefined) return
  material.defines = { ...material.defines, ...architectureToneMappingDefines }
  material.needsUpdate = true
}

/** The 16 round downlights and the glow under each, two draw calls. */
function Downlights() {
  const { assets } = useStoreContext()
  const glowShare = useGlowShare()
  const discsRef = useRef<InstancedMesh>(null)
  const glowsRef = useRef<InstancedMesh>(null)
  const discMaterialRef = useRef<MeshBasicMaterial>(null)
  const glowMaterialRef = useRef<MeshBasicMaterial>(null)
  useNotReflected(glowsRef)

  useLayoutEffect(() => {
    const placement = new Object3D()
    DOWNLIGHT_POSITIONS.forEach(([lightX, lightZ], lightIndex) => {
      placement.rotation.set(QUARTER_TURN, 0, 0)
      placement.position.set(lightX, CEILING_HEIGHT - 0.005, lightZ)
      placement.updateMatrix()
      discsRef.current?.setMatrixAt(lightIndex, placement.matrix)
      // The glow lies just under the ceiling, as the light's pool on it.
      placement.position.set(lightX, CEILING_HEIGHT - 0.03, lightZ)
      placement.updateMatrix()
      glowsRef.current?.setMatrixAt(lightIndex, placement.matrix)
    })
    for (const mesh of [discsRef.current, glowsRef.current]) {
      if (mesh === null) continue
      mesh.instanceMatrix.needsUpdate = true
      mesh.computeBoundingSphere()
    }
  }, [])

  useStoreLightingEffect(({ storeBrightness }) => {
    if (discMaterialRef.current !== null)
      scaleColor(discMaterialRef.current.color, DOWNLIGHT_COLOR, storeBrightness)
    if (glowMaterialRef.current !== null) {
      glowMaterialRef.current.opacity = DOWNLIGHT_GLOW_OPACITY * glowShare * storeBrightness
    }
  })

  return (
    <group>
      <instancedMesh ref={discsRef} args={[undefined, undefined, DOWNLIGHT_POSITIONS.length]}>
        <circleGeometry args={[DOWNLIGHT_RADIUS, 32]} />
        <meshBasicMaterial ref={discMaterialRef} toneMapped={false} side={DoubleSide} />
      </instancedMesh>
      <instancedMesh
        ref={glowsRef}
        args={[undefined, undefined, DOWNLIGHT_POSITIONS.length]}
        renderOrder={GLOW_RENDER_ORDER}
      >
        <planeGeometry args={[DOWNLIGHT_GLOW_SIZE, DOWNLIGHT_GLOW_SIZE]} />
        <meshBasicMaterial
          ref={glowMaterialRef}
          map={assets.glow}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
          side={DoubleSide}
          transparent
        />
      </instancedMesh>
    </group>
  )
}

/** Soft fill plus a few ceiling lights, as the film. */
function RoomLight() {
  const ambientRef = useRef<AmbientLight>(null)
  useStoreLightingEffect(({ storeBrightness }) => {
    if (ambientRef.current !== null) ambientRef.current.intensity = 0.55 * storeBrightness
  })
  return (
    <group>
      <ambientLight ref={ambientRef} color="#E8EAF5" />
      {[-2.5, 2.5].flatMap((lightX) =>
        [-2.5, -7.5].map((lightZ) => (
          <StorePointLight
            key={`${lightX}:${lightZ}`}
            position={[lightX, CEILING_HEIGHT - 0.25, lightZ]}
            intensity={9}
            distance={9}
            decay={1.4}
            color="#F2F2FF"
          />
        )),
      )}
    </group>
  )
}
