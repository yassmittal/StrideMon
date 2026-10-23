import { describe, expect, test } from 'bun:test'
import { storeLightingPresets } from '@/store/store-lighting'
import { ARRIVAL_LIGHTS_ON_SECONDS, readArrivalLighting } from './arrival-lighting'
import { frameSubject, type WalkPose } from './frame-subject'
import { buildWalkPath, doesSegmentCrossBox, isOutside } from './walk-path'
import {
  ARRIVAL,
  DOORWAY,
  EYE_HEIGHT_LIMITS,
  INSIDE_BOUNDS,
  MOVES,
  OBSTACLES,
  WALK_STOP_IDS,
  walkStops,
} from './walk-plan'

// The walk's geometry (D-065): every stop's camera stands somewhere sensible on every screen
// shape, every path between two stops stays in the store and clear of the furniture, and the
// lights come on in order.

const SCREEN_SHAPES = {
  'phone upright': 390 / 844,
  'narrow phone upright': 360 / 800,
  'tablet upright': 768 / 1024,
  'phone on its side': 844 / 390,
  laptop: 1440 / 900,
  'wide screen': 1920 / 1080,
} as const

/** How close a path may come to the furniture itself (the plan's boxes are padded more). */
const FURNITURE_CLEARANCE_METERS = 0.15
const PADDING_IN_PLAN_METERS = 0.3

function isInsideTheStore(position: readonly number[]): boolean {
  const [positionX = 0, , positionZ = 0] = position
  return (
    positionX >= INSIDE_BOUNDS.minX &&
    positionX <= INSIDE_BOUNDS.maxX &&
    positionZ >= INSIDE_BOUNDS.minZ &&
    positionZ <= INSIDE_BOUNDS.maxZ
  )
}

function isInTheDoorway(position: readonly number[]): boolean {
  const [positionX = 0, , positionZ = 0] = position
  return (
    Math.abs(positionX - DOORWAY.x) < 1.0 &&
    positionZ > INSIDE_BOUNDS.maxZ - 1 &&
    positionZ < DOORWAY.outsideZ + 1
  )
}

function readNearFurniture(position: readonly number[]): string | null {
  const [positionX = 0, , positionZ = 0] = position
  const inset = PADDING_IN_PLAN_METERS - FURNITURE_CLEARANCE_METERS
  const hit = OBSTACLES.find((box) =>
    doesSegmentCrossBox(positionX, positionZ, positionX, positionZ, {
      minX: box.minX + inset,
      maxX: box.maxX - inset,
      minZ: box.minZ + inset,
      maxZ: box.maxZ - inset,
    }),
  )
  return hit?.name ?? null
}

describe('the stops', () => {
  for (const [shapeName, aspectRatio] of Object.entries(SCREEN_SHAPES)) {
    for (const stopId of WALK_STOP_IDS) {
      test(`${stopId} on a ${shapeName}`, () => {
        const pose = frameSubject(walkStops[stopId], aspectRatio)
        const [, eyeHeight = 0, positionZ = 0] = pose.position
        expect(eyeHeight).toBeGreaterThanOrEqual(EYE_HEIGHT_LIMITS.min)
        expect(eyeHeight).toBeLessThanOrEqual(EYE_HEIGHT_LIMITS.max)
        if (stopId === 'street') {
          // On the street, in front of the glass, and not lost in the fog (it starts at 14 m).
          expect(positionZ).toBeGreaterThan(DOORWAY.outsideZ)
          expect(positionZ).toBeLessThan(14)
        } else {
          expect(isInsideTheStore(pose.position)).toBe(true)
          expect(readNearFurniture(pose.position)).toBeNull()
        }
      })
    }
  }
})

describe('the paths between stops', () => {
  for (const [shapeName, aspectRatio] of Object.entries(SCREEN_SHAPES)) {
    test(`stay in the store and clear of the furniture on a ${shapeName}`, () => {
      const poses: WalkPose[] = WALK_STOP_IDS.map((stopId) =>
        frameSubject(walkStops[stopId], aspectRatio),
      )
      for (const [fromIndex, from] of poses.entries()) {
        for (const [toIndex, to] of poses.entries()) {
          if (fromIndex === toIndex) continue
          const path = buildWalkPath(from, to)
          const walk = `${WALK_STOP_IDS[fromIndex]} → ${WALK_STOP_IDS[toIndex]}`
          for (const point of path.curve.getSpacedPoints(240)) {
            const position = point.toArray()
            const isAllowed =
              isInsideTheStore(position) || isInTheDoorway(position) || position[2] > 0
            expect({ walk, position, isAllowed }).toEqual({ walk, position, isAllowed: true })
            expect({ walk, position, furniture: readNearFurniture(position) }).toEqual({
              walk,
              position,
              furniture: null,
            })
          }
          const isThroughTheGlass = isOutside(from) !== isOutside(to)
          if (!isThroughTheGlass) {
            expect(path.durationSeconds).toBeGreaterThanOrEqual(MOVES.shortestSeconds)
            expect(path.durationSeconds).toBeLessThanOrEqual(MOVES.longestSeconds)
          }
        }
      }
    })
  }
})

describe('the lights coming on', () => {
  test('start dark and end lit, before "Step inside" shows', () => {
    expect(readArrivalLighting(0)).toEqual(storeLightingPresets.dark)
    expect(readArrivalLighting(ARRIVAL.readySeconds)).toEqual(storeLightingPresets.lit)
    expect(ARRIVAL_LIGHTS_ON_SECONDS).toBeLessThanOrEqual(ARRIVAL.readySeconds)
    expect(ARRIVAL.cameraHoldSeconds + ARRIVAL.cameraMoveSeconds).toBeLessThanOrEqual(
      ARRIVAL.readySeconds,
    )
  })

  test('only ever get brighter, row by row from the glass to the back', () => {
    let previous = readArrivalLighting(0)
    for (
      let elapsedSeconds = 0.05;
      elapsedSeconds <= ARRIVAL.readySeconds;
      elapsedSeconds += 0.05
    ) {
      const levels = readArrivalLighting(elapsedSeconds)
      expect(levels.storeBrightness).toBeGreaterThanOrEqual(previous.storeBrightness)
      expect(levels.ledBrightness).toBeGreaterThanOrEqual(previous.ledBrightness)
      expect(levels.exposure).toBeGreaterThanOrEqual(previous.exposure)
      for (const [rowIndex, row] of levels.downlightRowBrightness.entries()) {
        expect(row).toBeGreaterThanOrEqual(previous.downlightRowBrightness[rowIndex] ?? 0)
        const rowBehind = levels.downlightRowBrightness[rowIndex + 1]
        if (rowBehind !== undefined) expect(row).toBeGreaterThanOrEqual(rowBehind)
      }
      previous = levels
    }
  })
})
