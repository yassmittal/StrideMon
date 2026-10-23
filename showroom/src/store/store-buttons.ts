import type { WalkStopId } from '@/visit/walk-plan'
import type { Vector3Tuple } from './camera-poses'
import { PASS_WALL_CENTER_X } from './sneaker-spots'

// The store's own buttons (D-068): lit things in the store you tap, instead of buttons over the
// canvas. Each is a flat rectangle in the world, like a Sneaker's spot, so a tap's ray finds it the
// same way (visit/store-hits.ts). The blade sign is drawn by the shop front; the rest are drawn by
// `StoreButtons`.

export type StoreButtonAction = 'stepInside' | 'foundingPass' | 'waitlist' | 'find'

export type StoreButtonId =
  | 'doorDecal'
  | 'windowDecal'
  | 'bladeSignLeft'
  | 'bladeSignRight'
  | 'counterPass'
  | 'waitlistKiosk'
  | 'findPlate'

export type StoreButtonSpot = {
  id: StoreButtonId
  action: StoreButtonAction
  /** The stop it's seen from: the hidden list offers it there. */
  stopId: WalkStopId
  center: Vector3Tuple
  /** Which way it faces: 0 is +z (the street), 90 is +x. */
  facingDegrees: number
  width: number
  height: number
  /** Offered in the hidden list (the blade sign's two faces are one button there). */
  isListed: boolean
}

/** The blade sign's box (street.tsx): its two lit faces, either side. */
const BLADE_SIGN = { centerX: 5.55, centerY: 3.0, centerZ: 0.75, faceOffset: 0.085 } as const
/** The black counter's front (back-of-store.tsx) and the white counter's (stand.tsx). */
const BLACK_COUNTER_FRONT_Z = -8.2
const WHITE_COUNTER_FRONT_X = 3.45

export const storeButtonSpots: Record<StoreButtonId, StoreButtonSpot> = {
  // On the glass door, between the mullions at x = −2.5 and 0: the way in.
  doorDecal: {
    id: 'doorDecal',
    action: 'stepInside',
    stopId: 'street',
    center: [-1.25, 1.12, 0.035],
    facingDegrees: 0,
    width: 1.0,
    height: 0.28,
    isListed: true,
  },
  // Low on the window beside it, left of the poster, clear of the lightbox behind the glass.
  windowDecal: {
    id: 'windowDecal',
    action: 'foundingPass',
    stopId: 'street',
    center: [1.15, 0.62, 0.035],
    facingDegrees: 0,
    width: 1.5,
    height: 0.5,
    isListed: true,
  },
  bladeSignLeft: {
    id: 'bladeSignLeft',
    action: 'foundingPass',
    stopId: 'street',
    center: [BLADE_SIGN.centerX - BLADE_SIGN.faceOffset, BLADE_SIGN.centerY, BLADE_SIGN.centerZ],
    facingDegrees: -90,
    width: 1.4,
    height: 0.7,
    isListed: false,
  },
  bladeSignRight: {
    id: 'bladeSignRight',
    action: 'foundingPass',
    stopId: 'street',
    center: [BLADE_SIGN.centerX + BLADE_SIGN.faceOffset, BLADE_SIGN.centerY, BLADE_SIGN.centerZ],
    facingDegrees: 90,
    width: 1.4,
    height: 0.7,
    isListed: false,
  },
  // On the black counter's front, under the Founding Pass lightbox.
  counterPass: {
    id: 'counterPass',
    action: 'foundingPass',
    stopId: 'foundingPassWall',
    center: [PASS_WALL_CENTER_X, 0.76, BLACK_COUNTER_FRONT_Z + 0.006],
    facingDegrees: 0,
    width: 1.3,
    height: 0.36,
    isListed: true,
  },
  // The counter's upright screen, where the film showed #0137.
  waitlistKiosk: {
    id: 'waitlistKiosk',
    action: 'waitlist',
    stopId: 'foundingPassWall',
    center: [PASS_WALL_CENTER_X - 1.6, 1.4, -8.425],
    facingDegrees: 0,
    width: 0.42,
    height: 0.7,
    isListed: true,
  },
  // On the white counter's front, beside the stand that Find fills.
  findPlate: {
    id: 'findPlate',
    action: 'find',
    stopId: 'sneakerWall',
    center: [WHITE_COUNTER_FRONT_X - 0.006, 0.8, -5.35],
    facingDegrees: -90,
    width: 0.78,
    height: 0.2,
    isListed: true,
  },
}

export const STORE_BUTTON_SPOTS: readonly StoreButtonSpot[] = Object.values(storeButtonSpots)
