// Where everything sits in the Sneaker drop film, per format: 4:5 (1080 × 1350) is the master for
// X, 9:16 (1080 × 1920) is for YouTube Shorts. Each is laid out on its own (the shoes get bigger
// and the type moves in 9:16), never a crop. Pixels in the composition.
//
// Every shoe is placed by its heel and ground line. The renderer draws all ten templates in one
// 1000 × 600 space with the ground at y 520 and the heel within a few units of x 56, so one scale
// and one heel point register every design: a cut from one to the next reads as one Sneaker
// changing (docs/sneaker-drop-video-prompt.md §3). See components/RegisteredSneaker.tsx.

import type { Box, Point } from '../layouts'

export type SneakerDropFormat = '4x5' | '9x16'

/** A shoe on screen: its heel's x and ground line's y in pixels, and pixels per unit of the art. */
export type ShoePlacement = { heelX: number; groundY: number; unitScale: number }

export type SneakerDropLayout = {
  width: number
  height: number
  gutter: number
  metaFontSize: number
  /** Platform buttons cover the bottom of a Short: no text below this y. */
  textBottom: number
  lineArt: {
    /** The cold open's drawing and the slam on beat 7. */
    full: ShoePlacement
    /** The build's punch-in, on the heel tab and collar. */
    macro: ShoePlacement
    /** The silence before the drop: the same drawing, smaller. */
    inhale: ShoePlacement
  }
  /** The drop bar's framings of the hero, one per kick. */
  hero: { full: ShoePlacement; macroHeel: ShoePlacement; macroToe: ShoePlacement }
  /** One shoe on screen: the registered size every single cut shares. */
  one: ShoePlacement
  /** Where the 2-, 4- and 9-up splits are laid out. */
  splitArea: Box
  label: Point
  legendary: ShoePlacement
  /** The Legendary's Founder Sneaker picture (its own 400 × 400 square). */
  founderSneaker: { left: number; top: number; width: number }
  /** The flood's columns at each step, from the first hit of its bar to all 1,000. */
  floodColumnSteps: readonly number[]
  endCard: {
    pill: Point
    pillHeight: number
    pillFontSize: number
    brand: Point
    wordmarkFontSize: number
  }
}

const masterLayout: SneakerDropLayout = {
  width: 1080,
  height: 1350,
  gutter: 60,
  metaFontSize: 30,
  textBottom: 1350,
  lineArt: {
    full: { heelX: 85, groundY: 900, unitScale: 1.03 },
    macro: { heelX: 150, groundY: 1100, unitScale: 2.4 },
    inhale: { heelX: 290, groundY: 790, unitScale: 0.56 },
  },
  hero: {
    full: { heelX: 20, groundY: 930, unitScale: 1.17 },
    // The punch-ins stop above the label, so the type never sits on the art.
    macroHeel: { heelX: 150, groundY: 1100, unitScale: 2.4 },
    macroToe: { heelX: -1086, groundY: 1100, unitScale: 2.4 },
  },
  one: { heelX: 85, groundY: 900, unitScale: 1.03 },
  splitArea: { left: 0, top: 0, width: 1080, height: 1350 },
  label: { left: 60, top: 1170 },
  legendary: { heelX: 40, groundY: 860, unitScale: 1.12 },
  founderSneaker: { left: 90, top: 150, width: 900 },
  floodColumnSteps: [4, 5, 6, 8, 10, 12, 15, 18, 21, 25],
  endCard: {
    pill: { left: 60, top: 620 },
    pillHeight: 150,
    pillFontSize: 64,
    brand: { left: 60, top: 1110 },
    wordmarkFontSize: 72,
  },
}

/**
 * 9:16: the bottom 20% and the right edge hold the Shorts buttons (the action column starts about
 * 1,000 px down), so text stays above y 1536 and off the right edge, and the shoes stand high
 * enough that their toes clear the buttons.
 */
const verticalLayout: SneakerDropLayout = {
  width: 1080,
  height: 1920,
  gutter: 60,
  metaFontSize: 30,
  textBottom: 1536,
  lineArt: {
    full: { heelX: 40, groundY: 980, unitScale: 1.12 },
    macro: { heelX: 120, groundY: 1140, unitScale: 2.6 },
    inhale: { heelX: 290, groundY: 900, unitScale: 0.56 },
  },
  hero: {
    full: { heelX: 20, groundY: 980, unitScale: 1.17 },
    macroHeel: { heelX: 120, groundY: 1140, unitScale: 2.6 },
    macroToe: { heelX: -1264, groundY: 1140, unitScale: 2.6 },
  },
  one: { heelX: 40, groundY: 980, unitScale: 1.12 },
  splitArea: { left: 0, top: 140, width: 1080, height: 1420 },
  label: { left: 60, top: 1210 },
  legendary: { heelX: 20, groundY: 960, unitScale: 1.2 },
  founderSneaker: { left: 60, top: 200, width: 960 },
  floodColumnSteps: [3, 4, 5, 6, 8, 10, 12, 14, 17, 20],
  endCard: {
    pill: { left: 60, top: 760 },
    pillHeight: 150,
    pillFontSize: 64,
    brand: { left: 60, top: 1280 },
    wordmarkFontSize: 72,
  },
}

export const sneakerDropLayouts: Record<SneakerDropFormat, SneakerDropLayout> = {
  '4x5': masterLayout,
  '9x16': verticalLayout,
}

/** A split's cells: 2 stacked rows, or a square grid of 4 or 9, filling the split area. */
export function readSplitCells(area: Box, cellCount: 2 | 4 | 9): Box[] {
  const columnCount = cellCount === 2 ? 1 : Math.sqrt(cellCount)
  const rowCount = cellCount / columnCount
  const cellWidth = area.width / columnCount
  const cellHeight = area.height / rowCount
  return Array.from({ length: cellCount }, (_, cellIndex) => ({
    left: area.left + (cellIndex % columnCount) * cellWidth,
    top: area.top + Math.floor(cellIndex / columnCount) * cellHeight,
    width: cellWidth,
    height: cellHeight,
  }))
}

// The art's own frame: shoes span about 890 units from the heel, and stand up to 454 tall.
const SHOE_LENGTH_UNITS = 890
const GROUND_UNIT_Y = 520
/** Halfway up a mid-height shoe, so tall and low templates both sit in the middle of a cell. */
const SHOE_MIDDLE_UNIT_Y = 360
const CELL_PADDING_RATIO = 0.08

/** One shoe, centred in a cell with a little padding. */
export function placeShoeInCell(cell: Box): ShoePlacement {
  const padding = cell.width * CELL_PADDING_RATIO
  const unitScale = Math.min(
    (cell.width - 2 * padding) / SHOE_LENGTH_UNITS,
    (cell.height - 2 * padding) / (GROUND_UNIT_Y - 60),
  )
  return {
    heelX: cell.left + (cell.width - SHOE_LENGTH_UNITS * unitScale) / 2,
    groundY: cell.top + cell.height / 2 + (GROUND_UNIT_Y - SHOE_MIDDLE_UNIT_Y) * unitScale,
    unitScale,
  }
}
