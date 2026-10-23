import { describe, expect, test } from 'bun:test'
import { readVisitCues } from './visit-cues'

const atStopOne = {
  arrivalPhase: 'ready',
  stopIndex: 1,
  lookCloserTargetId: null,
  standDesignNumber: 137,
  isFindOpen: false,
  hoveredHitId: null,
} as const

describe('readVisitCues', () => {
  test('nothing plays during the arrival', () => {
    expect(
      readVisitCues(
        { ...atStopOne, arrivalPhase: 'lightsComingOn' },
        { ...atStopOne, stopIndex: 0 },
      ),
    ).toEqual([])
  })

  test('a step between stops inside is a move, and through the doorway rings the door', () => {
    expect(readVisitCues(atStopOne, { ...atStopOne, stopIndex: 2 })).toEqual(['move'])
    expect(readVisitCues({ ...atStopOne, stopIndex: 0 }, atStopOne)).toEqual(['door'])
    expect(readVisitCues(atStopOne, { ...atStopOne, stopIndex: 0 })).toEqual(['door'])
  })

  test('look closer, its neighbours and going back each have one cue', () => {
    const closer = { ...atStopOne, lookCloserTargetId: 'wall:3' }
    expect(readVisitCues(atStopOne, closer)).toEqual(['lookCloser'])
    expect(readVisitCues(closer, { ...closer, lookCloserTargetId: 'wall:4' })).toEqual([
      'neighbour',
    ])
    expect(readVisitCues(closer, atStopOne)).toEqual(['leaveLookCloser'])
  })

  test('Find put on the stand sets the Sneaker down instead of closing', () => {
    const findOpen = { ...atStopOne, isFindOpen: true }
    expect(readVisitCues(atStopOne, findOpen)).toEqual(['findOpen'])
    expect(readVisitCues(findOpen, atStopOne)).toEqual(['findClose'])
    expect(readVisitCues(findOpen, { ...atStopOne, standDesignNumber: 52 })).toEqual([
      'placeOnStand',
    ])
  })

  test('a hover ticks once when the pointer finds a button, not when it leaves', () => {
    expect(readVisitCues(atStopOne, { ...atStopOne, hoveredHitId: 'kiosk' })).toEqual(['hover'])
    expect(readVisitCues({ ...atStopOne, hoveredHitId: 'kiosk' }, atStopOne)).toEqual([])
  })
})
