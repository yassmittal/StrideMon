import type { ColourCheckViewName } from '@/store/camera-poses'
import { HERO_DESIGN_NUMBER, STAND_DESIGN_NUMBER } from '@/store/sneaker-placements'
import { createSmallStore } from './create-small-store'
import type { RenderTier } from './render-tier'

// The visit: the tier, where the walk is, look closer, Find, the stand's Sneaker and the counter's
// screen.

/** The street before the lights are on, while they come on, and once "Step inside" shows. */
export type ArrivalPhase = 'waiting' | 'lightsComingOn' | 'ready'

/** What the counter's upright screen shows (brief §10, #2). */
export type CounterScreenDesign = { designNumber: number; founderNumber: number | null }

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
  /** The Sneaker on the counter's stand: Find and the deep link change it. */
  standDesignNumber: number
  /** The look-closer target the camera is at or walking to (look-closer-targets.ts), or null. */
  lookCloserTargetId: string | null
  isFindOpen: boolean
  counterScreen: CounterScreenDesign
  /** A calm line for the walk bar: a deep link to a Sneaker that doesn't exist. */
  notice: string | null
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
  lookCloserTargetId: null,
  isFindOpen: false,
  counterScreen: { designNumber: HERO_DESIGN_NUMBER, founderNumber: null },
  notice: null,
})
