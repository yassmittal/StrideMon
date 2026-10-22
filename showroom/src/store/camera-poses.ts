// The world's coordinates, and the dev panel's colour-check views. The world is in metres: the
// shop front is the plane z = 0, the street is z > 0, the store runs back to z = −10, x from −5
// to 5, and the floor is y = 0. The walk's stops are in `src/visit/walk-plan.ts` (Part 2).

export type Vector3Tuple = readonly [number, number, number]

export type CameraPose = {
  position: Vector3Tuple
  target: Vector3Tuple
  verticalFovDegrees: number
}

export type ColourCheckView = {
  label: string
  pose: CameraPose
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

export const colourCheckViews: Record<ColourCheckViewName, ColourCheckView> = {
  check0137: {
    label: '#0137 face-on',
    pose: {
      verticalFovDegrees: CLOSE_UP_FOV_DEGREES,
      position: [-3.25, 1.6, -4.4],
      target: [-4.93, 1.6, -4.4],
    },
  },
  check0052: {
    label: '#0052 face-on',
    pose: {
      verticalFovDegrees: CLOSE_UP_FOV_DEGREES,
      position: [-4.25, 2.63, -2.3],
      target: [-4.91, 2.63, -2.3],
    },
  },
  checkPassLightbox: {
    label: '#0542 #0029 face-on',
    pose: {
      verticalFovDegrees: CLOSE_UP_FOV_DEGREES,
      position: [1.0, 1.42, -7.35],
      target: [1.0, 1.42, -9.92],
    },
  },
  checkStand: {
    label: 'Stand face-on',
    pose: {
      verticalFovDegrees: CLOSE_UP_FOV_DEGREES,
      position: [3.11, 1.19, -4.15],
      target: [3.8, 1.13, -4.55],
    },
  },
}
