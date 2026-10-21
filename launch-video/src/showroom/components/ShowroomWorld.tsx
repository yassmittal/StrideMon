import { useMemo } from 'react'
import { AdditiveBlending, DoubleSide, RepeatWrapping, type Texture } from 'three'
import type { Vector3Tuple } from '../camera'
import {
  RARE_WALL_COLUMN_COUNT,
  RARE_WALL_ROW_COUNT,
  SNEAKER_WALL_COLUMN_COUNT,
  SNEAKER_WALL_ROW_COUNT,
} from '../sneakers'
import { SNEAKER_ASPECT } from '../textures'
import type { ShowroomAssets } from './useShowroomAssets'

// The StrideMon store at night, in metres (camera.ts has the axes). One world for every shot: the
// street and the shop front (z ≥ 0) and the store behind the glass (x −5…5, z −10…0, 3.2 m high).
// The lit things (signs, lightboxes, downlights, LED strips) are unlit materials at full colour,
// with an additive glow in front; everything else is lit by a few lights.

const STORE_HALF_WIDTH = 5
const STORE_DEPTH = 10
const CEILING_HEIGHT = 3.2
const QUARTER_TURN = Math.PI / 2

/** How lit the store is: off in the dark front shot, on everywhere else. */
export type StoreLighting = 'dim' | 'on'

type LitPanelProps = {
  texture: Texture
  position: Vector3Tuple
  width: number
  height: number
  rotationY?: number
  rotationX?: number
  brightness?: number
  isTransparent?: boolean
}

/** A picture that gives off its own light: a sign, a lightbox, a screen. */
function LitPanel({
  texture,
  position,
  width,
  height,
  rotationY = 0,
  rotationX = 0,
  brightness = 1,
  isTransparent = false,
}: LitPanelProps) {
  return (
    <mesh position={position} rotation={[rotationX, rotationY, 0]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        color={[brightness, brightness, brightness]}
        toneMapped={false}
        transparent={isTransparent}
        depthWrite={!isTransparent}
      />
    </mesh>
  )
}

/** A soft glow, always facing the camera, added on top of whatever is behind it. */
function Glow({
  texture,
  position,
  size,
  color = '#FFFFFF',
  opacity,
}: {
  texture: Texture
  position: Vector3Tuple
  size: readonly [number, number]
  color?: string
  opacity: number
}) {
  return (
    <sprite position={position} scale={[size[0], size[1], 1]}>
      <spriteMaterial
        map={texture}
        color={color}
        opacity={opacity}
        blending={AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
        transparent
      />
    </sprite>
  )
}

function Block({
  position,
  size,
  color,
  roughness = 0.8,
  metalness = 0,
}: {
  position: Vector3Tuple
  size: Vector3Tuple
  color: string
  roughness?: number
  metalness?: number
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[size[0], size[1], size[2]]} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  )
}

/** A strip of LED light: a thin unlit box. */
function LightStrip({ position, size, color }: { position: Vector3Tuple; size: Vector3Tuple; color: string }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[size[0], size[1], size[2]]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  )
}

/** A Sneaker cut out of its background (the laced art's transparent PNG). */
function SneakerCutout({
  texture,
  position,
  width,
  rotationY = 0,
  rotationX = 0,
  brightness = 1,
}: {
  texture: Texture
  position: Vector3Tuple
  width: number
  rotationY?: number
  rotationX?: number
  brightness?: number
}) {
  return (
    <mesh position={position} rotation={[rotationX, rotationY, 0]}>
      <planeGeometry args={[width, width * SNEAKER_ASPECT]} />
      <meshBasicMaterial
        map={texture}
        color={[brightness, brightness, brightness]}
        toneMapped={false}
        transparent
        alphaTest={0.02}
      />
    </mesh>
  )
}

