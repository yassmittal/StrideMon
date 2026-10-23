import { MathUtils, Vector3 } from 'three'
import type { Vector3Tuple } from '@/store/camera-poses'
import {
  type PrintId,
  type PrintSneaker,
  type PrintSpot,
  printSpots,
  rareWallSpots,
  type ShelfSpot,
  STAND_SPOT,
  sneakerWallSpots,
} from '@/store/sneaker-spots'
import { SNEAKER_ASPECT } from '@/store/textures'
import type { WalkPose } from './frame-subject'
import { readVerticalFovDegrees } from './frame-subject'
import { measureRayHit, readAcross, readNormal } from './store-hits'
import { LOOK_CLOSER, STREET_STOP_INDEX, WALK_STOP_IDS, type WalkStopId } from './walk-plan'

// Every Sneaker you can tap (Part 3, D-066): a shelf's cells, the Sneakers painted into the prints
// and the stand. Each knows where it is, what a tap hits, what the camera
// frames, which stop it belongs to and its neighbours on the same wall. Look closer frames it square
// on, level, together with its shop tag (D-068).

export type LookCloserGroupId = WalkStopId | 'stand'

export type LookCloserTarget = {
  id: string
  kind: 'shelf' | 'print' | 'stand'
  /** The print it's painted into, for the sharp redraw. */
  printId: PrintId | null
  /** Its index in the print's Sneakers, for the sharp redraw. */
  printSneakerIndex: number
  /** A fixed design, or the stand's, which changes. */
  design: number | 'stand'
  groupId: LookCloserGroupId
  /** The stop it belongs to, for the list at a stop. */
  stopIndex: number
  center: Vector3Tuple
  /** Which way it faces: 0 is +z (the street), 90 is +x (the left wall faces it). */
  facingDegrees: number
  /** What a tap hits, along the wall and up, in metres. */
  hitWidth: number
  hitHeight: number
  /** The Sneaker's own size, which the camera frames with its tag. */
  frameWidth: number
  frameHeight: number
  /** Neighbours go row by row (0 is the top), then left to right as seen. */
  row: number
}

const DEGREES_TO_RADIANS = Math.PI / 180
const STAND_FACING_DEGREES = STAND_SPOT.rotationYRadians / DEGREES_TO_RADIANS

function readStopIndex(stopId: WalkStopId): number {
  return WALK_STOP_IDS.indexOf(stopId)
}

export { readAcross, readNormal }

function buildShelfTargets(
  spots: readonly ShelfSpot[],
  groupId: WalkStopId,
): readonly LookCloserTarget[] {
  return spots.map((spot, index) => ({
    id: `${groupId}:${index}`,
    kind: 'shelf',
    printId: null,
    printSneakerIndex: 0,
    design: spot.designNumber,
    groupId,
    stopIndex: readStopIndex(groupId),
    center: spot.position,
    facingDegrees: spot.facingDegrees,
    hitWidth: spot.cellWidth,
    hitHeight: spot.cellHeight,
    frameWidth: spot.width,
    frameHeight: spot.width * SNEAKER_ASPECT,
    row: spot.row,
  }))
}

/** Where a painted Sneaker sits in the world, and its rotated area. */
export function placePrintSneaker(
  spot: PrintSpot,
  sneaker: PrintSneaker,
): { center: Vector3Tuple; width: number; height: number; areaWidth: number; areaHeight: number } {
  const metersPerPixel = spot.width / spot.canvasWidth
  const across = readAcross(spot.facingDegrees)
  const center = new Vector3(...spot.position)
    .addScaledVector(across, (sneaker.centerX - spot.canvasWidth / 2) * metersPerPixel)
    .add(new Vector3(0, (spot.canvasHeight / 2 - sneaker.centerY) * metersPerPixel, 0))
  const width = sneaker.width * metersPerPixel
  const height = width * SNEAKER_ASPECT
  const rotationRadians = Math.abs(sneaker.rotationDegrees * DEGREES_TO_RADIANS)
  return {
    center: [center.x, center.y, center.z],
    width,
    height,
    areaWidth: width * Math.cos(rotationRadians) + height * Math.sin(rotationRadians),
    areaHeight: width * Math.sin(rotationRadians) + height * Math.cos(rotationRadians),
  }
}

function buildPrintTargets(printId: PrintId, groupId: WalkStopId): readonly LookCloserTarget[] {
  const spot = printSpots[printId]
  return spot.sneakers.map((sneaker, index) => {
    const placed = placePrintSneaker(spot, sneaker)
    return {
      id: `${printId}:${index}`,
      kind: 'print',
      printId,
      printSneakerIndex: index,
      design: sneaker.designNumber,
      groupId,
      stopIndex: readStopIndex(groupId),
      center: placed.center,
      facingDegrees: spot.facingDegrees,
      hitWidth: placed.areaWidth,
      hitHeight: placed.areaHeight,
      frameWidth: placed.areaWidth,
      frameHeight: placed.areaHeight,
      row: 0,
    }
  })
}

