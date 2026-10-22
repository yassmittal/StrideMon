import { describe, expect, test } from 'bun:test'
import { PerspectiveCamera, Vector3 } from 'three'
import { STORE_DESIGN_NUMBERS } from '@/store/sneaker-placements'
import { placeCamera } from './frame-subject'
import {
  findTargetOnRay,
  frameLookCloser,
  listGroupTargets,
  lookCloserTargets,
  readAcross,
  readNeighbourTarget,
  readNormal,
} from './look-closer-targets'
import { isOutside } from './walk-path'
import { LOOK_CLOSER } from './walk-plan'

// Look closer's geometry (D-066): every Sneaker the store shows is a target, its view stands square
// on in front of it, it sits clear of the card on every screen shape, a tap where it shows hits it,
// and its neighbours go left to right as seen.

const SCREEN_SHAPES = {
  'phone upright': 390 / 844,
  'narrow phone upright': 360 / 800,
  'phone on its side': 844 / 390,
  laptop: 1440 / 900,
} as const

/** The counters, the table and the chairs as boxes in the world (back-of-store.tsx, stand.tsx). */
const FURNITURE = [
  { name: 'black counter', min: [-1.3, 0, -8.92], max: [2.2, 1.03, -8.18] },
  { name: 'white counter', min: [3.45, 0, -6.9], max: [4.35, 0.97, -3.9] },
  { name: 'table', min: [-3.55, 0, -8.63], max: [-2.45, 0.76, -7.97] },
  { name: 'chairs', min: [-4.15, 0, -8.4], max: [-1.8, 1.03, -7.3] },
] as const

function readFrameCorners(target: (typeof lookCloserTargets)[number]): Vector3[] {
  const across = readAcross(target.facingDegrees)
  return [-1, 1].flatMap((side) =>
    [-1, 1].map((upDown) =>
      new Vector3(...target.center)
        .addScaledVector(across, (side * target.frameWidth) / 2)
        .add(new Vector3(0, (upDown * target.frameHeight) / 2, 0)),
    ),
  )
}

/** The furniture the segment from `from` to `to` passes through (a slab test), or null. */
function findFurnitureBetween(from: Vector3, to: Vector3): string | null {
  const delta = to.clone().sub(from)
  for (const box of FURNITURE) {
    let enter = 0
    let leave = 1
    let isMissed = false
    for (const axis of [0, 1, 2] as const) {
      const start = from.getComponent(axis)
      const step = delta.getComponent(axis)
      const [min, max] = [box.min[axis], box.max[axis]]
      if (Math.abs(step) < 1e-9) {
        if (start < min || start > max) isMissed = true
        continue
      }
      const first = (min - start) / step
      const second = (max - start) / step
      enter = Math.max(enter, Math.min(first, second))
      leave = Math.min(leave, Math.max(first, second))
    }
    if (!isMissed && enter <= leave) return box.name
  }
  return null
}

function readFrame(aspectRatio: number) {
  return aspectRatio >= 1 ? LOOK_CLOSER.landscapeFrame : LOOK_CLOSER.portraitFrame
}

test('every Sneaker the store shows can be looked at, and only those', () => {
  const fixedDesigns = new Set(
    lookCloserTargets.flatMap((target) =>
      typeof target.design === 'number' ? [target.design] : [],
    ),
  )
  for (const designNumber of STORE_DESIGN_NUMBERS) {
    // The stand's #0868 is the stand target; the rest are fixed on a wall.
    if (designNumber !== 868) expect(fixedDesigns.has(designNumber)).toBe(true)
  }
  expect(lookCloserTargets.filter((target) => target.design === 'stand')).toHaveLength(1)
  expect(new Set(lookCloserTargets.map((target) => target.id)).size).toBe(lookCloserTargets.length)
})

