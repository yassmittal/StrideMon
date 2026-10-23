// Which Sneakers are where (brief §5.4), by Founding Pass design number. Ported from the film's
// `launch-video/src/showroom/sneakers.ts`; the Sneakers niche's numbers are copied by hand from
// `launch-video/src/sneaker-drop/sneakers.ts` (SEQUENCE_DESIGN_NUMBERS), so light and dark alternate.

/** #0137 Rose Hiker Night, on the big lightbox and the counter's screen. */
export const HERO_DESIGN_NUMBER = 137
/** #0020 Earthshine, a Legendary, on the corner poster. */
export const LEGENDARY_DESIGN_NUMBER = 20
/** The "Founding Pass" wall's lightbox: a Legendary between a Gold and a Chrome Rare. */
export const FOUNDING_PASS_WALL_DESIGN_NUMBERS = [49, 542, 29] as const
/** The poster in the window, facing the street. */
export const WINDOW_POSTER_DESIGN_NUMBER = 542
/** The Sneaker on the counter's stand, until Find or a deep link puts another there (Part 3). */
export const STAND_DESIGN_NUMBER = 868

export const SNEAKER_WALL_COLUMN_COUNT = 9
export const SNEAKER_WALL_ROW_COUNT = 5
/** The "Sneakers" niche: the first 45 of the Sneaker drop film's sequence. */
export const SNEAKER_WALL_DESIGN_NUMBERS: readonly number[] = [
  137, 129, 868, 429, 775, 291, 33, 382, 675, 361, 726, 941, 224, 211, 289, 892, 806, 109, 150, 132,
  611, 97, 344, 810, 327, 894, 676, 388, 918, 600, 751, 717, 753, 223, 337, 888, 353, 135, 750, 220,
  592, 590, 184, 574, 862,
]

export const RARE_WALL_COLUMN_COUNT = 4
export const RARE_WALL_ROW_COUNT = 5
/** The "Rare" niche: Gold and Chrome Rares, alternating. */
export const RARE_WALL_DESIGN_NUMBERS: readonly number[] = [
  52, 93, 159, 145, 184, 220, 223, 279, 293, 282, 306, 337, 372, 351, 394, 363, 419, 475, 441, 483,
]

/** Every design the store draws when it opens: the film's 65 (`SHOWROOM_DESIGN_NUMBERS`). */
export const STORE_DESIGN_NUMBERS: readonly number[] = [
  ...new Set([
    HERO_DESIGN_NUMBER,
    LEGENDARY_DESIGN_NUMBER,
    ...FOUNDING_PASS_WALL_DESIGN_NUMBERS,
    STAND_DESIGN_NUMBER,
    ...SNEAKER_WALL_DESIGN_NUMBERS,
    ...RARE_WALL_DESIGN_NUMBERS,
  ]),
]