export const STAND_TARGET_ID = 'stand'

const standTarget: LookCloserTarget = {
  id: STAND_TARGET_ID,
  kind: 'stand',
  printId: null,
  printSneakerIndex: 0,
  design: 'stand',
  groupId: 'stand',
  stopIndex: readStopIndex('sneakerWall'),
  center: STAND_SPOT.position,
  facingDegrees: STAND_FACING_DEGREES,
  hitWidth: STAND_SPOT.targetWidth,
  hitHeight: STAND_SPOT.targetHeight,
  frameWidth: STAND_SPOT.width,
  frameHeight: STAND_SPOT.width * SNEAKER_ASPECT,
  row: 0,
}

export const lookCloserTargets: readonly LookCloserTarget[] = [
  ...buildPrintTargets('windowPoster', 'street'),
  ...buildPrintTargets('heroLightbox', 'lightbox'),
  ...buildShelfTargets(rareWallSpots, 'rareWall'),
  ...buildPrintTargets('legendaryPoster', 'legendaryCorner'),
  ...buildPrintTargets('foundingPassLightbox', 'foundingPassWall'),
  ...buildShelfTargets(sneakerWallSpots, 'sneakerWall'),
  standTarget,
]

const targetsById = new Map(lookCloserTargets.map((target) => [target.id, target]))

export function readLookCloserTarget(targetId: string | null): LookCloserTarget | null {
  return targetId === null ? null : (targetsById.get(targetId) ?? null)
}

/** The design a target shows now. */
export function readTargetDesignNumber(
  target: LookCloserTarget,
  standDesignNumber: number,
): number {
  return target.design === 'stand' ? standDesignNumber : target.design
}

/** A group's targets in neighbour order: row by row, then left to right as seen. */
export function listGroupTargets(groupId: LookCloserGroupId): readonly LookCloserTarget[] {
  return groupOrders.get(groupId) ?? []
}

/** The walls in walk order, the stand last. */
export const lookCloserGroupIds: readonly LookCloserGroupId[] = [
  ...new Set(lookCloserTargets.map((target) => target.groupId)),
]

const groupOrders = new Map<LookCloserGroupId, readonly LookCloserTarget[]>(
  lookCloserGroupIds.map((groupId) => {
    const members = lookCloserTargets.filter((target) => target.groupId === groupId)
    const sorted = [...members].sort((first, second) => {
      if (first.row !== second.row) return first.row - second.row
      const across = readAcross(first.facingDegrees)
      return across.dot(new Vector3(...first.center)) - across.dot(new Vector3(...second.center))
    })
    return [groupId, sorted]
  }),
)

/** The next (1) or previous (−1) target on the same wall, or null at either end. */
export function readNeighbourTarget(
  target: LookCloserTarget,
  direction: 1 | -1,
): LookCloserTarget | null {
  const members = listGroupTargets(target.groupId)
  return members[members.indexOf(target) + direction] ?? null
}

/** The targets a tap can reach: from the street only the window poster (the inside shows through the glass). */
function listReachableTargets(isOutside: boolean): readonly LookCloserTarget[] {
  return lookCloserTargets.filter(
    (target) => (target.stopIndex === STREET_STOP_INDEX) === isOutside,
  )
}

/**
 * The target a ray from the camera hits, and how far: the nearest, and in a print the Sneaker whose
 * centre is closest.
 */
export function findTargetHitOnRay(
  origin: Vector3,
  direction: Vector3,
  isOutside: boolean,
): { target: LookCloserTarget; distance: number } | null {
  let best: { target: LookCloserTarget; distance: number; offCentre: number } | null = null
  for (const target of listReachableTargets(isOutside)) {
    const hit = measureRayHit(origin, direction, {
      center: target.center,
      facingDegrees: target.facingDegrees,
      width: target.hitWidth,
      height: target.hitHeight,
    })
    if (hit === null) continue
    const isNearer =
      best === null ||
      hit.distance < best.distance - LOOK_CLOSER.sameSurfaceMeters ||
      (Math.abs(hit.distance - best.distance) <= LOOK_CLOSER.sameSurfaceMeters &&
        hit.offCentre < best.offCentre)
    if (isNearer) best = { target, ...hit }
  }
  return best === null ? null : { target: best.target, distance: best.distance }
}

