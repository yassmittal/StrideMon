import type { Vector3Tuple } from './camera-poses'
import {
  FOUNDING_PASS_WALL_DESIGN_NUMBERS,
  HERO_DESIGN_NUMBER,
  LEGENDARY_DESIGN_NUMBER,
  RARE_WALL_COLUMN_COUNT,
  RARE_WALL_DESIGN_NUMBERS,
  RARE_WALL_ROW_COUNT,
  SNEAKER_WALL_COLUMN_COUNT,
  SNEAKER_WALL_DESIGN_NUMBERS,
  SNEAKER_WALL_ROW_COUNT,
  WINDOW_POSTER_DESIGN_NUMBER,
} from './sneaker-placements'
import { STORE_DEPTH, STORE_HALF_WIDTH } from './store-dimensions'

// Where each Sneaker the store shows sits in the world, as the film's `ShowroomWorld.tsx` places
// it: the niches' shelf cells, the prints (a lightbox or a poster, with its Sneakers painted in at
// the film's canvas places) and the stand. The store's components draw from
// these, and look closer (Part 3) taps and frames them, so the two can't drift apart.

const QUARTER_TURN_DEGREES = 90
export const LEFT_WALL_X = -STORE_HALF_WIDTH + 0.03
export const RIGHT_WALL_X = STORE_HALF_WIDTH - 0.03
export const LEGENDARY_WALL_Z = -STORE_DEPTH + 0.03
export const PASS_WALL_Z = -STORE_DEPTH + 0.04
export const PASS_WALL_CENTER_X = 0.7

const NICHE_SNEAKER_WIDTH = 0.42
const NICHE_CELL_WIDTH = 0.5

export const RARE_NICHE = { centerZ: -1.55, centerY: 1.95, rowHeight: 0.33 } as const
export const SNEAKER_NICHE = { centerZ: -6.0, centerY: 2.2, height: 1.7, rowHeight: 0.34 } as const

/** A Sneaker cut-out on a niche's shelf. */
export type ShelfSpot = {
  designNumber: number
  /** The cut-out's centre, just off the niche's back. */
  position: Vector3Tuple
  /** Which way it faces, in degrees: 0 is +z (the street), 90 is +x (the left wall faces it). */
  facingDegrees: number
  width: number
  /** The whole cell on the shelf, a tap target (Part 3). */
  cellWidth: number
  cellHeight: number
  row: number
}

export function readRareRowY(row: number): number {
  return RARE_NICHE.centerY + ((RARE_WALL_ROW_COUNT - 1) / 2 - row) * RARE_NICHE.rowHeight
}

export function readSneakerRowY(row: number): number {
  return SNEAKER_NICHE.centerY + ((SNEAKER_WALL_ROW_COUNT - 1) / 2 - row) * SNEAKER_NICHE.rowHeight
}

export const rareWallSpots: readonly ShelfSpot[] = RARE_WALL_DESIGN_NUMBERS.map(
  (designNumber, index) => {
    const column = index % RARE_WALL_COLUMN_COUNT
    const row = Math.floor(index / RARE_WALL_COLUMN_COUNT)
    const cellZ =
      RARE_NICHE.centerZ + (column - (RARE_WALL_COLUMN_COUNT - 1) / 2) * NICHE_CELL_WIDTH
    return {
      designNumber,
      position: [LEFT_WALL_X + 0.06, readRareRowY(row) + 0.02, cellZ],
      facingDegrees: QUARTER_TURN_DEGREES,
      width: NICHE_SNEAKER_WIDTH,
      cellWidth: NICHE_CELL_WIDTH,
      cellHeight: RARE_NICHE.rowHeight,
      row,
    }
  },
)

export const sneakerWallSpots: readonly ShelfSpot[] = SNEAKER_WALL_DESIGN_NUMBERS.map(
  (designNumber, index) => {
    const column = index % SNEAKER_WALL_COLUMN_COUNT
    const row = Math.floor(index / SNEAKER_WALL_COLUMN_COUNT)
    const cellZ =
      SNEAKER_NICHE.centerZ - (column - (SNEAKER_WALL_COLUMN_COUNT - 1) / 2) * NICHE_CELL_WIDTH
    return {
      designNumber,
      position: [RIGHT_WALL_X - 0.06, readSneakerRowY(row) + 0.02, cellZ],
      facingDegrees: -QUARTER_TURN_DEGREES,
      width: NICHE_SNEAKER_WIDTH,
      cellWidth: NICHE_CELL_WIDTH,
      cellHeight: SNEAKER_NICHE.rowHeight,
      row,
    }
  },
)

