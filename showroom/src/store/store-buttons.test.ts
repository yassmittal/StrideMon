import { describe, expect, test } from 'bun:test'
import { PerspectiveCamera, Vector3 } from 'three'
import { frameSubject, placeCamera } from '@/visit/frame-subject'
import { findTargetHitOnRay } from '@/visit/look-closer-targets'
import { measureRayHit, readAcross } from '@/visit/store-hits'
import { isOutside } from '@/visit/walk-path'
import { walkStops } from '@/visit/walk-plan'
import { STORE_BUTTON_SPOTS } from './store-buttons'

// The store's own buttons (D-068): each shows whole on screen from its stop, on every screen shape,
// and a tap on its centre hits it, not a Sneaker. (The blade sign is the street's edge on a phone
// held upright: it's a second way to the Founding Pass, after the window's decal.)

const SCREEN_SHAPES = {
  'phone upright': 390 / 844,
  'narrow phone upright': 360 / 800,
  'phone on its side': 844 / 390,
  laptop: 1440 / 900,
} as const

describe('the store buttons', () => {
  for (const [shapeName, aspectRatio] of Object.entries(SCREEN_SHAPES)) {
    test(`show from their stop, and a tap hits them, on a ${shapeName}`, () => {
      const camera = new PerspectiveCamera(50, aspectRatio, 0.05, 120)
      for (const spot of STORE_BUTTON_SPOTS) {
        if (!spot.isListed) continue
        const pose = frameSubject(walkStops[spot.stopId], aspectRatio)
        placeCamera(camera, pose)
        camera.aspect = aspectRatio
        camera.updateProjectionMatrix()
        camera.updateMatrixWorld()
        const across = readAcross(spot.facingDegrees)
        for (const side of [-1, 1]) {
          for (const upDown of [-1, 1]) {
            const corner = new Vector3(...spot.center)
              .addScaledVector(across, (side * spot.width) / 2)
              .add(new Vector3(0, (upDown * spot.height) / 2, 0))
              .project(camera)
            expect({
              id: spot.id,
              shapeName,
              isOnScreen: Math.abs(corner.x) <= 1 && Math.abs(corner.y) <= 1,
            }).toEqual({
              id: spot.id,
              shapeName,
              isOnScreen: true,
            })
          }
        }
        const origin = new Vector3().setFromMatrixPosition(camera.matrixWorld)
        const direction = new Vector3(...spot.center).sub(origin).normalize()
        const hit = measureRayHit(origin, direction, spot)
        expect({ id: spot.id, isHit: hit !== null }).toEqual({ id: spot.id, isHit: true })
        const sneaker = findTargetHitOnRay(origin, direction, isOutside(pose))
        if (sneaker !== null && hit !== null) expect(hit.distance).toBeLessThan(sneaker.distance)
      }
    })
  }
})
