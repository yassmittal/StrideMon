// The Showroom film's frames (docs/showroom-video-prompt.md, "The cut"). Every shot starts on the
// reference's own cut (reference.md), so the film stays in sync with the reference's music. 30 fps,
// the reference's rate, so the hook plays its frames one for one.

export const SHOWROOM_FRAMES_PER_SECOND = 30
export const SHOWROOM_WIDTH = 1080
export const SHOWROOM_HEIGHT = 1920
/** The reference's 644 frames (21.47 s). */
export const SHOWROOM_DURATION_IN_FRAMES = 644

/** The hook is the reference's own frames 0–86: the cameraman, the F1 car and its whip. */
export const HOOK_END_FRAME = 87

export type ShowroomShotName =
  | 'streetRun'
  | 'darkFront'
  | 'litFront'
  | 'heroLightbox'
  | 'legendaryCorner'
  | 'foundingPassWall'
  | 'sneakerWall'
  | 'rareWall'
  | 'streetSign'

/** Each shot from its first frame up to (not including) its end frame, in order. */
export const showroomShots: Record<ShowroomShotName, { startFrame: number; endFrame: number }> = {
  streetRun: { startFrame: 87, endFrame: 146 },
  darkFront: { startFrame: 146, endFrame: 206 },
  litFront: { startFrame: 206, endFrame: 271 },
  heroLightbox: { startFrame: 271, endFrame: 337 },
  legendaryCorner: { startFrame: 337, endFrame: 402 },
  foundingPassWall: { startFrame: 402, endFrame: 469 },
  sneakerWall: { startFrame: 469, endFrame: 536 },
  rareWall: { startFrame: 536, endFrame: 593 },
  streetSign: { startFrame: 593, endFrame: 640 },
}

export const showroomShotNames = Object.keys(showroomShots) as ShowroomShotName[]

/** The reference mirrors the left half of the picture onto the right for three frames as it cuts in. */
export const MIRROR_SPLIT_END_FRAME = 90
/** The whip into the store: a horizontal blur that dies away over these frames. */
export const WHIP_IN_END_FRAME = 92
/** The reference greys out the street run over its last frames. */
export const STREET_RUN_GREY_START_FRAME = 134
/** The whip out of the Sneaker wall (the reference's blurred frames 532–535). */
export const WHIP_OUT_START_FRAME = 530
/** Black after the last sign, as the reference. */
export const BLACK_START_FRAME = 640

export function readShotAtFrame(frame: number): ShowroomShotName | null {
  return (
    showroomShotNames.find(
      (shotName) =>
        frame >= showroomShots[shotName].startFrame && frame < showroomShots[shotName].endFrame,
    ) ?? null
  )
}
