'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { MathUtils, type PerspectiveCamera } from 'three'
import { useSmallStore } from '@/lib/create-small-store'
import { devStatsStore } from '@/lib/dev-stats-store'
import { visitStore } from '@/lib/visit-store'
import { readStoreView, readVerticalFovDegrees } from '@/store/camera-poses'
import { type StoreLighting, storeLightingPresets } from '@/store/store-lighting'

// Dev-only: holds the camera on the view picked in the dev panel (with its lighting), and counts
// the frame rate and the draw calls of every pass in a frame.

const STATS_INTERVAL_SECONDS = 0.5

/** Everything dev-only that lives inside the canvas. */
export function DevSceneHelpers({ lighting }: { lighting: StoreLighting }) {
  return (
    <>
      <DevViewCamera lighting={lighting} />
      <DevFrameStats />
    </>
  )
}

function DevViewCamera({ lighting }: { lighting: StoreLighting }) {
  const viewName = useSmallStore(visitStore, (state) => state.viewName)
  const camera = useThree((state) => state.camera) as PerspectiveCamera
  const aspectRatio = useThree((state) => state.size.width / state.size.height)
  useEffect(() => {
    const view = readStoreView(viewName)
    camera.position.set(...view.pose.position)
    camera.up.set(0, 1, 0)
    camera.lookAt(...view.pose.target)
    camera.fov = readVerticalFovDegrees(view.pose, aspectRatio)
    camera.near = 0.05
    camera.far = 120
    camera.updateProjectionMatrix()
    lighting.setLevels(storeLightingPresets[view.lighting])
  }, [viewName, camera, aspectRatio, lighting])
  return null
}

function DevFrameStats() {
  const renderer = useThree((state) => state.gl)
  const sample = useRef({ elapsedSeconds: 0, frameCount: 0 })
  useEffect(() => {
    // Count every pass (reflection, shadows, effects), not only the last render.
    renderer.info.autoReset = false
    return () => {
      renderer.info.autoReset = true
    }
  }, [renderer])
  useFrame((_, deltaSeconds) => {
    // Runs before this frame renders, so `info` still holds the whole previous frame.
    const { calls, triangles } = renderer.info.render
    renderer.info.reset()
    sample.current.elapsedSeconds += deltaSeconds
    sample.current.frameCount += 1
    if (sample.current.elapsedSeconds < STATS_INTERVAL_SECONDS) return
    devStatsStore.update({
      framesPerSecond: MathUtils.clamp(
        Math.round(sample.current.frameCount / sample.current.elapsedSeconds),
        0,
        999,
      ),
      drawCallCount: calls,
      triangleCount: triangles,
    })
    sample.current = { elapsedSeconds: 0, frameCount: 0 }
  })
  return null
}
