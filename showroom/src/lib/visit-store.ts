import type { ColourCheckViewName } from '@/store/camera-poses'
import { STAND_DESIGN_NUMBER } from '@/store/sneaker-placements'
import { createSmallStore } from './create-small-store'
import type { RenderTier } from './render-tier'

// The visit: the tier, where the walk is, and the stand's Sneaker. Part 3 adds look closer here.

/** The street before the lights are on, while they come on, and once "Step inside" shows. */
export type ArrivalPhase = 'waiting' | 'lightsComingOn' | 'ready'

export type VisitState = {
  /** Null until the canvas picks the starting tier on the device. */
  tier: RenderTier | null
  /** A tier picked in the dev panel; the performance monitor leaves it alone. */
  isTierChosenByHand: boolean
  arrivalPhase: ArrivalPhase
  /** The stop the camera is at, or walking to (0 is the street, 1 to 5 inside). */
  stopIndex: number
  isMoving: boolean
  /** How many steps the visitor has taken, for the hint. */
  walkStepCount: number
  /** Dev only: a colour check's face-on view holds the camera instead of the walk. */
  colourCheckViewName: ColourCheckViewName | null
  /** The Sneaker on the counter's stand (Find and deep links change it in Part 3). */
  standDesignNumber: number
}

export const visitStore = createSmallStore<VisitState>({
  tier: null,
  isTierChosenByHand: false,
  arrivalPhase: 'waiting',
  stopIndex: 0,
  isMoving: false,
  walkStepCount: 0,
  colourCheckViewName: null,
  standDesignNumber: STAND_DESIGN_NUMBER,
})
