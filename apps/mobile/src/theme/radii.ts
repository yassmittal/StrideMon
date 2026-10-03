/** design-system.md §5. Circles are `width = height` with `pill`. */
export const radii = {
  tiny: 3,
  small: 6,
  medium: 10,
  media: 15,
  input: 18,
  card: 20,
  pill: 999,
} as const

/** Apple and Google both ask for touch targets of at least 44 points. */
export const MINIMUM_TOUCH_TARGET_SIZE = 44