function Street({ assets }: { assets: ShowroomAssets }) {
  const paving = useMemo(() => {
    const repeatedPaving = assets.paving.clone()
    repeatedPaving.wrapS = RepeatWrapping
    repeatedPaving.wrapT = RepeatWrapping
    repeatedPaving.repeat.set(16, 1.2)
    repeatedPaving.needsUpdate = true
    return repeatedPaving
  }, [assets.paving])
  return (
    <group>
      {/* The pavement, 4.5 m deep, and the road beyond the kerb. */}
      <mesh position={[0, 0, 2.25]} rotation={[-QUARTER_TURN, 0, 0]}>
        <planeGeometry args={[64, 4.5]} />
        <meshStandardMaterial map={paving} roughness={0.75} />
      </mesh>
      <Block position={[0, -0.06, 4.55]} size={[64, 0.16, 0.2]} color="#6A6A6C" />
      <mesh position={[0, -0.14, 20]} rotation={[-QUARTER_TURN, 0, 0]}>
        <planeGeometry args={[64, 31]} />
        <meshStandardMaterial color="#17181B" roughness={0.6} />
      </mesh>
      {/* A street lamp on the kerb, warm, as the reference's sodium light. */}
      <Block position={[-7, 2.6, 4.3]} size={[0.12, 5.2, 0.12]} color="#2B2C2F" metalness={0.4} />
      <LightStrip position={[-7, 5.2, 4.0]} size={[0.5, 0.08, 0.3]} color="#FFC07A" />
      <Glow texture={assets.glow} position={[-7, 5.1, 4.0]} size={[3.4, 3.4]} color="#FFB36B" opacity={0.6} />
      <pointLight position={[-7, 4.9, 3.6]} color="#FFB36B" intensity={40} distance={18} decay={1.6} />
    </group>
  )
}

/** The buildings either side and above: dim fronts with a few small lit signs, no words. */
function Neighbours({ assets, brightness }: { assets: ShowroomAssets; brightness: number }) {
  const neighbourFronts: { centerX: number; width: number }[] = [
    { centerX: -9, width: 7 },
    { centerX: -16.5, width: 7.6 },
    { centerX: -24, width: 7 },
    { centerX: 9, width: 7 },
    { centerX: 16.5, width: 7.6 },
  ]
  return (
    <group>
      {/* The upper floors, one long wall. */}
      <mesh position={[0, 8.4, 0]}>
        <planeGeometry args={[64, 8.2]} />
        <meshStandardMaterial color="#2F3034" roughness={0.95} />
      </mesh>
      {neighbourFronts.map(({ centerX, width }, index) => (
        <group key={centerX}>
          <Block position={[centerX, 2.15, -0.15]} size={[width, 4.3, 0.3]} color="#232427" />
          {/* A shop window, warm and dim. */}
          <LitPanel
            texture={assets.glow}
            position={[centerX, 1.4, 0.02]}
            width={width * 0.7}
            height={2.2}
            brightness={0.18 * brightness}
            isTransparent
          />
          <Block position={[centerX, 3.5, 0.2]} size={[width - 0.4, 0.9, 0.3]} color="#111214" />
          <LitPanel
            texture={assets.neighbourSigns[index % assets.neighbourSigns.length] ?? assets.glow}
            position={[centerX - width * 0.12, 3.5, 0.36]}
            width={2.6}
            height={0.65}
            brightness={0.75 * brightness}
          />
          <Block position={[centerX + width / 2, 2.15, 0.1]} size={[0.5, 4.3, 0.5]} color="#3A3B3F" />
        </group>
      ))}
    </group>
  )
}

