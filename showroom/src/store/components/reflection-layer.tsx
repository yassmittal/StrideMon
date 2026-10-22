'use client'

import { useThree } from '@react-three/fiber'
import { type ReactNode, type RefObject, useLayoutEffect, useRef } from 'react'
import type { Group, Object3D } from 'three'

// What the floor's reflection skips (brief §8's draw-call budget). drei's MeshReflectorMaterial
// renders with a camera that sees layer 0 only; things on this layer show in the main view but
// not in the reflection: everything outside the glass (from inside, the floor would show only a
// sliver of dark street) and the glows (soft sprites the blur would wipe out anyway). Lights stay
// on layer 0, so they light every pass the same.

const NOT_REFLECTED_LAYER = 1

/** The main camera sees both layers. */
export function useCameraSeesNotReflectedLayer(): void {
  const camera = useThree((state) => state.camera)
  useLayoutEffect(() => {
    camera.layers.enable(NOT_REFLECTED_LAYER)
  }, [camera])
}

export function NotReflected({ children }: { children: ReactNode }) {
  const groupRef = useRef<Group>(null)
  useNotReflected(groupRef)
  return <group ref={groupRef}>{children}</group>
}

/** Moves the object's drawable parts (not its lights) onto the layer the reflection skips. */
export function useNotReflected(objectRef: RefObject<Object3D | null>): void {
  useLayoutEffect(() => {
    objectRef.current?.traverse((object) => {
      if ('isMesh' in object || 'isSprite' in object) object.layers.set(NOT_REFLECTED_LAYER)
    })
  })
}