describe('the look-closer view', () => {
  for (const [shapeName, aspectRatio] of Object.entries(SCREEN_SHAPES)) {
    test(`stands square on, clear of the card, and a tap there hits it, on a ${shapeName}`, () => {
      const camera = new PerspectiveCamera(50, aspectRatio, 0.05, 120)
      const frame = readFrame(aspectRatio)
      for (const target of lookCloserTargets) {
        const pose = frameLookCloser(target, aspectRatio)
        placeCamera(camera, pose)
        const center = new Vector3(...target.center)
        const position = new Vector3(...pose.position)
        // In front of it, at least the nearest distance, on the same side of the glass.
        const distance = position.clone().sub(center).dot(readNormal(target.facingDegrees))
        expect({
          id: target.id,
          isNearEnough: distance >= LOOK_CLOSER.nearestMeters - 1e-9,
        }).toEqual({ id: target.id, isNearEnough: true })
        expect(pose.position[1]).toBeGreaterThanOrEqual(LOOK_CLOSER.minimumEyeHeightMeters)
        expect({ id: target.id, outside: isOutside(pose) }).toEqual({
          id: target.id,
          outside: target.groupId === 'street',
        })
        // Nothing stands between the camera and any corner of it.
        for (const corner of readFrameCorners(target)) {
          expect({
            id: target.id,
            shapeName,
            blockedBy: findFurnitureBetween(position, corner),
          }).toEqual({ id: target.id, shapeName, blockedBy: null })
        }
        // Its corners sit inside the space above the card.
        const across = readAcross(target.facingDegrees)
        for (const side of [-1, 1]) {
          for (const upDown of [-1, 1]) {
            const corner = center
              .clone()
              .addScaledVector(across, (side * target.frameWidth) / 2)
              .add(new Vector3(0, (upDown * target.frameHeight) / 2, 0))
              .project(camera)
            expect(Math.abs(corner.x)).toBeLessThanOrEqual(frame.horizontal + 1e-6)
            expect(Math.abs(corner.y - frame.centerY)).toBeLessThanOrEqual(frame.vertical + 1e-6)
          }
        }
        // A tap where its centre shows hits it (a print's neighbours overlap: the closest centre wins).
        const projectedCenter = center.clone().project(camera)
        const origin = new Vector3().setFromMatrixPosition(camera.matrixWorld)
        const direction = new Vector3(projectedCenter.x, projectedCenter.y, 0.5)
          .unproject(camera)
          .sub(origin)
          .normalize()
        expect(findTargetOnRay(origin, direction, isOutside(pose))?.id).toBe(target.id)
      }
    })
  }
})

test('a tap on the empty floor hits nothing, and from the street only the window poster', () => {
  const origin = new Vector3(0, 1.5, -5)
  expect(findTargetOnRay(origin, new Vector3(0, -1, 0), false)).toBeNull()
  expect(findTargetOnRay(origin, new Vector3(0, 1, 0), false)).toBeNull()
  // From the street, looking straight at the #0137 lightbox through the glass.
  const fromStreet = new Vector3(-3, 1.5, 4)
  const toLightbox = new Vector3(-4.9, 1.53, -4.4).sub(fromStreet).normalize()
  expect(findTargetOnRay(fromStreet, toLightbox, true)).toBeNull()
})

test('neighbours go row by row, left to right as seen', () => {
  const sneakerWall = listGroupTargets('sneakerWall')
  expect(sneakerWall).toHaveLength(45)
  for (let index = 1; index < sneakerWall.length; index += 1) {
    const previous = sneakerWall[index - 1]
    const current = sneakerWall[index]
    if (previous === undefined || current === undefined) throw new Error('missing target')
    if (previous.row === current.row) {
      const across = readAcross(current.facingDegrees)
      expect(across.dot(new Vector3(...current.center))).toBeGreaterThan(
        across.dot(new Vector3(...previous.center)),
      )
    } else {
      expect(current.row).toBe(previous.row + 1)
    }
  }
  const passWall = listGroupTargets('foundingPassWall').map((target) => target.design)
  expect(passWall).toEqual(['counterScreen', 49, 542, 29])
  const first = sneakerWall[0]
  if (first === undefined) throw new Error('missing target')
  expect(readNeighbourTarget(first, -1)).toBeNull()
  expect(readNeighbourTarget(first, 1)).toBe(sneakerWall[1] ?? null)
})