function ShopFront({ assets, signBrightness }: { assets: ShowroomAssets; signBrightness: number }) {
  return (
    <group>
      {/* The fascia: black, with the lit STRIDEMON letters and their glow. */}
      <Block position={[0, 3.68, 0.17]} size={[10.6, 1.25, 0.34]} color="#0A0A0B" roughness={0.4} />
      <LitPanel
        texture={assets.storeSign}
        position={[0, 3.68, 0.35]}
        width={6.4}
        height={1.0}
        brightness={1.15 * signBrightness}
        isTransparent
      />
      <Glow
        texture={assets.glow}
        position={[0, 3.68, 0.6]}
        size={[9, 2.6]}
        color="#DDE4FF"
        opacity={0.28 * signBrightness}
      />
      {/* The glass and its frame. */}
      <mesh position={[0, 1.53, 0.02]}>
        <planeGeometry args={[10, 3.06]} />
        <meshStandardMaterial
          color="#9FB2C4"
          transparent
          opacity={0.12}
          roughness={0.05}
          metalness={0.3}
          depthWrite={false}
        />
      </mesh>
      {[-5, -2.5, 0, 2.5, 5].map((mullionX) => (
        <Block key={mullionX} position={[mullionX, 1.53, 0.04]} size={[0.09, 3.06, 0.09]} color="#1B1C1F" />
      ))}
      <Block position={[0, 0.06, 0.06]} size={[10, 0.12, 0.14]} color="#1B1C1F" />
      {/* The blade sign over the pavement, both faces lit. */}
      <group position={[5.55, 3.0, 0.75]}>
        <Block position={[0, 0, 0]} size={[0.14, 0.74, 1.44]} color="#0B0C10" />
        <LitPanel texture={assets.bladeSign} position={[-0.08, 0, 0]} width={1.4} height={0.7} rotationY={-QUARTER_TURN} brightness={signBrightness} />
        <LitPanel texture={assets.bladeSign} position={[0.08, 0, 0]} width={1.4} height={0.7} rotationY={QUARTER_TURN} brightness={signBrightness} />
        <Glow texture={assets.glow} position={[0, 0, 0]} size={[2.4, 1.6]} color="#9FB4FF" opacity={0.25 * signBrightness} />
      </group>
      {/* A poster in the window, facing the street. */}
      <LitPanel texture={assets.windowPoster} position={[2.9, 1.25, -0.45]} width={1.0} height={1.5} brightness={signBrightness} />
    </group>
  )
}