export function findTargetOnRay(
  origin: Vector3,
  direction: Vector3,
  isOutside: boolean,
): LookCloserTarget | null {
  return findTargetHitOnRay(origin, direction, isOutside)?.target ?? null
}

/** Look closer's shop tag (D-068): where it hangs, and the rectangle the camera frames with it. */
export type TagPlacement = {
  side: 'below' | 'beside'
  center: Vector3Tuple
  facingDegrees: number
  width: number
  height: number
  /** The Sneaker and its tag together. */
  frameCenter: Vector3Tuple
  frameWidth: number
  frameHeight: number
}

/**
 * Under the Sneaker on a phone held upright (the screen is tall), beside it on a wide screen: to the
 * right as seen, except on the stand, whose own little printed card is on its right. The tag draws
 * over everything (no depth test), so a counter or a ledge in the way never hides it.
 */
export function placeLookCloserTag(target: LookCloserTarget, aspectRatio: number): TagPlacement {
  const { tag } = LOOK_CLOSER
  const side = aspectRatio < 1 ? 'below' : 'beside'
  const size = tag[side]
  const width = MathUtils.clamp(
    target.frameWidth * size.widthShare,
    size.minWidthMeters,
    size.maxWidthMeters,
  )
  const height = width / tag.aspectRatio
  const gap = width * tag.gapShare
  const center = new Vector3(...target.center)
  const across = readAcross(target.facingDegrees).multiplyScalar(target.kind === 'stand' ? -1 : 1)
  const forward = readNormal(target.facingDegrees).multiplyScalar(tag.forwardMeters)
  const tagCenter =
    side === 'below'
      ? center.clone().add(new Vector3(0, -(target.frameHeight / 2 + gap + height / 2), 0))
      : center.clone().addScaledVector(across, target.frameWidth / 2 + gap + width / 2)
  tagCenter.add(forward)
  const frameCenter =
    side === 'below'
      ? center.clone().add(new Vector3(0, -(gap + height) / 2, 0))
      : center.clone().addScaledVector(across, (gap + width) / 2)
  return {
    side,
    center: [tagCenter.x, tagCenter.y, tagCenter.z],
    facingDegrees: target.facingDegrees,
    width,
    height,
    frameCenter: [frameCenter.x, frameCenter.y, frameCenter.z],
    frameWidth:
      side === 'below' ? Math.max(target.frameWidth, width) : target.frameWidth + gap + width,
    frameHeight:
      side === 'below' ? target.frameHeight + gap + height : Math.max(target.frameHeight, height),
  }
}

/**
 * The camera for a target: square on and level, at the distance where the Sneaker and its tag fit
 * the screen above the small controls. The camera moves down to centre them rather than tilting,
 * so the picture stays flat (D-066), but never below the counters' height: there it tilts a
 * little instead.
 */
export function frameLookCloser(target: LookCloserTarget, aspectRatio: number): WalkPose {
  const placement = placeLookCloserTag(target, aspectRatio)
  const verticalFovDegrees = readVerticalFovDegrees(aspectRatio)
  const frame = aspectRatio >= 1 ? LOOK_CLOSER.landscapeFrame : LOOK_CLOSER.portraitFrame
  const halfVerticalTan = Math.tan(MathUtils.degToRad(verticalFovDegrees / 2))
  const halfHorizontalTan = halfVerticalTan * aspectRatio
  const halfWidth = (placement.frameWidth * LOOK_CLOSER.marginShare) / 2
  const halfHeight = (placement.frameHeight * LOOK_CLOSER.marginShare) / 2
  const distanceMeters = Math.max(
    halfWidth / (frame.horizontal * halfHorizontalTan),
    halfHeight / (frame.vertical * halfVerticalTan),
    LOOK_CLOSER.nearestMeters,
  )
  const position = new Vector3(...placement.frameCenter)
    .addScaledVector(readNormal(target.facingDegrees), distanceMeters)
    .add(new Vector3(0, -frame.centerY * halfVerticalTan * distanceMeters, 0))
  // Never down behind a counter: from there the camera tilts a little instead, so the Sneaker
  // and its tag still sit in the frame (a phone held upright stands far back from a wide print).
  const eyeHeight = Math.max(position.y, LOOK_CLOSER.minimumEyeHeightMeters)
  const pitchRadians =
    eyeHeight === position.y
      ? 0
      : Math.atan2(placement.frameCenter[1] - eyeHeight, distanceMeters) -
        Math.atan(frame.centerY * halfVerticalTan)
  return {
    position: [position.x, eyeHeight, position.z],
    yawRadians: target.facingDegrees * DEGREES_TO_RADIANS,
    pitchRadians,
    verticalFovDegrees,
  }
}