/** A Sneaker painted into a print, in the print canvas's own pixels (the film's numbers). */
export type PrintSneaker = {
  designNumber: number
  centerX: number
  centerY: number
  width: number
  rotationDegrees: number
}

export const PRINT_IDS = [
  'heroLightbox',
  'legendaryPoster',
  'foundingPassLightbox',
  'windowPoster',
] as const
export type PrintId = (typeof PRINT_IDS)[number]

/** A lightbox, poster or screen: its canvas, where it hangs, and the Sneakers in it. */
export type PrintSpot = {
  canvasWidth: number
  canvasHeight: number
  /** The lit panel's centre and size in the world. */
  position: Vector3Tuple
  width: number
  height: number
  facingDegrees: number
  /** In drawing order: a later one is painted over an earlier one. */
  sneakers: readonly PrintSneaker[]
}

export const printSpots: Record<PrintId, PrintSpot> = {
  // The big portrait lightbox on the left wall: #0137 on a deep violet field.
  heroLightbox: {
    canvasWidth: 1200,
    canvasHeight: 2000,
    position: [LEFT_WALL_X + 0.04, 1.75, -4.4],
    width: 1.3,
    height: 2.17,
    facingDegrees: QUARTER_TURN_DEGREES,
    sneakers: [
      {
        designNumber: HERO_DESIGN_NUMBER,
        centerX: 600,
        centerY: 1200,
        width: 960,
        rotationDegrees: -28,
      },
    ],
  },
  // The corner poster: LEGENDARY up the side, #0020 over it.
  legendaryPoster: {
    canvasWidth: 1200,
    canvasHeight: 2000,
    position: [-3.4, 1.75, LEGENDARY_WALL_Z + 0.03],
    width: 1.2,
    height: 2.0,
    facingDegrees: 0,
    sneakers: [
      {
        designNumber: LEGENDARY_DESIGN_NUMBER,
        centerX: 680,
        centerY: 1050,
        width: 880,
        rotationDegrees: -18,
      },
    ],
  },
  // The "Founding Pass" wall's lightbox: the two Rares, then the Legendary over them.
  foundingPassLightbox: {
    canvasWidth: 2000,
    canvasHeight: 1200,
    position: [PASS_WALL_CENTER_X, 1.62, PASS_WALL_Z + 0.04],
    width: 2.5,
    height: 1.5,
    facingDegrees: 0,
    sneakers: [
      {
        designNumber: FOUNDING_PASS_WALL_DESIGN_NUMBERS[0],
        centerX: 520,
        centerY: 820,
        width: 760,
        rotationDegrees: -10,
      },
      {
        designNumber: FOUNDING_PASS_WALL_DESIGN_NUMBERS[2],
        centerX: 1500,
        centerY: 820,
        width: 760,
        rotationDegrees: 10,
      },
      {
        designNumber: FOUNDING_PASS_WALL_DESIGN_NUMBERS[1],
        centerX: 1010,
        centerY: 760,
        width: 900,
        rotationDegrees: -4,
      },
    ],
  },
  // The poster in the window, facing the street.
  windowPoster: {
    canvasWidth: 800,
    canvasHeight: 1200,
    position: [2.9, 1.25, -0.45],
    width: 1.0,
    height: 1.5,
    facingDegrees: 0,
    sneakers: [
      {
        designNumber: WINDOW_POSTER_DESIGN_NUMBER,
        centerX: 400,
        centerY: 660,
        width: 640,
        rotationDegrees: -24,
      },
    ],
  },
}

/** The Sneaker on the counter's stand: sharp, turned toward the store, leaning back a little. */
export const STAND_SPOT = {
  position: [3.8, 1.13, -4.55] as Vector3Tuple,
  width: 0.44,
  rotationYRadians: -1.05,
  rotationXRadians: -0.08,
  /** The stand's Sneaker and its little card, a tap target. */
  targetWidth: 0.56,
  targetHeight: 0.4,
} as const
