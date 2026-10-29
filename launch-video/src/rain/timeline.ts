// The Rain film's frames (docs/rain-video-prompt.md, "The cut"). Every frame is the reference's own
// (../keywordType.mp4, measured frame by frame), at its own 30 fps, so the film stays on its music.

import type { RainCarShotName } from './tracks'

export const RAIN_FRAMES_PER_SECOND = 30
export const RAIN_WIDTH = 1080
export const RAIN_HEIGHT = 1920
/** The reference's 521 frames (17.37 s); its last one is black. */
export const RAIN_DURATION_IN_FRAMES = 521

/** The reference's own frames are 720 x 1280: plates, tracks and placements are in its pixels. */
export const REFERENCE_WIDTH = 720
export const REFERENCE_HEIGHT = 1280
export const REFERENCE_TO_FILM_SCALE = RAIN_WIDTH / REFERENCE_WIDTH

/**
 * The reference plays untouched up to here: the rain on the keyboard, the whip to the laptop and
 * its gibberish, up to the keystroke after "HGBXHGVEU". From this frame the rain types the film's
 * words on the reference's plates (scripts/build-rain-plates.py).
 */
export const TYPING_START_FRAME = 219
/** The reference cuts to the car here, on the music's drop. */
export const TYPING_END_FRAME = 406
/**
 * The doc scrolls four lines here (the music's hit at 382): the laptop's frames blend the doc's old
 * and new positions until AFTER_SCROLL_FRAME.
 */
export const SCROLL_START_FRAME = 379
export const AFTER_SCROLL_FRAME = 383

/** Each car shot from its first frame up to (not including) its end frame, on the reference's cuts. */
export const carShots: Record<RainCarShotName, { startFrame: number; endFrame: number }> = {
  palms: { startFrame: 406, endFrame: 429 },
  close: { startFrame: 429, endFrame: 451 },
  front: { startFrame: 451, endFrame: 475 },
  rear: { startFrame: 475, endFrame: 496 },
  night: { startFrame: 496, endFrame: 520 },
}

export const carShotNames = Object.keys(carShots) as RainCarShotName[]

export function readCarShotAtFrame(frame: number): RainCarShotName | null {
  return (
    carShotNames.find((shotName) => frame >= carShots[shotName].startFrame && frame < carShots[shotName].endFrame) ??
    null
  )
}
