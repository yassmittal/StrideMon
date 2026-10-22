'use client'

import { useMemo } from 'react'
import type { Vector3Tuple } from '../camera-poses'
import { buildSneakerWallGeometry, type SneakerAtlas, type SneakerCell } from '../sneaker-pictures'
import {
  RARE_WALL_COLUMN_COUNT,
  RARE_WALL_DESIGN_NUMBERS,
  RARE_WALL_ROW_COUNT,
  SNEAKER_WALL_COLUMN_COUNT,
  SNEAKER_WALL_DESIGN_NUMBERS,
  SNEAKER_WALL_ROW_COUNT,
} from '../sneaker-placements'
import { useStoreContext } from '../store-context'
import type { LightStripSpec } from './light-strips'
import type { BlockSpec } from './merged-blocks'
import { SNEAKER_RENDER_ORDER } from './render-order'
import { CEILING_HEIGHT, STORE_HALF_WIDTH } from './room'
import { SneakerAtlasMesh } from './sneaker-atlas-mesh'
import { Glow, LitPanel, StorePointLight } from './store-primitives'

// The left wall (the #0137 lightbox and the Rare niche) and the right wall (the Sneakers niche),
// ported from the film's `HeroWall`, `RareWall` and `SneakerWall`. Each niche's Sneakers are one
// atlas and one mesh. The counter and its stand are in stand.tsx.

const QUARTER_TURN = Math.PI / 2
const LEFT_WALL_X = -STORE_HALF_WIDTH + 0.03
const RIGHT_WALL_X = STORE_HALF_WIDTH - 0.03
const NICHE_SNEAKER_WIDTH = 0.42
const NICHE_CELL_WIDTH = 0.5

const RARE_NICHE = { centerZ: -1.55, centerY: 1.95, rowHeight: 0.33 } as const
const SNEAKER_NICHE = { centerZ: -6.0, centerY: 2.2, height: 1.7, rowHeight: 0.34 } as const

export const wallBlocks: readonly BlockSpec[] = [
  // The lightbox's frame and the tagline panel's.
  { position: [LEFT_WALL_X, 1.75, -4.4], size: [0.06, 2.35, 1.48], color: '#16161A' },
  { position: [LEFT_WALL_X, 1.75, -6.05], size: [0.06, 1.25, 1.0], color: '#0B0C10' },
  // The Rare niche's dark back and the white ledge below it.
  {
    position: [LEFT_WALL_X, RARE_NICHE.centerY, RARE_NICHE.centerZ],
    size: [0.04, 1.85, 2.15],
    color: '#121318',
  },
  {
    position: [LEFT_WALL_X + 0.15, 0.95, RARE_NICHE.centerZ],
    size: [0.3, 0.06, 2.3],
    color: '#F2F2F4',
    roughness: 0.5,
  },
  // The Sneakers niche's dark back.
  {
    position: [RIGHT_WALL_X, SNEAKER_NICHE.centerY, SNEAKER_NICHE.centerZ],
    size: [0.04, SNEAKER_NICHE.height, 4.7],
    color: '#0E0F14',
  },
]

export const wallLightStrips: readonly LightStripSpec[] = [
  // The warm cove over the lightbox.
  {
    position: [LEFT_WALL_X + 0.05, CEILING_HEIGHT - 0.06, -5.0],
    size: [0.03, 0.03, 4.4],
    color: '#FFAE45',
    intensity: 2.2,
  },
  // A cool strip under each shelf of both niches.
  ...Array.from(
    { length: RARE_WALL_ROW_COUNT },
    (_, row): LightStripSpec => ({
      position: [LEFT_WALL_X + 0.06, readRareRowY(row) - 0.135, RARE_NICHE.centerZ],
      size: [0.04, 0.012, 2.05],
      color: '#DCE3FF',
    }),
  ),
  ...Array.from(
    { length: SNEAKER_WALL_ROW_COUNT },
    (_, row): LightStripSpec => ({
      position: [RIGHT_WALL_X - 0.06, readSneakerRowY(row) - 0.135, SNEAKER_NICHE.centerZ],
      size: [0.04, 0.012, 4.6],
      color: '#C9D3FF',
    }),
  ),
]

function readRareRowY(row: number): number {
  return RARE_NICHE.centerY + ((RARE_WALL_ROW_COUNT - 1) / 2 - row) * RARE_NICHE.rowHeight
}

function readSneakerRowY(row: number): number {
  return SNEAKER_NICHE.centerY + ((SNEAKER_WALL_ROW_COUNT - 1) / 2 - row) * SNEAKER_NICHE.rowHeight
}

const rareWallCells: readonly SneakerCell[] = RARE_WALL_DESIGN_NUMBERS.map(
  (designNumber, index) => {
    const column = index % RARE_WALL_COLUMN_COUNT
    const row = Math.floor(index / RARE_WALL_COLUMN_COUNT)
    const cellZ =
      RARE_NICHE.centerZ + (column - (RARE_WALL_COLUMN_COUNT - 1) / 2) * NICHE_CELL_WIDTH
    const position: Vector3Tuple = [LEFT_WALL_X + 0.06, readRareRowY(row) + 0.02, cellZ]
    return { designNumber, position, rotationY: QUARTER_TURN, width: NICHE_SNEAKER_WIDTH }
  },
)