/** The room: floor, ceiling with its downlights, and the three walls. */
function Room({ assets, brightness }: { assets: ShowroomAssets; brightness: number }) {
  const downlightXs = [-3.4, -1.0, 1.4, 3.6]
  const downlightZs = [-1.4, -3.9, -6.4, -8.9]
  return (
    <group>
      <mesh position={[0, 0.001, -STORE_DEPTH / 2]} rotation={[-QUARTER_TURN, 0, 0]}>
        <planeGeometry args={[STORE_HALF_WIDTH * 2, STORE_DEPTH]} />
        <meshStandardMaterial color="#8E8A84" roughness={0.32} metalness={0.05} />
      </mesh>
      <mesh position={[0, CEILING_HEIGHT, -STORE_DEPTH / 2]} rotation={[QUARTER_TURN, 0, 0]}>
        <planeGeometry args={[STORE_HALF_WIDTH * 2, STORE_DEPTH]} />
        <meshStandardMaterial color="#C9C9CF" roughness={0.9} side={DoubleSide} />
      </mesh>
      {downlightXs.flatMap((lightX) =>
        downlightZs.map((lightZ) => (
          <group key={`${lightX}:${lightZ}`}>
            <mesh position={[lightX, CEILING_HEIGHT - 0.005, lightZ]} rotation={[QUARTER_TURN, 0, 0]}>
              <circleGeometry args={[0.09, 32]} />
              <meshBasicMaterial color={[1.6 * brightness, 1.55 * brightness, 1.7 * brightness]} toneMapped={false} side={DoubleSide} />
            </mesh>
            <Glow texture={assets.glow} position={[lightX, CEILING_HEIGHT - 0.03, lightZ]} size={[0.55, 0.55]} opacity={0.5 * brightness} />
          </group>
        )),
      )}
      {/* Walls: left (x = −5), right (x = 5) and back (z = −10). */}
      <mesh position={[-STORE_HALF_WIDTH, CEILING_HEIGHT / 2, -STORE_DEPTH / 2]} rotation={[0, QUARTER_TURN, 0]}>
        <planeGeometry args={[STORE_DEPTH, CEILING_HEIGHT]} />
        <meshStandardMaterial color="#E6E6EA" roughness={0.85} />
      </mesh>
      <mesh position={[STORE_HALF_WIDTH, CEILING_HEIGHT / 2, -STORE_DEPTH / 2]} rotation={[0, -QUARTER_TURN, 0]}>
        <planeGeometry args={[STORE_DEPTH, CEILING_HEIGHT]} />
        <meshStandardMaterial color="#E6E6EA" roughness={0.85} />
      </mesh>
      <mesh position={[0, CEILING_HEIGHT / 2, -STORE_DEPTH]}>
        <planeGeometry args={[STORE_HALF_WIDTH * 2, CEILING_HEIGHT]} />
        <meshStandardMaterial color="#E2E2E6" roughness={0.85} />
      </mesh>
      {/* Skirting, so the walls meet the floor. */}
      <Block position={[-STORE_HALF_WIDTH + 0.02, 0.05, -STORE_DEPTH / 2]} size={[0.04, 0.1, STORE_DEPTH]} color="#BDBDC2" />
      <Block position={[STORE_HALF_WIDTH - 0.02, 0.05, -STORE_DEPTH / 2]} size={[0.04, 0.1, STORE_DEPTH]} color="#BDBDC2" />
      {/* The light: soft fill plus a few ceiling lights. */}
      <ambientLight intensity={0.55 * brightness} color="#E8EAF5" />
      {[-2.5, 2.5].flatMap((lightX) =>
        [-2.5, -7.5].map((lightZ) => (
          <pointLight
            key={`${lightX}:${lightZ}`}
            position={[lightX, CEILING_HEIGHT - 0.25, lightZ]}
            intensity={9 * brightness}
            distance={9}
            decay={1.4}
            color="#F2F2FF"
          />
        )),
      )}
    </group>
  )
}

/** The left wall: the #0137 lightbox, the tagline panel and the warm cove over them. */
function HeroWall({ assets, brightness }: { assets: ShowroomAssets; brightness: number }) {
  const wallX = -STORE_HALF_WIDTH + 0.03
  return (
    <group>
      <Block position={[wallX, 1.75, -4.4]} size={[0.06, 2.35, 1.48]} color="#16161A" />
      <LitPanel texture={assets.heroLightbox} position={[wallX + 0.04, 1.75, -4.4]} width={1.3} height={2.17} rotationY={QUARTER_TURN} brightness={brightness} />
      <Glow texture={assets.glow} position={[wallX + 0.5, 1.75, -4.4]} size={[2.6, 3.6]} color="#7B5CFF" opacity={0.22 * brightness} />
      <Block position={[wallX, 1.75, -6.05]} size={[0.06, 1.25, 1.0]} color="#0B0C10" />
      <LitPanel texture={assets.taglinePanel} position={[wallX + 0.04, 1.75, -6.05]} width={0.9} height={1.125} rotationY={QUARTER_TURN} brightness={brightness} />
      <LightStrip position={[wallX + 0.05, CEILING_HEIGHT - 0.06, -5.0]} size={[0.03, 0.03, 4.4]} color="#FFAE45" />
      <Glow texture={assets.glow} position={[wallX + 0.2, CEILING_HEIGHT - 0.12, -5.0]} size={[4.6, 0.7]} color="#FF9A2E" opacity={0.45 * brightness} />
      <pointLight position={[wallX + 0.4, CEILING_HEIGHT - 0.2, -5.0]} color="#FFA040" intensity={4 * brightness} distance={4} decay={1.5} />
    </group>
  )
}

