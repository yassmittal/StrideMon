import { Vector3 } from 'three'
import type { Vector3Tuple } from '@/store/camera-poses'

// Where a tap's ray meets a flat rectangle in the store: a Sneaker, one of the store's buttons or
// look closer's tag. A rectangle facing away is never hit.

const DEGREES_TO_RADIANS = Math.PI / 180

export type HitPlane = {
  center: Vector3Tuple
  /** Which way it faces: 0 is +z (the street), 90 is +x (the left wall faces it). */
  facingDegrees: number
  /** Along it, and up, in metres. */
  width: number
  height: number
}

export type RayHit = { distance: number; offCentre: number }

/** Along a wall that faces `facingDegrees`, left to right as seen (the walk's convention). */
export function readAcross(facingDegrees: number): Vector3 {
  const facingRadians = facingDegrees * DEGREES_TO_RADIANS
  return new Vector3(Math.cos(facingRadians), 0, -Math.sin(facingRadians))
}

export function readNormal(facingDegrees: number): Vector3 {
  const facingRadians = facingDegrees * DEGREES_TO_RADIANS
  return new Vector3(Math.sin(facingRadians), 0, Math.cos(facingRadians))
}

/** How far along the ray it hits the rectangle, and how far from its centre; null for a miss. */
export function measureRayHit(origin: Vector3, direction: Vector3, plane: HitPlane): RayHit | null {
  const normal = readNormal(plane.facingDegrees)
  const facing = direction.dot(normal)
  if (facing >= -1e-6) return null
  const center = new Vector3(...plane.center)
  const distance = center.clone().sub(origin).dot(normal) / facing
  if (distance <= 0) return null
  const hitPoint = origin.clone().addScaledVector(direction, distance).sub(center)
  const acrossMeters = hitPoint.dot(readAcross(plane.facingDegrees))
  const upMeters = hitPoint.y
  if (Math.abs(acrossMeters) > plane.width / 2 || Math.abs(upMeters) > plane.height / 2) {
    return null
  }
  return { distance, offCentre: Math.hypot(acrossMeters, upMeters) }
}
