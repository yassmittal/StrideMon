import { buildPassPageUrl, foundingPassUrl, waitlistUrl } from '@/content/showroom'
import { visitStore } from '@/lib/visit-store'
import type { StoreButtonAction } from '@/store/store-buttons'
import { type StoreHit, walkController } from './walk-controller'
import { FIRST_INSIDE_STOP_INDEX } from './walk-plan'

// What the store's own buttons do (D-068), for a tap, a click or the hidden list's buttons. The
// links open in the same tab, as the DOM's links did.

export function runStoreAction(action: StoreButtonAction): void {
  if (action === 'stepInside') walkController.goTo(FIRST_INSIDE_STOP_INDEX)
  else if (action === 'foundingPass') window.location.assign(foundingPassUrl)
  else if (action === 'waitlist') window.location.assign(waitlistUrl)
  else openFind()
}

export function openFind(): void {
  if (visitStore.read().arrivalPhase === 'ready') visitStore.update({ isFindOpen: true })
}

/** A design's page on stridemon.xyz: the tag's link. */
export function openPassPage(designNumber: number): void {
  window.location.assign(buildPassPageUrl(designNumber))
}

/**
 * A tap at a point on the screen (−1 to 1 across, and up): a Sneaker looks closer, a button does
 * its thing, the tag opens the design's page, and a tap on nothing goes back from look closer.
 */
export function tapStoreAt(across: number, up: number): void {
  if (visitStore.read().arrivalPhase !== 'ready' || walkController.isMovingNow()) return
  runStoreHit(walkController.findHitAt(across, up))
}

function runStoreHit(hit: StoreHit | null): void {
  if (hit === null) walkController.leaveLookCloser()
  else if (hit.kind === 'sneaker') walkController.lookCloser(hit.target.id)
  else if (hit.kind === 'button') runStoreAction(hit.spot.action)
  else openPassPage(hit.designNumber)
}
