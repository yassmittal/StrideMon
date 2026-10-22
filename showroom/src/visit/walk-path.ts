import { CatmullRomCurve3, MathUtils, Vector3 } from 'three'
import type { WalkPose } from './frame-subject'
import { DOORWAY, MOVES, OBSTACLES, OPEN_FLOOR_WAYPOINT } from './walk-plan'

// The path of a move between two poses (D-065): a smooth curve that stays in the store, through
// the open floor when the straight line would cross the furniture, and through the gap in the
// glass when it goes in or out. The view turns the short way round, level all the way.

export type WalkPath = {
  curve: CatmullRomCurve3
  from: WalkPose
  to: WalkPose
  durationSeconds: number
}

export function isOutside(pose: WalkPose): boolean {
  return pose.position[2] > 0
}

export function buildWalkPath(from: WalkPose, to: WalkPose): WalkPath {
  const start = new Vector3(...from.position)
  const end = new Vector3(...to.position)
  const points = [start, ...readWaypoints(from, to), end]
  const curve = new CatmullRomCurve3(points, false, 'centripetal')
  const isThroughTheGlass = isOutside(from) !== isOutside(to)
  return { curve, from, to, durationSeconds: readMoveSeconds(curve.getLength(), isThroughTheGlass) }
}

/**
 * A straight, eased move, for look closer (D-066): its poses stand over the counters at eye
 * height, where the floor plan's way round them would only make a detour.
 */
export function buildDirectPath(from: WalkPose, to: WalkPose): WalkPath {
  const curve = new CatmullRomCurve3(
    [new Vector3(...from.position), new Vector3(...to.position)],
    false,
    'centripetal',
  )
  return { curve, from, to, durationSeconds: readMoveSeconds(curve.getLength(), false) }
}

function readWaypoints(from: WalkPose, to: WalkPose): Vector3[] {
  const startHeight = from.position[1]
  const endHeight = to.position[1]
  if (isOutside(from) && isOutside(to)) return []
  if (isOutside(from) !== isOutside(to)) {
    const outside = new Vector3(DOORWAY.x, DOORWAY.eyeHeight, DOORWAY.outsideZ)
    const inside = new Vector3(DOORWAY.x, DOORWAY.eyeHeight, DOORWAY.insideZ)
    return isOutside(from) ? [outside, inside] : [inside, outside]
  }
  const isBlocked = OBSTACLES.some((obstacle) =>
    doesSegmentCrossBox(
      from.position[0],
      from.position[2],
      to.position[0],
      to.position[2],
      obstacle,
    ),
  )
  if (!isBlocked) return []
  return [new Vector3(OPEN_FLOOR_WAYPOINT.x, (startHeight + endHeight) / 2, OPEN_FLOOR_WAYPOINT.z)]
}

type FloorBox = { minX: number; maxX: number; minZ: number; maxZ: number }

/** Whether the floor-plan segment from (x1, z1) to (x2, z2) crosses the box (slab test). */
export function doesSegmentCrossBox(
  x1: number,
  z1: number,
  x2: number,
  z2: number,
  box: FloorBox,
): boolean {
  let enter = 0
  let leave = 1
  for (const [start, delta, min, max] of [
    [x1, x2 - x1, box.minX, box.maxX],
    [z1, z2 - z1, box.minZ, box.maxZ],
  ] as const) {
    if (Math.abs(delta) < 1e-9) {
      if (start < min || start > max) return false
      continue
    }
    const first = (min - start) / delta
    const second = (max - start) / delta
    enter = Math.max(enter, Math.min(first, second))
    leave = Math.min(leave, Math.max(first, second))
    if (enter > leave) return false
  }
  return true
}

function readMoveSeconds(lengthMeters: number, isThroughTheGlass: boolean): number {
  if (isThroughTheGlass) return MOVES.throughTheGlassSeconds
  const share = MathUtils.clamp(lengthMeters / MOVES.longestPathMeters, 0, 1)
  return MathUtils.lerp(MOVES.shortestSeconds, MOVES.longestSeconds, share)
}

/** Slow out, slow in, never past the end: the camera's weight. */
export function easeWalk(progress: number): number {
  const clamped = MathUtils.clamp(progress, 0, 1)
  return clamped < 0.5 ? 4 * clamped ** 3 : 1 - (-2 * clamped + 2) ** 3 / 2
}

const pathPoint = new Vector3()

/** The pose a share of the way along the path (`progress` already eased). */
export function readPoseOnPath(path: WalkPath, progress: number): WalkPose {
  path.curve.getPointAt(MathUtils.clamp(progress, 0, 1), pathPoint)
  return {
    position: [pathPoint.x, pathPoint.y, pathPoint.z],
    yawRadians: mixAngle(path.from.yawRadians, path.to.yawRadians, progress),
    pitchRadians: MathUtils.lerp(path.from.pitchRadians, path.to.pitchRadians, progress),
    verticalFovDegrees: MathUtils.lerp(
      path.from.verticalFovDegrees,
      path.to.verticalFovDegrees,
      progress,
    ),
  }
}

/** Turns from one heading to another the short way round. */
export function mixAngle(fromRadians: number, toRadians: number, progress: number): number {
  const turn = MathUtils.euclideanModulo(toRadians - fromRadians + Math.PI, Math.PI * 2) - Math.PI
  return fromRadians + turn * progress
}
