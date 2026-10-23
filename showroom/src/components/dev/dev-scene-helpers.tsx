'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { MathUtils } from 'three'
import { devStatsStore } from '@/lib/dev-stats-store'

// Dev-only: counts the frame rate and the draw calls of every pass in a frame. (The colour check's
// views are held by the walk's camera, walk-camera.tsx.)

const STATS_INTERVAL_SECONDS = 0.5

/** Everything dev-only that lives inside the canvas. */
export function DevSceneHelpers() {
  return <DevFrameStats />
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
