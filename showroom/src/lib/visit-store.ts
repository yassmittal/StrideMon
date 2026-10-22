import type { AnyStoreViewName } from '@/store/camera-poses'
import { STAND_DESIGN_NUMBER } from '@/store/sneaker-placements'
import { createSmallStore } from './create-small-store'
import type { RenderTier } from './render-tier'

// The visit: the tier, the stand's Sneaker and, for now, which view the camera holds. Parts 2
// and 3 add the stop and look closer here.

export type VisitState = {
  /** Null until the canvas picks the starting tier on the device. */
  tier: RenderTier | null
  /** A tier picked in the dev panel; the performance monitor leaves it alone. */
  isTierChosenByHand: boolean
  /** Dev only for now: the view the camera holds (Part 2 replaces it with the walk). */
  viewName: AnyStoreViewName
  /** The Sneaker on the counter's stand (Find and deep links change it in Part 3). */
  standDesignNumber: number
}

export const visitStore = createSmallStore<VisitState>({
  tier: null,
  isTierChosenByHand: false,
  viewName: 'streetLit',
  standDesignNumber: STAND_DESIGN_NUMBER,
})
