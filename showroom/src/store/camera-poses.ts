import type { StoreLightingPresetName } from './store-lighting'

// Where the camera stands for each view of the store, from the film's `launch-video/src/showroom/
// camera.ts` (each shot's end pose), made level: the film's roll and whips were for its fast
// edit, not for walking (brief §4). The world is in metres: the shop front is the plane z = 0, the
// street is z > 0, the store runs back to z = −10, x from −5 to 5, and the floor is y = 0.
// Part 2 starts the walk from these.

export type Vector3Tuple = readonly [number, number, number]

export type CameraPose = {
  position: Vector3Tuple
  target: Vector3Tuple
  /** The film's vertical field of view, for its 9:16 frame. */
  portraitVerticalFovDegrees: number
  /** A lens for every screen shape (the dev colour check's close-ups). */
  fixedVerticalFovDegrees?: number
}

export type StoreView = {
  label: string
  pose: CameraPose
  lighting: StoreLightingPresetName
}

/** The film's wide phone lens. */
const WIDE_FOV_DEGREES = 78
/** On a landscape screen the film's lens shows too much ceiling and floor (Part 2 reframes). */
const LANDSCAPE_VERTICAL_FOV_DEGREES = 52

export const STORE_VIEW_NAMES = [
  'streetDark',
  'streetLit',
  'heroLightbox',
  'rareWall',
  'legendaryCorner',
  'foundingPassWall',
  'sneakerWall',
] as const
export type StoreViewName = (typeof STORE_VIEW_NAMES)[number]

export const storeViews: Record<StoreViewName, StoreView> = {
  // The film's `darkFront`: the front in the dark, looking up at the sign.
  streetDark: {
    label: 'Street, dark',
    pose: { position: [-2.0, 1.1, 7.0], target: [-0.5, 3.7, 0], portraitVerticalFovDegrees: 62 },
    lighting: 'dark',
  },
  // The film's `litFront`: the lights on, the whole front square on.
  streetLit: {
    label: 'Street, lit',
    pose: { position: [0.6, 1.5, 7.6], target: [0.4, 2.3, 0], portraitVerticalFovDegrees: 64 },
    lighting: 'lit',
  },
  heroLightbox: {
    label: 'Lightbox #0137',
    pose: {
      position: [-2.6, 0.6, -2.5],
      target: [-5, 2.0, -4.3],
      portraitVerticalFovDegrees: WIDE_FOV_DEGREES,
    },
    lighting: 'lit',
  },
  rareWall: {
    label: 'Rare wall',
    pose: {
      position: [-2.1, 0.8, -3.5],
      target: [-5, 1.95, -1.5],
      portraitVerticalFovDegrees: WIDE_FOV_DEGREES,
    },
    lighting: 'lit',
  },
  legendaryCorner: {
    label: 'Legendary corner',
    pose: {
      position: [-1.8, 1.45, -5.3],
      target: [-3.4, 1.4, -10],
      portraitVerticalFovDegrees: WIDE_FOV_DEGREES,
    },
    lighting: 'lit',
  },
  foundingPassWall: {
    label: 'Founding Pass wall',
    pose: {
      position: [-0.7, 1.2, -5.8],
      target: [0.9, 2.15, -10],
      portraitVerticalFovDegrees: WIDE_FOV_DEGREES,
    },
    lighting: 'lit',
  },
  sneakerWall: {
    label: 'Sneaker wall',
    pose: {
      position: [2.6, 1.3, -3.9],
      target: [4.2, 1.15, -5.1],
      portraitVerticalFovDegrees: WIDE_FOV_DEGREES,
    },
    lighting: 'lit',
  },
}

/** Dev only: face-on and close, for the colour check (Part 1, step 7). */
export const COLOUR_CHECK_VIEW_NAMES = [
  'check0137',
  'check0052',
  'checkPassLightbox',
  'checkStand',
] as const
export type ColourCheckViewName = (typeof COLOUR_CHECK_VIEW_NAMES)[number]

const CLOSE_UP_FOV_DEGREES = 36

export const colourCheckViews: Record<ColourCheckViewName, StoreView> = {
  check0137: {
    label: '#0137 face-on',
    pose: {
      position: [-3.25, 1.6, -4.4],
      target: [-4.93, 1.6, -4.4],
      portraitVerticalFovDegrees: CLOSE_UP_FOV_DEGREES,
      fixedVerticalFovDegrees: CLOSE_UP_FOV_DEGREES,
    },
    lighting: 'lit',
  },
  check0052: {
    label: '#0052 face-on',
    pose: {
      position: [-4.25, 2.63, -2.3],
      target: [-4.91, 2.63, -2.3],
      portraitVerticalFovDegrees: CLOSE_UP_FOV_DEGREES,
      fixedVerticalFovDegrees: CLOSE_UP_FOV_DEGREES,
    },
    lighting: 'lit',
  },
  checkPassLightbox: {
    label: '#0542 #0029 face-on',
    pose: {
      position: [1.0, 1.42, -7.35],
      target: [1.0, 1.42, -9.92],
      portraitVerticalFovDegrees: CLOSE_UP_FOV_DEGREES,
      fixedVerticalFovDegrees: CLOSE_UP_FOV_DEGREES,
    },
    lighting: 'lit',
  },
  checkStand: {
    label: 'Stand face-on',
    pose: {
      position: [3.11, 1.19, -4.15],
      target: [3.8, 1.13, -4.55],
      portraitVerticalFovDegrees: CLOSE_UP_FOV_DEGREES,
      fixedVerticalFovDegrees: CLOSE_UP_FOV_DEGREES,
    },
    lighting: 'lit',
  },
}

export type AnyStoreViewName = StoreViewName | ColourCheckViewName

export function readStoreView(viewName: AnyStoreViewName): StoreView {
  return isStoreViewName(viewName) ? storeViews[viewName] : colourCheckViews[viewName]
}

function isStoreViewName(viewName: AnyStoreViewName): viewName is StoreViewName {
  return STORE_VIEW_NAMES.some((storeViewName) => storeViewName === viewName)
}

export function readVerticalFovDegrees(pose: CameraPose, aspectRatio: number): number {
  if (pose.fixedVerticalFovDegrees !== undefined) return pose.fixedVerticalFovDegrees
  return aspectRatio < 1 ? pose.portraitVerticalFovDegrees : LANDSCAPE_VERTICAL_FOV_DEGREES
}
