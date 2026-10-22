import type { Vector3Tuple } from '@/store/camera-poses'

// Every number of the walk (brief §4, Part 2, D-065): the stops, how they're framed, the paths
// between them, the arrival's lights, the look-around and the input. The world is in metres: the
// shop front is the plane z = 0, the street is z > 0, the store runs back to z = −10, x from −5
// to 5, and the floor is y = 0 (camera-poses.ts).

export const WALK_STOP_IDS = [
  'street',
  'lightbox',
  'rareWall',
  'legendaryCorner',
  'foundingPassWall',
  'sneakerWall',
] as const
export type WalkStopId = (typeof WALK_STOP_IDS)[number]

/** The street is stop 0; the five stops inside are 1 to 5. */
export const STREET_STOP_INDEX = 0
export const FIRST_INSIDE_STOP_INDEX = 1
export const LAST_STOP_INDEX = WALK_STOP_IDS.length - 1
export const INSIDE_STOP_COUNT = LAST_STOP_INDEX

/**
 * What a stop shows: a rectangle in the world, and the angle it's seen from. The camera stands
 * where the whole rectangle fits the screen's safe frame (frame-subject.ts).
 */
export type WalkStop = {
  /** The rectangle's centre. */
  center: Vector3Tuple
  /** Along the wall, and up, in metres. */
  width: number
  height: number
  /** Which way the rectangle faces: 0 is +z (the street), 90 is +x (the left wall faces it). */
  facingDegrees: number
  /** How far round from face-on the camera stands, turning the same way as `facingDegrees`. */
  sideDegrees: number
  /** How far the camera looks up at the subject (down when negative). */
  pitchDegrees: number
}

export const walkStops: Record<WalkStopId, WalkStop> = {
  // The whole front: the fascia, the glass and the blade sign, nearly square on.
  street: {
    center: [0.35, 2.2, 0.2],
    width: 7.2,
    height: 4.5,
    facingDegrees: 0,
    sideDegrees: 3,
    pitchDegrees: 6,
  },
  // 1. The #0137 lightbox on the left wall, from the front of the store, a little low.
  lightbox: {
    center: [-4.94, 1.75, -4.4],
    width: 1.5,
    height: 2.4,
    facingDegrees: 90,
    sideDegrees: -32,
    pitchDegrees: 9,
  },
  // 2. The Rare niche and its label, from further in.
  rareWall: {
    center: [-4.95, 2.05, -1.55],
    width: 2.35,
    height: 2.3,
    facingDegrees: 90,
    sideDegrees: 30,
    pitchDegrees: 10,
  },
  // 3. The Legendary poster over the table and chairs, from the right.
  legendaryCorner: {
    center: [-3.15, 1.5, -9.95],
    width: 2.8,
    height: 2.7,
    facingDegrees: 0,
    sideDegrees: 18,
    pitchDegrees: 2,
  },
  // 4. The lit words, the lightbox, the screen and the amber strip over the counter.
  foundingPassWall: {
    center: [0.55, 1.82, -9.96],
    width: 3.6,
    height: 2.45,
    facingDegrees: 0,
    sideDegrees: -12,
    pitchDegrees: 5,
  },
  // 5. The Sneakers niche and the counter with the stand under it, from the front.
  sneakerWall: {
    center: [4.95, 1.95, -6.0],
    width: 4.8,
    height: 2.3,
    facingDegrees: -90,
    sideDegrees: 35,
    pitchDegrees: 4,
  },
}

/** The lens: the film's wide one on a phone held upright, a calmer one on a wide screen. */
export const LENS = {
  landscapeVerticalFovDegrees: 50,
  /** On a portrait screen, aim for this much across, within the limits below. */
  portraitHorizontalFovDegrees: 44,
  minVerticalFovDegrees: 50,
  maxVerticalFovDegrees: 76,
} as const

/**
 * Where the subject must sit, as a share of the screen from its centre (1 is the edge), clear of
 * the header and the walk bar.
 */
export const SAFE_FRAME = {
  portrait: { horizontal: 0.86, vertical: 0.62 },
  landscape: { horizontal: 0.8, vertical: 0.7 },
} as const

/** The camera's eye height is kept between these, in metres. */
export const EYE_HEIGHT_LIMITS = { min: 0.55, max: 2.4 } as const

/** Where a camera (and every path) may go inside: the room, less a margin from the walls. */
export const INSIDE_BOUNDS = { minX: -4.55, maxX: 4.55, minZ: -9.55, maxZ: -0.35 } as const

/**
 * The furniture a path walks round, as boxes on the floor plan (x and z), already padded: the
 * table and its chairs, the Founding Pass counter, the white counter under the Sneakers niche.
 */
export const OBSTACLES = [
  { name: 'table and chairs', minX: -4.55, maxX: -1.45, minZ: -8.95, maxZ: -6.95 },
  { name: 'Founding Pass counter', minX: -1.6, maxX: 2.55, minZ: -9.3, maxZ: -7.85 },
  { name: 'white counter', minX: 3.1, maxX: 4.7, minZ: -7.25, maxZ: -3.55 },
] as const

/** The open floor in the middle of the store, where a path goes round the furniture. */
export const OPEN_FLOOR_WAYPOINT = { x: 0.3, z: -4.8 } as const

