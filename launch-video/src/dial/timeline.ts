// The Dial film's frames (docs/dial-video-prompt.md, "The cut"). The keypad, the zoom and every
// shot start on the reference's own frames (../iphone.mp4, measured frame by frame), at its own
// 30 fps, so the film stays on its music. Only the end card is longer than the reference's: it holds
// the waitlist line, over the music's own loop (scripts/copy-dial-media.sh).

export const DIAL_FRAMES_PER_SECOND = 30
export const DIAL_WIDTH = 1080
export const DIAL_HEIGHT = 1920
/** The reference's 295 frames up to its logo, then a 125-frame end card (14 s in all). */
export const DIAL_DURATION_IN_FRAMES = 420

/** The reference's own frames are 720 x 1280: plates, placements and the keypad are in its pixels. */
export const REFERENCE_WIDTH = 720
export const REFERENCE_HEIGHT = 1280
export const REFERENCE_TO_FILM_SCALE = DIAL_WIDTH / REFERENCE_WIDTH

/** The keys in dialling order, and the frame each one's Sneaker fades into it. */
export const keyFillFrames = {
  '1': 6,
  '2': 11,
  '3': 18,
  '4': 25,
  '5': 32,
  '6': 39,
  '7': 46,
  '8': 53,
  '9': 79,
  '0': 97,
} as const

export type DialKey = keyof typeof keyFillFrames

/**
 * The call button is pressed, then the keypad zooms into key 1 until its picture is the first
 * shot's own size, and the circle round it opens onto the whole frame. The circle only opens once the
 * zoom is done: before that the picture is smaller than the frame, and its edges would show.
 */
export const keypadTimeline = {
  callPressFrame: 100,
  zoomStartFrame: 105,
  zoomEndFrame: 112,
  circleOpenEndFrame: 114,
} as const

export type DialShotName =
  | 'honey'
  | 'redVelvet'
  | 'napoleon'
  | 'cloud'
  | 'blackForest'
  | 'redBerry'
  | 'caramel'
  | 'strawberry'
  | 'carrot'
  | 'cheesecake'

/** Each shot from its first frame up to (not including) its end frame, on the reference's cuts. */
export const dialShots: Record<DialShotName, { startFrame: number; endFrame: number }> = {
  honey: { startFrame: 114, endFrame: 135 },
  redVelvet: { startFrame: 135, endFrame: 153 },
  napoleon: { startFrame: 153, endFrame: 171 },
  cloud: { startFrame: 171, endFrame: 189 },
  blackForest: { startFrame: 189, endFrame: 208 },
  redBerry: { startFrame: 208, endFrame: 226 },
  caramel: { startFrame: 226, endFrame: 244 },
  strawberry: { startFrame: 244, endFrame: 264 },
  carrot: { startFrame: 264, endFrame: 279 },
  cheesecake: { startFrame: 279, endFrame: 295 },
}

export const dialShotNames = Object.keys(dialShots) as DialShotName[]

/** The first shot's caption waits for the zoom to settle, as the reference's. */
export const FIRST_CAPTION_DELAY_FRAMES = 5

/** The end card: the lockup pops in on the reference's logo cut, then the waitlist line. */
export const endCardTimeline = {
  startFrame: 295,
  lockupInEndFrame: 303,
  headlineInFrame: 308,
  bodyInFrame: 318,
  linkInFrame: 328,
} as const

export function readShotAtFrame(frame: number): DialShotName | null {
  return (
    dialShotNames.find(
      (shotName) => frame >= dialShots[shotName].startFrame && frame < dialShots[shotName].endFrame,
    ) ?? null
  )
}
