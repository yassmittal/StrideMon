// The Stash film's frames (docs/stash-video-prompt.md, "The cut"). The reference (../nailpaints.mp4)
// is 30 fps, so the film is too, and every frame up to the end card is the reference's own frame
// of the same number, measured frame by frame.

export const STASH_FRAMES_PER_SECOND = 30
export const STASH_WIDTH = 1080
export const STASH_HEIGHT = 1920

/** The reference's own frames are 720 x 1280: the case track and the Sneakers' places are in its pixels. */
export const REFERENCE_WIDTH = 720
export const REFERENCE_HEIGHT = 1280
export const REFERENCE_TO_FILM_SCALE = STASH_WIDTH / REFERENCE_WIDTH

/**
 * The reference fades the case up from black over 197–204 while it's still sliding into place, too
 * dark to track. The film fades up the same frames on 205, the first frame the case is tracked
 * well on, held.
 */
export const caseFadeTimeline = {
  startFrame: 197,
  heldFrame: 205,
} as const

/**
 * The reference whips from shot A to shot B through a smear (270–277). The film does its own whip
 * on the same frames: shot A's last tracked frame zooms in and blurs away, then shot B's first
 * tracked frame comes back out of the blur, landing on the music's beat at 278.
 */
export const whipTimeline = {
  zoomInStartFrame: 268,
  /** Shot A's last tracked frame, held while it zooms in. */
  heldFrameA: 267,
  zoomOutStartFrame: 273,
  /** Shot B's first steady frame, held while it zooms back out. */
  heldFrameB: 278,
  endFrame: 278,
} as const

/** On the song's last beat in the reference (10.86 s): the end card. */
export const END_CARD_START_FRAME = 326
/** The case's last frame, held under the end card. */
export const END_CARD_HELD_FRAME = 325
export const END_CARD_DURATION_IN_FRAMES = 105
export const STASH_DURATION_IN_FRAMES = END_CARD_START_FRAME + END_CARD_DURATION_IN_FRAMES

/** The end card's moments, from its first frame. */
export const endCardTimeline = {
  /** The held case blurs and darkens on the beat. */
  veilEndFrame: 8,
  markInFrame: 4,
  headlineStartFrame: 8,
  bodyStartFrame: 20,
  linkInFrame: 34,
} as const

/**
 * The music: the reference's own track up to the end card, then the same song again from one
 * bar back (its beat at 7.66 s, four beats before 10.86 s), fading out under the end card.
 */
export const musicTimeline = {
  loopFromFrame: 230,
  fadeOutStartFrame: END_CARD_DURATION_IN_FRAMES - 40,
} as const