/** The way through the glass: the gap between the mullions at x = −2.5 and 0. */
export const DOORWAY = { x: -1.25, outsideZ: 1.6, insideZ: -1.3, eyeHeight: 1.45 } as const

/** The arrival's first view: the film's `darkFront`, low, looking up at the sign. */
export const ARRIVAL_DARK_POSE = {
  position: [-2.0, 1.1, 7.0] as Vector3Tuple,
  target: [-0.5, 3.7, 0] as Vector3Tuple,
  portraitVerticalFovDegrees: 62,
} as const

/** The moves between stops: slow, with weight, no overshoot. */
export const MOVES = {
  /** A move's length in time grows with its path, between these. */
  shortestSeconds: 1.5,
  longestSeconds: 2.5,
  /** Paths this long (in metres) or longer take the longest time. */
  longestPathMeters: 8,
  /** Stepping inside (or back out) walks further, through the glass. */
  throughTheGlassSeconds: 3.4,
  /** Reduced motion: a cut under a short fade to black. */
  cutFadeOutSeconds: 0.18,
  cutFadeInSeconds: 0.28,
} as const

/** The lights coming on at the arrival, in seconds from the street showing. */
export const ARRIVAL = {
  /** The camera holds the dark view, then eases to the whole front. */
  cameraHoldSeconds: 0.6,
  cameraMoveSeconds: 4.4,
  /** The downlights, row by row from the glass to the back. */
  firstRowStartSeconds: 1.1,
  rowStaggerSeconds: 0.45,
  rowFadeSeconds: 0.9,
  /** Then the lightboxes, the Sneakers and the signs, */
  storeStartSeconds: 2.7,
  storeFadeSeconds: 1.3,
  /** and the LEDs. */
  ledStartSeconds: 3.1,
  ledFadeSeconds: 1.1,
  /** When the line and "Step inside" appear: the camera and every light are done by then. */
  readySeconds: 5.0,
  /** Reduced motion: the lit street fades in from black. */
  reducedMotionFadeInSeconds: 0.5,
} as const

/** Looking around at a stop. */
export const LOOK_AROUND = {
  maxYawDegrees: 20,
  maxPitchDegrees: 8,
  /** A drag across the whole screen's width (or height) turns this far. */
  dragYawDegreesPerScreen: 50,
  dragPitchDegreesPerScreen: 24,
  /** A laptop's pointer, without a press: a smaller turn toward it. */
  pointerYawDegrees: 5,
  pointerPitchDegrees: 2.5,
  /** How quickly the view follows (higher is quicker). */
  dampingPerSecond: 5,
} as const

/** Turning input into steps. */
export const INPUT = {
  /** A wheel or trackpad scroll this far (in pixels) is one step. */
  wheelStepPixels: 36,
  /** The wheel is quiet for this long: the next scroll is a new step. */
  wheelQuietMilliseconds: 220,
  /** During a trackpad's glide, a new flick counts after this long, if it's clearly stronger. */
  wheelNewFlickAfterMilliseconds: 450,
  wheelNewFlickRatio: 1.6,
  /** A touch decides between walking (vertical) and looking (horizontal) after this far. */
  gestureDecisionPixels: 10,
  /** A vertical swipe this long is a step, or a shorter one this fast (pixels per millisecond). */
  swipeStepPixels: 40,
  swipeMinimumPixels: 14,
  swipeStepSpeed: 0.35,
} as const

/** The one-time hint after stepping inside. */
export const HINT = {
  showForMilliseconds: 4500,
  /** No walking for this long after arriving inside shows the hint again, once. */
  showAgainAfterMilliseconds: 9000,
} as const

export const STREET_LIT_SESSION_KEY = 'stridemon-showroom:street-lit'

/**
 * Look closer (Part 3, D-066): where the Sneaker sits on screen, as a share of the screen from its
 * centre (1 is the edge), so the card below it never covers it, and how the camera gets there.
 */
export const LOOK_CLOSER = {
  /** A phone held upright: the card is a sheet over the bottom of the screen. */
  portraitFrame: { horizontal: 0.86, vertical: 0.4, centerY: 0.3 },
  /** A wide screen: the card is a small panel at the bottom left. */
  landscapeFrame: { horizontal: 0.62, vertical: 0.58, centerY: 0.12 },
  /** A little room round the Sneaker. */
  marginShare: 1.4,
  /** Never nearer than this (the brief's "about half a metre"). */
  nearestMeters: 0.45,
  /**
   * The camera never goes lower than this: above the counters (1.0 m) and the chairs, so none of
   * them stands between it and a Sneaker.
   */
  minimumEyeHeightMeters: 1.2,
  /** A move longer than this cuts under the fade instead of flying across the store. */
  longJumpMeters: 6,
  /** Two hits this close in depth are on one surface: the nearer centre wins. */
  sameSurfaceMeters: 0.01,
  /** A press shorter than this, that moves less than the gesture's decision, is a tap. */
  tapMaxMilliseconds: 500,
  /** A horizontal swipe this long steps to a neighbour. */
  neighbourSwipePixels: 40,
  /** The stand's Sneaker fades to a new one over this long. */
  standFadeSeconds: 0.6,
} as const