/** The front of the left wall: the "Rare" niche, as the reference's accessories wall. */
function RareWall({ assets, brightness }: { assets: ShowroomAssets; brightness: number }) {
  const wallX = -STORE_HALF_WIDTH + 0.03
  const nicheCenterZ = -1.55
  const nicheCenterY = 1.95
  const cellWidth = 0.5
  const rowHeight = 0.33
  return (
    <group>
      <Block position={[wallX, nicheCenterY, nicheCenterZ]} size={[0.04, 1.85, 2.15]} color="#121318" />
      <LitPanel texture={assets.glow} position={[wallX + 0.03, nicheCenterY, nicheCenterZ]} width={2.6} height={2.2} rotationY={QUARTER_TURN} brightness={0.35 * brightness} isTransparent />
      {assets.rareWall.map((texture, index) => {
        const column = index % RARE_WALL_COLUMN_COUNT
        const row = Math.floor(index / RARE_WALL_COLUMN_COUNT)
        const cellZ = nicheCenterZ + (column - (RARE_WALL_COLUMN_COUNT - 1) / 2) * cellWidth
        const cellY = nicheCenterY + ((RARE_WALL_ROW_COUNT - 1) / 2 - row) * rowHeight
        return (
          <group key={texture.id}>
            <SneakerCutout texture={texture} position={[wallX + 0.06, cellY + 0.02, cellZ]} width={0.42} rotationY={QUARTER_TURN} brightness={brightness} />
            {column === 0 ? (
              <LightStrip position={[wallX + 0.06, cellY - 0.135, nicheCenterZ]} size={[0.04, 0.012, 2.05]} color="#DCE3FF" />
            ) : null}
          </group>
        )
      })}
      <Block position={[wallX + 0.15, 0.95, nicheCenterZ]} size={[0.3, 0.06, 2.3]} color="#F2F2F4" roughness={0.5} />
      <LitPanel texture={assets.rareLabel} position={[wallX + 0.02, 3.0, nicheCenterZ - 0.55]} width={1.3} height={0.254} rotationY={QUARTER_TURN} brightness={brightness} isTransparent />
      <pointLight position={[wallX + 0.6, 2.0, nicheCenterZ]} color="#AFC0FF" intensity={2.5 * brightness} distance={3} decay={1.5} />
    </group>
  )
}

/** The back-left corner: the Legendary poster over a table and two chairs. */
function LegendaryCorner({ assets, brightness }: { assets: ShowroomAssets; brightness: number }) {
  const wallZ = -STORE_DEPTH + 0.03
  return (
    <group>
      <Block position={[-3.4, 1.75, wallZ]} size={[1.32, 2.12, 0.05]} color="#0E0F12" />
      <LitPanel texture={assets.legendaryPoster} position={[-3.4, 1.75, wallZ + 0.03]} width={1.2} height={2.0} brightness={brightness} />
      <Glow texture={assets.glow} position={[-3.4, 1.75, wallZ + 0.4]} size={[2.4, 3.2]} color="#9A8CFF" opacity={0.18 * brightness} />
      {/* The table. */}
      <Block position={[-3.0, 0.74, -8.3]} size={[1.1, 0.04, 0.65]} color="#3A3B40" roughness={0.4} />
      <Block position={[-3.0, 0.37, -8.3]} size={[0.06, 0.74, 0.06]} color="#B9BBC2" metalness={0.6} roughness={0.3} />
      <Block position={[-3.0, 0.01, -8.3]} size={[0.5, 0.02, 0.5]} color="#B9BBC2" metalness={0.6} roughness={0.3} />
      {/* Two black chairs. */}
      {[
        { chairX: -3.85, chairZ: -8.1, facing: 1 },
        { chairX: -2.1, chairZ: -7.6, facing: -1 },
      ].map(({ chairX, chairZ, facing }) => (
        <group key={chairX} position={[chairX, 0, chairZ]} rotation={[0, facing * 0.5, 0]}>
          <Block position={[0, 0.46, 0]} size={[0.46, 0.05, 0.46]} color="#111113" roughness={0.6} />
          <Block position={[-0.21 * facing, 0.75, 0]} size={[0.05, 0.55, 0.44]} color="#111113" roughness={0.6} />
          {[-0.18, 0.18].flatMap((legX) =>
            [-0.18, 0.18].map((legZ) => (
              <Block key={`${legX}:${legZ}`} position={[legX, 0.22, legZ]} size={[0.03, 0.44, 0.03]} color="#1A1A1D" />
            )),
          )}
        </group>
      ))}
    </group>
  )
}

