'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { loadingStore } from '@/lib/loading-store'

// Compiles every shader while the loader still covers the canvas (brief §8), then draws a few
// frames under it, so the effects, the reflection and the environment map's materials compile
// too. Only then is the store ready and the loader's lime stroke drawn: nothing stutters on the
// first move.

/** Frames drawn under the loader after compiling: the environment map renders on the first. */
const WARM_FRAME_COUNT = 3

export function StoreWarmUp() {
  const renderer = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)
  const framesSinceCompile = useRef<number | null>(null)

  useEffect(() => {
    let isCancelled = false
    const startFrames = () => {
      if (!isCancelled) framesSinceCompile.current = 0
    }
    // `compileAsync` uses KHR_parallel_shader_compile where the browser has it.
    renderer.compileAsync(scene, camera).then(startFrames, (error: unknown) => {
      console.warn('The showroom could not compile its shaders ahead', error)
      startFrames()
    })
    return () => {
      isCancelled = true
    }
  }, [renderer, scene, camera])

  useFrame(() => {
    const frameCount = framesSinceCompile.current
    if (frameCount === null || loadingStore.read().isSceneWarm) return
    framesSinceCompile.current = frameCount + 1
    if (frameCount + 1 < WARM_FRAME_COUNT) return
    loadingStore.update({ isSceneWarm: true })
    if (loadingStore.read().phase === 'loading') loadingStore.update({ phase: 'ready' })
  })
  return null
}