const sneakerWallCells: readonly SneakerCell[] = SNEAKER_WALL_DESIGN_NUMBERS.map(
  (designNumber, index) => {
    const column = index % SNEAKER_WALL_COLUMN_COUNT
    const row = Math.floor(index / SNEAKER_WALL_COLUMN_COUNT)
    const cellZ =
      SNEAKER_NICHE.centerZ - (column - (SNEAKER_WALL_COLUMN_COUNT - 1) / 2) * NICHE_CELL_WIDTH
    const position: Vector3Tuple = [RIGHT_WALL_X - 0.06, readSneakerRowY(row) + 0.02, cellZ]
    return { designNumber, position, rotationY: -QUARTER_TURN, width: NICHE_SNEAKER_WIDTH }
  },
)

/** The left wall: the #0137 lightbox, the tagline panel and the warm cove over them. */
export function HeroWall() {
  const { assets } = useStoreContext()
  return (
    <group>
      <LitPanel
        texture={assets.heroLightbox}
        position={[LEFT_WALL_X + 0.04, 1.75, -4.4]}
        width={1.3}
        height={2.17}
        rotationY={QUARTER_TURN}
        isPrint
      />
      <Glow
        texture={assets.glow}
        position={[LEFT_WALL_X + 0.5, 1.75, -4.4]}
        size={[2.6, 3.6]}
        color="#7B5CFF"
        opacity={0.22}
      />
      <LitPanel
        texture={assets.taglinePanel}
        position={[LEFT_WALL_X + 0.04, 1.75, -6.05]}
        width={0.9}
        height={1.125}
        rotationY={QUARTER_TURN}
      />
      <Glow
        texture={assets.glow}
        position={[LEFT_WALL_X + 0.2, CEILING_HEIGHT - 0.12, -5.0]}
        size={[4.6, 0.7]}
        color="#FF9A2E"
        opacity={0.45}
      />
      <StorePointLight
        position={[LEFT_WALL_X + 0.4, CEILING_HEIGHT - 0.2, -5.0]}
        color="#FFA040"
        intensity={4}
        distance={4}
        decay={1.5}
      />
    </group>
  )
}

/** The front of the left wall: the "Rare" niche. */
export function RareWall() {
  const { assets } = useStoreContext()
  return (
    <group>
      <LitPanel
        texture={assets.glow}
        position={[LEFT_WALL_X + 0.03, RARE_NICHE.centerY, RARE_NICHE.centerZ]}
        width={2.6}
        height={2.2}
        rotationY={QUARTER_TURN}
        brightness={0.35}
        isTransparent
      />
      <NicheSneakers atlas={assets.rareWall} cells={rareWallCells} />
      <LitPanel
        texture={assets.rareLabel}
        position={[LEFT_WALL_X + 0.02, 3.0, RARE_NICHE.centerZ - 0.55]}
        width={1.3}
        height={0.254}
        rotationY={QUARTER_TURN}
        isTransparent
      />
      <StorePointLight
        position={[LEFT_WALL_X + 0.6, 2.0, RARE_NICHE.centerZ]}
        color="#AFC0FF"
        intensity={2.5}
        distance={3}
        decay={1.5}
      />
    </group>
  )
}

/** The right wall: 45 Sneakers in a dark lit niche, above the counter's height. */
export function SneakerWall() {
  const { assets } = useStoreContext()
  return (
    <group>
      <LitPanel
        texture={assets.glow}
        position={[RIGHT_WALL_X - 0.03, SNEAKER_NICHE.centerY, SNEAKER_NICHE.centerZ]}
        width={5.4}
        height={SNEAKER_NICHE.height + 0.4}
        rotationY={-QUARTER_TURN}
        brightness={0.32}
        isTransparent
      />
      <NicheSneakers atlas={assets.sneakerWall} cells={sneakerWallCells} />
      <Glow
        texture={assets.glow}
        position={[RIGHT_WALL_X - 0.6, SNEAKER_NICHE.centerY, SNEAKER_NICHE.centerZ]}
        size={[5.5, 3.4]}
        color="#6E6BFF"
        opacity={0.16}
      />
      <LitPanel
        texture={assets.sneakersLabel}
        position={[RIGHT_WALL_X - 0.02, 2.75, SNEAKER_NICHE.centerZ + 2.95]}
        width={1.1}
        height={0.215}
        rotationY={-QUARTER_TURN}
        isTransparent
      />
      <StorePointLight
        position={[RIGHT_WALL_X - 0.7, 2.0, SNEAKER_NICHE.centerZ]}
        color="#8E95FF"
        intensity={3}
        distance={3.5}
        decay={1.5}
      />
    </group>
  )
}

function NicheSneakers({ atlas, cells }: { atlas: SneakerAtlas; cells: readonly SneakerCell[] }) {
  const geometry = useMemo(() => buildSneakerWallGeometry(cells, atlas), [cells, atlas])
  return (
    <SneakerAtlasMesh
      geometry={geometry}
      texture={atlas.texture}
      renderOrder={SNEAKER_RENDER_ORDER}
    />
  )
}
