import { Euler, MathUtils, PerspectiveCamera, Vector3 } from 'three'
import type { Vector3Tuple } from '@/store/camera-poses'
import { LENS, SAFE_FRAME, type WalkStop } from './walk-plan'

// Where the camera stands for a stop, on a screen of a given shape (D-065): it looks at the
// subject's centre from the stop's angle, and the distance is solved so the whole rectangle fits
// the safe frame. Level, always: yaw and pitch, never roll.

export type WalkPose = {
  position: Vector3Tuple
  /** Turning left is positive (three's rotation about y); 0 looks along −z, into the store. */
  yawRadians: number
  /** Looking up is positive. */
  pitchRadians: number
  verticalFovDegrees: number
}

const DISTANCE_SEARCH = { nearestMeters: 0.5, furthestMeters: 30, steps: 32 } as const

/** The lens for a screen shape: wider when the screen is upright, so a wall still fits across. */
export function readVerticalFovDegrees(aspectRatio: number): number {
  if (aspectRatio >= 1) return LENS.landscapeVerticalFovDegrees
  const halfAcross = MathUtils.degToRad(LENS.portraitHorizontalFovDegrees / 2)
  const verticalFovDegrees = MathUtils.radToDeg(2 * Math.atan(Math.tan(halfAcross) / aspectRatio))
  return MathUtils.clamp(verticalFovDegrees, LENS.minVerticalFovDegrees, LENS.maxVerticalFovDegrees)
}

export function readSafeFrame(aspectRatio: number): { horizontal: number; vertical: number } {
  return aspectRatio >= 1 ? SAFE_FRAME.landscape : SAFE_FRAME.portrait
}

/** The camera's pose for a stop on a screen of this shape. */
export function frameSubject(stop: WalkStop, aspectRatio: number): WalkPose {
  const verticalFovDegrees = readVerticalFovDegrees(aspectRatio)
  const headingRadians = MathUtils.degToRad(stop.facingDegrees + stop.sideDegrees)
  const pitchRadians = MathUtils.degToRad(stop.pitchDegrees)
  const corners = readSubjectCorners(stop)
  const safeFrame = readSafeFrame(aspectRatio)
  const camera = new PerspectiveCamera(verticalFovDegrees, aspectRatio, 0.05, 120)

  const poseAt = (distanceMeters: number): WalkPose => ({
    position: readCameraPosition(stop.center, headingRadians, pitchRadians, distanceMeters),
    yawRadians: headingRadians,
    pitchRadians,
    verticalFovDegrees,
  })
  const fitsAt = (distanceMeters: number): boolean => {
    placeCamera(camera, poseAt(distanceMeters))
    return corners.every((corner) => {
      const projected = corner.clone().project(camera)
      return (
        projected.z < 1 &&
        Math.abs(projected.x) <= safeFrame.horizontal &&
        Math.abs(projected.y) <= safeFrame.vertical
      )
    })
  }

  // The fit only gets easier further back, so a binary search finds the nearest distance.
  let nearMeters: number = DISTANCE_SEARCH.nearestMeters
  let farMeters: number = DISTANCE_SEARCH.furthestMeters
  for (let step = 0; step < DISTANCE_SEARCH.steps; step += 1) {
    const middleMeters = (nearMeters + farMeters) / 2
    if (fitsAt(middleMeters)) farMeters = middleMeters
    else nearMeters = middleMeters
  }
  return poseAt(farMeters)
}

/** The rectangle's four corners in the world. */
export function readSubjectCorners(stop: WalkStop): Vector3[] {
  const facingRadians = MathUtils.degToRad(stop.facingDegrees)
  // Along the rectangle: the facing direction turned a quarter to the right.
  const across = new Vector3(Math.cos(facingRadians), 0, -Math.sin(facingRadians))
  const center = new Vector3(...stop.center)
  return [-1, 1].flatMap((side) =>
    [-1, 1].map((upDown) =>
      center
        .clone()
        .addScaledVector(across, (side * stop.width) / 2)
        .add(new Vector3(0, (upDown * stop.height) / 2, 0)),
    ),
  )
}

function readCameraPosition(
  center: Vector3Tuple,
  headingRadians: number,
  pitchRadians: number,
  distanceMeters: number,
): Vector3Tuple {
  const level = Math.cos(pitchRadians) * distanceMeters
  return [
    center[0] + Math.sin(headingRadians) * level,
    center[1] - Math.sin(pitchRadians) * distanceMeters,
    center[2] + Math.cos(headingRadians) * level,
  ]
}

const poseRotation = new Euler(0, 0, 0, 'YXZ')

/** Puts a camera on a pose: yaw, then pitch, no roll. */
export function placeCamera(camera: PerspectiveCamera, pose: WalkPose): void {
  camera.position.set(...pose.position)
  poseRotation.set(pose.pitchRadians, pose.yawRadians, 0, 'YXZ')
  camera.quaternion.setFromEuler(poseRotation)
  if (camera.fov !== pose.verticalFovDegrees) {
    camera.fov = pose.verticalFovDegrees
    camera.updateProjectionMatrix()
  }
  camera.updateMatrixWorld(true)
}

/** A pose from a position and a point to look at (the film's poses). */
export function poseLookingAt(
  position: Vector3Tuple,
  target: Vector3Tuple,
  verticalFovDegrees: number,
): WalkPose {
  const direction = new Vector3(...target).sub(new Vector3(...position)).normalize()
  return {
    position,
    yawRadians: Math.atan2(-direction.x, -direction.z),
    pitchRadians: Math.asin(MathUtils.clamp(direction.y, -1, 1)),
    verticalFovDegrees,
  }
}
