import { placeShape } from './geometry'
import type { HeelTabPlacement, Shape } from './types'

/**
 * StrideMon's own heel mark: a lime pull tab with an ink chevron, drawn upright around its
 * base centre. The part below the base hides behind the collar. It sticks out against the card's
 * background, so it shows in every family, the lime one included.
 */
const HEEL_TAB_SHAPE: Shape = [
  [-24, 40],
  [-24, -38],
  [-14, -50],
  [14, -50],
  [24, -38],
  [24, 40],
]

const HEEL_TAB_MARK_SHAPE: Shape = [
  [-13, -14],
  [0, -29],
  [13, -14],
  [13, -4],
  [0, -19],
  [-13, -4],
]

export function placeHeelTab({ anchor, tiltDegrees }: HeelTabPlacement): {
  tabShape: Shape
  markShape: Shape
} {
  return {
    tabShape: placeShape({ shape: HEEL_TAB_SHAPE, anchor, tiltDegrees }),
    markShape: placeShape({ shape: HEEL_TAB_MARK_SHAPE, anchor, tiltDegrees }),
  }
}
