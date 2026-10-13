import { staticFile } from 'remotion'

// The Founding Pass art the waitlist film shows: the contract renderer's own SVGs, copied into
// public/pass-art/ (gitignored) by scripts/copy-pass-art.sh, which reads this file. The film only
// animates them; it never changes a path or a colour (DESIGNS_FROZEN_ON). FACTS.md §12.

/** The pass every beat comes back to: #0137 Rose Hiker Night, Common. */
export const HERO_DESIGN_NUMBER = 137

/** The Legendary: #0020 Earthshine, the Runner's (Prism family). */
export const LEGENDARY_DESIGN_NUMBER = 20

/**
 * The collection grid, five rows of five, read left to right. Picked by a seeded script: all ten
 * templates and all thirteen non-Prism families, no two neighbours sharing a template or a family,
 * and #0137 in the middle, where the punch-in lands.
 */
export const GRID_DESIGN_NUMBERS: readonly number[] = [
  890, 830, 721, 212, 483, 677, 257, 203, 852, 555, 818, 71, 137, 400, 338, 346, 775, 627, 121, 897,
  798, 791, 999, 204, 963,
]

export const GRID_COLUMN_COUNT = 5

/** Every gallery card the film loads: the grid, the hero and the Legendary. */
export const CARD_DESIGN_NUMBERS: readonly number[] = [
  ...new Set([...GRID_DESIGN_NUMBERS, HERO_DESIGN_NUMBER, LEGENDARY_DESIGN_NUMBER]),
]

/** The Founder Sneaker pictures of the hero pass, as minted and after its first walk. */
export const founderSneakerFileNames = {
  unlaced: 'founder-sneaker-0137-minted.svg',
  laced: 'founder-sneaker-0137-laced.svg',
} as const

export function toPassCardPath(designNumber: number): string {
  return staticFile(`pass-art/cards/${String(designNumber).padStart(4, '0')}.svg`)
}

export function toFounderSneakerPath(fileName: string): string {
  return staticFile(`pass-art/founder-sneakers/${fileName}`)
}
