'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { type RefObject, useEffect, useRef } from 'react'
import type { PerspectiveCamera } from 'three'
import { useSmallStore } from '@/lib/create-small-store'
import { visitStore } from '@/lib/visit-store'
import { colourCheckViews } from '@/store/camera-poses'
import { type StoreLighting, storeLightingPresets } from '@/store/store-lighting'
import { placeCamera, poseLookingAt } from './frame-subject'
import { walkController } from './walk-controller'

// Inside the canvas: every frame, the walk says where the camera is, how lit the store is and how
// dark the veil (reduced motion's fade, a DOM element over the canvas) should be.

export function WalkCamera({
  lighting,
  veilRef,
}: {
  lighting: StoreLighting
  veilRef: RefObject<HTMLDivElement | null>
}) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera
  const colourCheckViewName = useSmallStore(visitStore, (state) => state.colourCheckViewName)
  const shownVeilOpacity = useRef(-1)

  useEffect(() => {
    if (colourCheckViewName === null) return
    // Dev only: hold a colour check's face-on view, lit (Part 1's check, D-065).
    const { pose } = colourCheckViews[colourCheckViewName]
    placeCamera(camera, poseLookingAt(pose.position, pose.target, pose.verticalFovDegrees))
    lighting.setLevels(storeLightingPresets.lit)
  }, [camera, colourCheckViewName, lighting])

  useFrame((state, deltaSeconds) => {
    const aspectRatio = state.size.width / Math.max(state.size.height, 1)
    walkController.begin(aspectRatio)
    const frame = walkController.update(aspectRatio, deltaSeconds)
    if (colourCheckViewName === null) {
      if (frame.lighting !== null) lighting.setLevels(frame.lighting)
      placeCamera(camera, frame.pose)
    }
    const veilOpacity = Math.round(frame.veilOpacity * 100) / 100
    if (veilRef.current !== null && veilOpacity !== shownVeilOpacity.current) {
      veilRef.current.style.opacity = String(veilOpacity)
      shownVeilOpacity.current = veilOpacity
    }
  })
  return null
}