/** The back wall: the lit "Founding Pass" words over its lightbox, a counter in front. */
function FoundingPassWall({ assets, brightness }: { assets: ShowroomAssets; brightness: number }) {
  const wallZ = -STORE_DEPTH + 0.04
  const centerX = 0.7
  return (
    <group>
      <Block position={[centerX, CEILING_HEIGHT / 2, wallZ]} size={[4.0, CEILING_HEIGHT, 0.06]} color="#121214" roughness={0.5} />
      <LitPanel texture={assets.foundingPassTitle} position={[centerX, 2.72, wallZ + 0.04]} width={3.1} height={0.605} brightness={1.1 * brightness} isTransparent />
      <Glow texture={assets.glow} position={[centerX, 2.72, wallZ + 0.3]} size={[4.2, 1.3]} opacity={0.22 * brightness} />
      <LitPanel texture={assets.foundingPassLightbox} position={[centerX, 1.62, wallZ + 0.04]} width={2.5} height={1.5} brightness={brightness} />
      <Glow texture={assets.glow} position={[centerX, 1.62, wallZ + 0.5]} size={[3.6, 2.4]} color="#C9CCFF" opacity={0.2 * brightness} />
      <LightStrip position={[centerX - 2.02, CEILING_HEIGHT / 2, wallZ + 0.04]} size={[0.035, CEILING_HEIGHT, 0.03]} color="#FFB13D" />
      <Glow texture={assets.glow} position={[centerX - 2.0, CEILING_HEIGHT / 2, wallZ + 0.2]} size={[0.8, 3.6]} color="#FF9A2E" opacity={0.5 * brightness} />
      {/* The counter and its upright screen. */}
      <Block position={[centerX, 0.5, -8.55]} size={[3.0, 1.0, 0.7]} color="#18181B" roughness={0.35} />
      <Block position={[centerX, 1.01, -8.55]} size={[3.04, 0.03, 0.74]} color="#232327" roughness={0.25} />
      <Block position={[centerX - 1.6, 1.4, -8.45]} size={[0.48, 0.78, 0.04]} color="#0A0A0C" />
      <LitPanel texture={assets.counterScreen} position={[centerX - 1.6, 1.4, -8.425]} width={0.42} height={0.7} brightness={brightness} />
      <pointLight position={[centerX, 2.4, -8.6]} color="#F4F4FF" intensity={3 * brightness} distance={4} decay={1.5} />
    </group>
  )
}

