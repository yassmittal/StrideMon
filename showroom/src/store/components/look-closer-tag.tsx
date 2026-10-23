'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { MeshBasicMaterial, Texture } from 'three'
import { useSmallStore } from '@/lib/create-small-store'
import { readPassDesign } from '@/lib/sneaker-design'
import { useIsReducedMotion } from '@/lib/use-reduced-motion'
import { visitStore } from '@/lib/visit-store'
import {
  placeLookCloserTag,
  readLookCloserTarget,
  readTargetDesignNumber,
} from '@/visit/look-closer-targets'
import { createLookCloserTagTexture } from '../button-textures'
import { useStoreContext } from '../store-context'
import { useDisposeWhenReplaced } from '../use-dispose-when-replaced'
import { TAG_RENDER_ORDER } from './render-order'

// Look closer's shop tag (D-068): a small white tag in the store beside the Sneaker you're looking
// at (under it on a phone held upright), with its number, rarity, name, the promise and "See it on
// stridemon.xyz". It fades in as the camera arrives and goes when it leaves. A tap on it opens the
// design's page (visit/store-actions.ts). Unlit and under white, so the bloom never picks it up.

const DEGREES_TO_RADIANS = Math.PI / 180
const FADE_IN_SECONDS = 0.35
const RESTING_BRIGHTNESS = 0.94
const HOVERED_BRIGHTNESS = 1

export function LookCloserTag() {
  const { assets, tierSettings } = useStoreContext()
  const targetId = useSmallStore(visitStore, (state) => state.lookCloserTargetId)
  const isMoving = useSmallStore(visitStore, (state) => state.isMoving)
  const standDesignNumber = useSmallStore(visitStore, (state) => state.standDesignNumber)
  const isHovered = useSmallStore(visitStore, (state) => state.hoveredHitId === 'tag')
  const size = useThree((state) => state.size)
  const isReducedMotion = useIsReducedMotion()
  const target = readLookCloserTarget(targetId)
  const designNumber = target === null ? null : readTargetDesignNumber(target, standDesignNumber)
  const isShown = target !== null && !isMoving

  const [texture, setTexture] = useState<Texture | null>(null)
  useEffect(() => {
    const design = designNumber === null ? undefined : readPassDesign(designNumber)
    setTexture(
      design === undefined
        ? null
        : createLookCloserTagTexture({
            design,
            fontFamilies: assets.fontFamilies,
            printScale: tierSettings.printScale,
          }),
    )
  }, [assets.fontFamilies, designNumber, tierSettings.printScale])
  useDisposeWhenReplaced(texture)

  const placement = useMemo(
    () =>
      target === null ? null : placeLookCloserTag(target, size.width / Math.max(size.height, 1)),
    [target, size.width, size.height],
  )

  const materialRef = useRef<MeshBasicMaterial>(null)
  const fade = useRef<{ key: string | null; startedAt: number }>({ key: null, startedAt: 0 })
  // A new Sneaker (or arriving at one) fades its tag in again.
  const fadeKey = isShown ? targetId : null
  useFrame((state) => {
    const material = materialRef.current
    if (material === null) return
    if (fade.current.key !== fadeKey)
      fade.current = { key: fadeKey, startedAt: state.clock.elapsedTime }
    const fadeStartedAt = fade.current
    const share = isReducedMotion
      ? 1
      : Math.min((state.clock.elapsedTime - fadeStartedAt.startedAt) / FADE_IN_SECONDS, 1)
    material.opacity = share
    material.color.setScalar(isHovered ? HOVERED_BRIGHTNESS : RESTING_BRIGHTNESS)
  })

  if (!isShown || placement === null || texture === null) return null
  return (
    <mesh
      position={placement.center}
      rotation={[0, placement.facingDegrees * DEGREES_TO_RADIANS, 0]}
      renderOrder={TAG_RENDER_ORDER}
    >
      <planeGeometry args={[placement.width, placement.height]} />
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        toneMapped={false}
        fog={false}
        transparent
        opacity={0}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}
