import type { VisitState } from '@/lib/visit-store'
import { STREET_STOP_INDEX } from '@/visit/walk-plan'

// Which soft cues a change of the visit plays (D-070). Read from the visit store's changes, not
// from the input, so a tap, a key, a button and Find all sound the same.

export type SoundCueName =
  | 'press'
  | 'hover'
  | 'move'
  | 'door'
  | 'lookCloser'
  | 'neighbour'
  | 'leaveLookCloser'
  | 'placeOnStand'
  | 'findOpen'
  | 'findClose'

type VisitCueFields = Pick<
  VisitState,
  | 'arrivalPhase'
  | 'stopIndex'
  | 'lookCloserTargetId'
  | 'standDesignNumber'
  | 'isFindOpen'
  | 'hoveredHitId'
>

/** The cues for one change of the visit store, in the order they play. None during the arrival. */
export function readVisitCues(previous: VisitCueFields, next: VisitCueFields): SoundCueName[] {
  if (previous.arrivalPhase !== 'ready' || next.arrivalPhase !== 'ready') return []
  const cues: SoundCueName[] = []

  const wasCloser = previous.lookCloserTargetId !== null
  const isCloser = next.lookCloserTargetId !== null
  if (!wasCloser && isCloser) cues.push('lookCloser')
  else if (wasCloser && isCloser && previous.lookCloserTargetId !== next.lookCloserTargetId)
    cues.push('neighbour')
  else if (wasCloser && !isCloser) cues.push('leaveLookCloser')

  // Looking closer keeps its own cue; the stop under it changing isn't a walk.
  if (previous.stopIndex !== next.stopIndex && !isCloser) {
    const isThroughTheDoor =
      (previous.stopIndex === STREET_STOP_INDEX) !== (next.stopIndex === STREET_STOP_INDEX)
    cues.push(isThroughTheDoor ? 'door' : 'move')
  }

  const isPlacedOnStand = previous.standDesignNumber !== next.standDesignNumber
  if (isPlacedOnStand) cues.push('placeOnStand')
  if (!previous.isFindOpen && next.isFindOpen) cues.push('findOpen')
  else if (previous.isFindOpen && !next.isFindOpen && !isPlacedOnStand) cues.push('findClose')

  if (next.hoveredHitId !== null && previous.hoveredHitId !== next.hoveredHitId) cues.push('hover')
  return cues
}
