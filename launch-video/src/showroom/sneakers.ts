import { SEQUENCE_DESIGN_NUMBERS } from '../sneaker-drop/sneakers'

// The Sneakers in the showroom, by Founding Pass design number. scripts/copy-showroom-media.sh
// rasterises exactly these into public/showroom/sneakers/ (DESIGNS_FROZEN_ON: never edited).

/** #0137 Rose Hiker Night, the hero of the other films, on the big lightbox (shot 4). */
export const HERO_DESIGN_NUMBER = 137
/** #0020 Earthshine, a Legendary, on the corner poster (shot 5). */
export const LEGENDARY_DESIGN_NUMBER = 20
/** The "Founding Pass" wall's lightbox (shot 6): a Legendary between a Gold and a Chrome Rare. */
export const FOUNDING_PASS_WALL_DESIGN_NUMBERS: readonly number[] = [49, 542, 29]
/** The Sneaker on the counter's stand (shot 7). */
export const STAND_DESIGN_NUMBER = 868

export const SNEAKER_WALL_COLUMN_COUNT = 9
export const SNEAKER_WALL_ROW_COUNT = 5
/** The "Sneakers" wall (shot 7): the Sneaker drop film's sequence, so light and dark alternate. */
export const SNEAKER_WALL_DESIGN_NUMBERS: readonly number[] = SEQUENCE_DESIGN_NUMBERS.slice(
  0,
  SNEAKER_WALL_COLUMN_COUNT * SNEAKER_WALL_ROW_COUNT,
)

export const RARE_WALL_COLUMN_COUNT = 4
export const RARE_WALL_ROW_COUNT = 5
/** The "Rare" wall (shot 8): Gold and Chrome Rares, alternating. */
export const RARE_WALL_DESIGN_NUMBERS: readonly number[] = [
  52, 93, 159, 145, 184, 220, 223, 279, 293, 282, 306, 337, 372, 351, 394, 363, 419, 475, 441, 483,
]

export const SHOWROOM_DESIGN_NUMBERS: readonly number[] = [
  ...new Set([
    HERO_DESIGN_NUMBER,
    LEGENDARY_DESIGN_NUMBER,
    ...FOUNDING_PASS_WALL_DESIGN_NUMBERS,
    STAND_DESIGN_NUMBER,
    ...SNEAKER_WALL_DESIGN_NUMBERS,
    ...RARE_WALL_DESIGN_NUMBERS,
  ]),
]
