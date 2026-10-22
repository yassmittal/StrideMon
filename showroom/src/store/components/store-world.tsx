'use client'

import { ContactShadows } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useSmallStore } from '@/lib/create-small-store'
import { visitStore } from '@/lib/visit-store'
import { useStoreLightingEffect } from '../store-context'
import { STORE_TUNING } from '../store-tuning'
import {
  backOfStoreBlocks,
  backOfStoreLightStrips,
  FoundingPassWall,
  LegendaryCorner,
} from './back-of-store'
import { MergedLightStrips } from './light-strips'
import { type BlockSpec, MergedBlocks } from './merged-blocks'
import { NotReflected, useCameraSeesNotReflectedLayer } from './reflection-layer'
import { Room, roomBlocks, STORE_DEPTH, STORE_HALF_WIDTH } from './room'
import { Stand, standBlocks } from './stand'
import { Neighbours, ShopFront, Street, streetBlocks, streetLightStrips } from './street'
import { HeroWall, RareWall, SneakerWall, wallBlocks, wallLightStrips } from './walls'

// The StrideMon store at night: the film's `ShowroomWorld`, one world for every view. The lit
// things glow; everything else is lit by a few lights. The static boxes and strips are merged.

const INSIDE_BLOCKS: readonly BlockSpec[] = [
  ...roomBlocks,
  ...wallBlocks,
  ...backOfStoreBlocks,
  ...standBlocks,
]
const INSIDE_LIGHT_STRIPS = [...wallLightStrips, ...backOfStoreLightStrips]

export function StoreWorld() {
  useCameraSeesNotReflectedLayer()
  const standDesignNumber = useSmallStore(visitStore, (state) => state.standDesignNumber)
  return (
    <group>
      <color attach="background" args={['#05060A']} />
      <fog attach="fog" args={['#07080C', 14, 46]} />
      <ambientLight intensity={0.12} color="#8090B0" />
      <ExposureFollowsLighting />
      <MergedBlocks blocks={INSIDE_BLOCKS} />
      <MergedLightStrips strips={INSIDE_LIGHT_STRIPS} />
      <NotReflected>
        <MergedBlocks blocks={streetBlocks} />
        <MergedLightStrips strips={streetLightStrips} />
        <Street />
        <Neighbours />
        <ShopFront />
      </NotReflected>
      <Room />
      <HeroWall />
      <RareWall />
      <LegendaryCorner />
      <FoundingPassWall />
      <SneakerWall />
      <Stand designNumber={standDesignNumber} />
      <StoreContactShadows />
    </group>
  )
}

/** The architecture's exposure is the renderer's, as in the film (tone-mapping.ts). */
function ExposureFollowsLighting() {
  const renderer = useThree((state) => state.gl)
  useStoreLightingEffect(({ exposure }) => {
    renderer.toneMappingExposure = exposure
  })
  return null
}

/** Soft shadows under the counters, the table, the chairs and the pedestal, rendered once. */
function StoreContactShadows() {
  const shadows = STORE_TUNING.contactShadows
  return (
    <ContactShadows
      position={[0, 0.004, -STORE_DEPTH / 2]}
      width={STORE_HALF_WIDTH * 2}
      height={STORE_DEPTH}
      frames={1}
      far={shadows.farMeters}
      blur={shadows.blur}
      opacity={shadows.opacity}
      resolution={shadows.resolutionPixels}
      color="#1C1A18"
    />
  )
}
