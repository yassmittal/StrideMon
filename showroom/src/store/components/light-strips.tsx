'use client'

import { useEffect, useMemo } from 'react'
import { BoxGeometry, type BufferGeometry, Color } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Vector3Tuple } from '../camera-poses'

// The LED strips (coves, shelf edges, the lamp's head), as one unlit mesh per colour. They stay
// on in the dark front shot, as in the film. A strip brighter than white (`intensity` > 1) is
// one the bloom picks up (brief §6.3); the shelf strips stay at 1 so no bloom spills onto the
// Sneakers just above them.

export type LightStripSpec = {
  position: Vector3Tuple
  size: Vector3Tuple
  color: string
  intensity?: number
}

export function MergedLightStrips({ strips }: { strips: readonly LightStripSpec[] }) {
  const groups = useMemo(() => groupStripsByLook(strips), [strips])
  useEffect(
    () => () => {
      for (const group of groups) group.geometry.dispose()
    },
    [groups],
  )
  return (
    <group>
      {groups.map(({ key, color, geometry }) => (
        <mesh key={key} geometry={geometry}>
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function groupStripsByLook(strips: readonly LightStripSpec[]) {
  const geometriesByKey = new Map<
    string,
    { color: string; intensity: number; geometries: BufferGeometry[] }
  >()
  for (const { position, size, color, intensity = 1 } of strips) {
    const key = `${color}|${intensity}`
    const entry = geometriesByKey.get(key) ?? { color, intensity, geometries: [] }
    entry.geometries.push(new BoxGeometry(size[0], size[1], size[2]).translate(...position))
    geometriesByKey.set(key, entry)
  }
  return [...geometriesByKey.entries()].map(([key, { color, intensity, geometries }]) => {
    const geometry = mergeGeometries(geometries)
    for (const stripGeometry of geometries) stripGeometry.dispose()
    if (geometry === null) throw new Error(`The ${key} strips couldn't be merged`)
    return { key, color: new Color(color).multiplyScalar(intensity), geometry }
  })
}
