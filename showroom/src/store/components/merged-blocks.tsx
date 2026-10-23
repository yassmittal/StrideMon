'use client'

import { useEffect, useMemo } from 'react'
import {
  BoxGeometry,
  type BufferGeometry,
  Color,
  Euler,
  Float32BufferAttribute,
  Matrix4,
  Quaternion,
  Vector3,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Vector3Tuple } from '../camera-poses'
import { useStoreContext } from '../store-context'
import { architectureToneMappingDefines } from '../tone-mapping'

// Every plain box in the store (counters, frames, skirting, chairs, the lamp post…) as one mesh per
// surface (roughness, metalness, shine), so the static building costs a handful of draw calls
// (brief §7.2). Each box keeps its own film colour as a vertex colour. Each wall lists its boxes
// as data next to its component.

export type BlockSpec = {
  position: Vector3Tuple
  size: Vector3Tuple
  color: string
  roughness?: number
  metalness?: number
  /** How much the environment map shows: only metal and polished surfaces (brief §6.3). */
  environmentShare?: number
  /** A turn about the vertical axis through `pivot` (a chair's own centre), in radians. */
  rotationY?: number
  pivot?: Vector3Tuple
}

type BlockSurface = { roughness: number; metalness: number; environmentShare: number }

const DEFAULT_ROUGHNESS = 0.8

export function MergedBlocks({ blocks }: { blocks: readonly BlockSpec[] }) {
  const { environmentMap } = useStoreContext()
  const groups = useMemo(() => groupBlocksByMaterial(blocks), [blocks])
  useEffect(
    () => () => {
      for (const group of groups) group.geometry.dispose()
    },
    [groups],
  )
  return (
    <group>
      {groups.map(({ key, material, geometry }) => (
        <mesh key={key} geometry={geometry}>
          <meshStandardMaterial
            defines={architectureToneMappingDefines}
            vertexColors
            roughness={material.roughness}
            metalness={material.metalness}
            envMap={material.environmentShare > 0 ? environmentMap : null}
            envMapIntensity={material.environmentShare}
          />
        </mesh>
      ))}
    </group>
  )
}

function groupBlocksByMaterial(blocks: readonly BlockSpec[]) {
  const geometriesByKey = new Map<
    string,
    { material: BlockSurface; geometries: BufferGeometry[] }
  >()
  for (const block of blocks) {
    const material: BlockSurface = {
      roughness: block.roughness ?? DEFAULT_ROUGHNESS,
      metalness: block.metalness ?? 0,
      environmentShare: block.environmentShare ?? 0,
    }
    const key = `${material.roughness}|${material.metalness}|${material.environmentShare}`
    const entry = geometriesByKey.get(key) ?? { material, geometries: [] }
    entry.geometries.push(toBlockGeometry(block))
    geometriesByKey.set(key, entry)
  }
  return [...geometriesByKey.entries()].map(([key, { material, geometries }]) => {
    const geometry = mergeGeometries(geometries)
    for (const blockGeometry of geometries) blockGeometry.dispose()
    if (geometry === null) throw new Error(`The ${key} blocks couldn't be merged`)
    return { key, material, geometry }
  })
}

function toBlockGeometry({
  position,
  size,
  color,
  rotationY = 0,
  pivot,
}: BlockSpec): BufferGeometry {
  const geometry = new BoxGeometry(size[0], size[1], size[2])
  // In three's linear working colour space, as a `color` prop would be.
  const linearColor = new Color(color)
  const vertexCount = geometry.attributes.position?.count ?? 0
  const colors = Array.from({ length: vertexCount }, () => [
    linearColor.r,
    linearColor.g,
    linearColor.b,
  ]).flat()
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  const rotation = new Quaternion().setFromEuler(new Euler(0, rotationY, 0))
  const unitScale = new Vector3(1, 1, 1)
  if (pivot === undefined) {
    return geometry.applyMatrix4(
      new Matrix4().compose(new Vector3(...position), rotation, unitScale),
    )
  }
  // Placed relative to the pivot, then turned about it.
  const offset = new Vector3(position[0] - pivot[0], position[1] - pivot[1], position[2] - pivot[2])
  geometry.translate(offset.x, offset.y, offset.z)
  return geometry.applyMatrix4(new Matrix4().compose(new Vector3(...pivot), rotation, unitScale))
}
