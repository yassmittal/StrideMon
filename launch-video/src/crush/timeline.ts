// The Crush film's frames (docs/crush-video-prompt.md, "The cut"). Every shot starts on the
// reference's own cut (../inspiration.mp4, measured frame by frame), at the reference's own 25 fps,
// so its hook plays one for one and the film stays on its music.

export const CRUSH_FRAMES_PER_SECOND = 25
export const CRUSH_WIDTH = 1080
export const CRUSH_HEIGHT = 1920
/** The reference's 634 frames (25.36 s). */
export const CRUSH_DURATION_IN_FRAMES = 634

/** The reference's own frames are 720 x 1280: plates, tracks and placements are in its pixels. */
export const REFERENCE_WIDTH = 720
export const REFERENCE_HEIGHT = 1280
export const REFERENCE_TO_FILM_SCALE = CRUSH_WIDTH / REFERENCE_WIDTH

/** The hook is the reference's own frames 0–263: three rounds of "He will look at the person he likes first". */
export const HOOK_END_FRAME = 264

/** The camera pan up to the cup (264–268) and the picture cropping in (269–270): a plate per frame. */
export const HOOK_PAN_START_FRAME = 264
export const HOOK_PAN_END_FRAME = 271

export type CrushShotName =
  | 'hookFloat'
  | 'ledge'
  | 'pearls'
  | 'pour'
  | 'cream'
  | 'topping'
  | 'topDown'
  | 'sky'
  | 'grip'
  | 'stir'
  | 'bench'

/** Each plate shot from its first frame up to (not including) its end frame, on the reference's cuts. */
export const crushShots: Record<CrushShotName, { startFrame: number; endFrame: number }> = {
  hookFloat: { startFrame: 271, endFrame: 279 },
  ledge: { startFrame: 279, endFrame: 294 },
  pearls: { startFrame: 294, endFrame: 309 },
  pour: { startFrame: 309, endFrame: 324 },
  cream: { startFrame: 324, endFrame: 339 },
  topping: { startFrame: 339, endFrame: 353 },
  topDown: { startFrame: 353, endFrame: 367 },
  sky: { startFrame: 367, endFrame: 380 },
  grip: { startFrame: 380, endFrame: 394 },
  stir: { startFrame: 394, endFrame: 408 },
  bench: { startFrame: 408, endFrame: 526 },
}

export const crushShotNames = Object.keys(crushShots) as CrushShotName[]

/** The bench shot's moments, from the reference. */
export const benchTimeline = {
  /** "4-layers …" types in over the close-up tilting up the Sneaker, and goes as the camera pulls back. */
  layersTextStartFrame: 409,
  layersTextEndFrame: 440,
  /** "Love In Every …" types in as the camera settles on the bench. */
  loveTextStartFrame: 441,
  loveTextEndFrame: 476,
  /** The second Sneaker comes in from the left and is set down beside the first. */
  pairInStartFrame: 460,
  pairLandFrame: 488,
  /** The name, both lines typing at once. */
  titleStartFrame: 476,
  /** The picture washes to white, as the reference. */
  whiteStartFrame: 520,
  whiteEndFrame: 526,
} as const

/** The end card on white, from the reference's logo build. */
export const logoTimeline = {
  tileInStartFrame: 530,
  tileInEndFrame: 540,
  /** The mark's three strokes draw one after another. */
  strokesStartFrame: 540,
  strokesEndFrame: 570,
  /** The tile edges right, then whips left as the wordmark wipes in beside it. */
  nudgeStartFrame: 578,
  whipStartFrame: 585,
  whipEndFrame: 597,
  wordmarkStartFrame: 587,
  wordmarkEndFrame: 596,
} as const

/** The four making shots build the Sneaker one layer each, on the reference's four steps. */
export const buildSteps = {
  sole: crushShots.pearls,
  base: crushShots.pour,
  panels: crushShots.cream,
  laces: crushShots.topping,
} as const

export function readShotAtFrame(frame: number): CrushShotName | null {
  return (
    crushShotNames.find(
      (shotName) => frame >= crushShots[shotName].startFrame && frame < crushShots[shotName].endFrame,
    ) ?? null
  )
}