/** The right wall: 45 Sneakers in a dark lit niche, above the counter's height, a white counter and a Sneaker on a stand. */
function SneakerWall({ assets, brightness }: { assets: ShowroomAssets; brightness: number }) {
  const wallX = STORE_HALF_WIDTH - 0.03
  const nicheCenterZ = -6.0
  // The niche runs from 1.35 m (clear of the 0.96 m counter and the stand on it) to 3.05 m.
  const nicheCenterY = 2.2
  const nicheHeight = 1.7
  const cellWidth = 0.5
  const rowHeight = 0.34
  return (
    <group>
      <Block position={[wallX, nicheCenterY, nicheCenterZ]} size={[0.04, nicheHeight, 4.7]} color="#0E0F14" />
      <LitPanel texture={assets.glow} position={[wallX - 0.03, nicheCenterY, nicheCenterZ]} width={5.4} height={nicheHeight + 0.4} rotationY={-QUARTER_TURN} brightness={0.32 * brightness} isTransparent />
      {assets.sneakerWall.map((texture, index) => {
        const column = index % SNEAKER_WALL_COLUMN_COUNT
        const row = Math.floor(index / SNEAKER_WALL_COLUMN_COUNT)
        const cellZ = nicheCenterZ - (column - (SNEAKER_WALL_COLUMN_COUNT - 1) / 2) * cellWidth
        const cellY = nicheCenterY + ((SNEAKER_WALL_ROW_COUNT - 1) / 2 - row) * rowHeight
        return (
          <group key={texture.id}>
            <SneakerCutout texture={texture} position={[wallX - 0.06, cellY + 0.02, cellZ]} width={0.42} rotationY={-QUARTER_TURN} brightness={brightness} />
            {column === 0 ? (
              <LightStrip position={[wallX - 0.06, cellY - 0.135, nicheCenterZ]} size={[0.04, 0.012, 4.6]} color="#C9D3FF" />
            ) : null}
          </group>
        )
      })}
      <Glow texture={assets.glow} position={[wallX - 0.6, nicheCenterY, nicheCenterZ]} size={[5.5, 3.4]} color="#6E6BFF" opacity={0.16 * brightness} />
      <LitPanel texture={assets.sneakersLabel} position={[wallX - 0.02, 2.75, nicheCenterZ + 2.95]} width={1.1} height={0.215} rotationY={-QUARTER_TURN} brightness={brightness} isTransparent />
      {/* The white counter and the stand on it. */}
      <Block position={[3.9, 0.48, -5.4]} size={[0.9, 0.96, 3.0]} color="#ECECEF" roughness={0.45} />
      <Block position={[3.82, 0.97, -4.55]} size={[0.2, 0.03, 0.16]} color="#F7F7F9" roughness={0.3} />
      <SneakerCutout texture={assets.standSneaker} position={[3.8, 1.13, -4.55]} width={0.44} rotationY={-1.05} rotationX={-0.08} brightness={brightness} />
      {/* Its card stands beside it, facing the same way, leaning back a little. */}
      <mesh position={[3.9, 1.018, -4.27]} rotation={[0, -1.05, 0]}>
        <mesh rotation={[-0.3, 0, 0]}>
          <planeGeometry args={[0.2, 0.12]} />
          <meshBasicMaterial map={assets.standCard} color={[0.9 * brightness, 0.9 * brightness, 0.9 * brightness]} toneMapped={false} />
        </mesh>
      </mesh>
      <pointLight position={[3.2, 2.6, -5.4]} color="#F2F2FF" intensity={4 * brightness} distance={4} decay={1.4} />
      <pointLight position={[wallX - 0.7, 2.0, nicheCenterZ]} color="#8E95FF" intensity={3 * brightness} distance={3.5} decay={1.5} />
    </group>
  )
}

export function ShowroomWorld({ assets, lighting }: { assets: ShowroomAssets; lighting: StoreLighting }) {
  const storeBrightness = lighting === 'on' ? 1 : 0.18
  const signBrightness = lighting === 'on' ? 1 : 0.55
  return (
    <group>
      <color attach="background" args={['#05060A']} />
      <fog attach="fog" args={['#07080C', 14, 46]} />
      <ambientLight intensity={0.12} color="#8090B0" />
      <Street assets={assets} />
      <Neighbours assets={assets} brightness={signBrightness} />
      <ShopFront assets={assets} signBrightness={signBrightness} />
      <Room assets={assets} brightness={storeBrightness} />
      <HeroWall assets={assets} brightness={storeBrightness} />
      <RareWall assets={assets} brightness={storeBrightness} />
      <LegendaryCorner assets={assets} brightness={storeBrightness} />
      <FoundingPassWall assets={assets} brightness={storeBrightness} />
      <SneakerWall assets={assets} brightness={storeBrightness} />
    </group>
  )
}
