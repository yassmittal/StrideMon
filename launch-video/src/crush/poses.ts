import { Easing, interpolate } from 'remotion'
import { easings } from '../theme'
import { FULLY_BUILT, type SneakerBuild, type SneakerPour } from './components/CrushSneaker'
import { benchTimeline, buildSteps, type CrushShotName, crushShots } from './timeline'

// Where the Sneaker stands in each shot, in the shot's plate pixels (the reference's 720 × 1280),
// so the tracked camera carries it with the background. Each pose puts the cup's place in the
// reference to the Sneaker: read off grids drawn on the reference's frames, and for the hook's pan
// measured by differencing each frame against its clean plate.

/** A point on the art (its 1000 × 600 viewBox) that the pose puts at (x, y). */
export type ArtPoint = { artX: number; artY: number }
/** The shoe's middle, for Sneakers in the air. */
export const SHOE_CENTER: ArtPoint = { artX: 501, artY: 314 }
/** The middle of the sole, for Sneakers standing on something. */
export const SOLE_CENTER: ArtPoint = { artX: 501, artY: 520 }

export type SneakerPose = {
  x: number
  y: number
  /** The art's width in plate pixels. */
  width: number
  /** Clockwise, around the anchor. */
  rotationDegrees: number
  anchor: ArtPoint
  build: SneakerBuild
  pour?: SneakerPour | undefined
  /** A soft shadow on the surface under the sole. */
  isStanding: boolean
  /** To sit in the plate's focus and grain. */
  blurPixels: number
}

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

/** 0 → 1 across a step's frames, eased out. */
function readProgress(frame: number, startFrame: number, endFrame: number, easing = easings.standard): number {
  return interpolate(frame, [startFrame, endFrame], [0, 1], { ...clamp, easing })
}

/** A drop that lands at landFrame, bounces once and settles: the offset above the rest, in pixels. */
function readDropOffset(frame: number, startFrame: number, landFrame: number, dropPixels: number, bouncePixels: number): number {
  if (frame < landFrame) {
    return -dropPixels * (1 - readProgress(frame, startFrame, landFrame, Easing.in(Easing.quad)))
  }
  const sinceLanding = frame - landFrame
  const bounceFrames = 5
  if (sinceLanding >= bounceFrames) return 0
  return -bouncePixels * Math.sin((sinceLanding / bounceFrames) * Math.PI)
}

/** The cup's centre in each frame of the hook's pan (264–270), from each frame against its plate. */
export const HOOK_PAN_CENTERS: Record<number, { x: number; y: number }> = {
  264: { x: 818, y: 700 },
  265: { x: 761, y: 692 },
  266: { x: 677, y: 692 },
  267: { x: 578, y: 703 },
  268: { x: 477, y: 713 },
  269: { x: 400, y: 722 },
  270: { x: 351, y: 728 },
}
/** The cup's centre over the group from 271 (it measures 250 × 375 there). */
const HOOK_FLOAT_CENTER = { x: 330, y: 731 }
const HOOK_SNEAKER_WIDTH = 400

const standingBlur = 0.6

export function readHookPose(frame: number): SneakerPose {
  const panCenter = HOOK_PAN_CENTERS[frame]
  // Once the camera settles, the Sneaker hovers: a slow bob, as the reference's cup is pasted in mid-air.
  const bob = panCenter === undefined ? Math.sin((frame - 271) * 0.32) * 4 : 0
  const center = panCenter ?? HOOK_FLOAT_CENTER
  return {
    x: center.x,
    y: center.y + bob,
    width: HOOK_SNEAKER_WIDTH,
    rotationDegrees: -4,
    anchor: SHOE_CENTER,
    build: FULLY_BUILT,
    isStanding: false,
    blurPixels: 0.5,
  }
}

/** The Sneaker in a plate shot at a frame. Only called within the shot's frames. */
export function readShotPose(shotName: Exclude<CrushShotName, 'hookFloat' | 'bench'>, frame: number): SneakerPose {
  const { startFrame, endFrame } = crushShots[shotName]
  const shotProgress = (frame - startFrame) / (endFrame - startFrame)
  switch (shotName) {
    case 'ledge':
      // Dropped onto the stone ledge, which slopes down to the right by 4.4°.
      return {
        x: 345,
        y: 1028 + readDropOffset(frame, startFrame, startFrame + 7, 1150, 22),
        width: 600,
        rotationDegrees: 4.4,
        anchor: SOLE_CENTER,
        build: FULLY_BUILT,
        isStanding: true,
        blurPixels: standingBlur,
      }
    case 'pearls':
      // The empty outline on the counter; the sole drops in, as the pearls go into the empty cup.
      return {
        x: 368,
        y: 1076,
        width: 610,
        rotationDegrees: 0,
        anchor: SOLE_CENTER,
        build: {
          sole: readProgress(frame, buildSteps.sole.startFrame + 1, buildSteps.sole.startFrame + 10, Easing.out(Easing.back(1.6))),
          base: 0,
          panels: 0,
          laces: 0,
        },
        isStanding: true,
        blurPixels: standingBlur,
      }
    case 'pour': {
      // Tipped back in the hand like the reference's cup, the colour poured in through the collar.
      const base = readProgress(frame, buildSteps.base.startFrame, buildSteps.base.endFrame - 2, Easing.inOut(Easing.quad))
      return {
        x: 392,
        y: 790,
        width: 600,
        rotationDegrees: -14 + shotProgress * 3,
        anchor: SHOE_CENTER,
        build: { sole: 1, base, panels: 0, laces: 0 },
        pour: base < 1 ? { layer: 'base', centerX: 300, width: 34 } : undefined,
        isStanding: false,
        blurPixels: standingBlur,
      }
    }
    case 'cream': {
      const panels = readProgress(frame, buildSteps.panels.startFrame + 1, buildSteps.panels.endFrame - 3, Easing.inOut(Easing.quad))
      return {
        x: 372,
        y: 1062,
        width: 640,
        rotationDegrees: 0,
        anchor: SOLE_CENTER,
        build: { sole: 1, base: 1, panels, laces: 0 },
        pour: panels < 1 ? { layer: 'panels', centerX: 300, width: 40 } : undefined,
        isStanding: true,
        blurPixels: standingBlur,
      }
    }
    case 'topping':
      // The laces and heel tab set on top, as the tongs set the honeycomb.
      return {
        x: 376,
        y: 1072 - shotProgress * 6,
        width: 640,
        rotationDegrees: 0,
        anchor: SOLE_CENTER,
        build: {
          sole: 1,
          base: 1,
          panels: 1,
          laces: readProgress(frame, buildSteps.laces.startFrame + 1, buildSteps.laces.startFrame + 8, Easing.out(Easing.back(1.8))),
        },
        isStanding: true,
        blurPixels: standingBlur,
      }
    case 'topDown':
      // Lying on the bench, top down and close on the laces, as the reference looks down into the cup.
      return {
        x: 372,
        y: 812 - shotProgress * 10,
        width: 2100,
        rotationDegrees: -28,
        anchor: { artX: 470, artY: 300 },
        build: FULLY_BUILT,
        isStanding: false,
        blurPixels: 0.8,
      }
    case 'sky':
      // Held up against the sky: it sways and lifts a little, as the cup in the hand.
      return {
        x: 335 + shotProgress * 12,
        y: 690 - shotProgress * 24,
        width: 440,
        rotationDegrees: -7 + shotProgress * 9,
        anchor: SHOE_CENTER,
        build: FULLY_BUILT,
        isStanding: false,
        blurPixels: 0.5,
      }
    case 'grip':
      // The grip close-up: the heel, the heel tab and the sole, drifting across.
      return {
        x: 372 - shotProgress * 40,
        y: 660 + shotProgress * 16,
        width: 2400,
        rotationDegrees: -6,
        anchor: { artX: 205, artY: 330 },
        build: FULLY_BUILT,
        isStanding: false,
        blurPixels: 1,
      }
    case 'stir':
      // Top down on the laces, turning slowly as the straw stirs.
      return {
        x: 360,
        y: 700,
        width: 2000,
        rotationDegrees: -18 - shotProgress * 14,
        anchor: { artX: 480, artY: 240 },
        build: FULLY_BUILT,
        isStanding: false,
        blurPixels: 0.8,
      }
  }
}

/** The bench: the first Sneaker stands where the reference's first cup does. */
export function readBenchFirstPose(): SneakerPose {
  return {
    x: 502,
    y: 858,
    width: 400,
    rotationDegrees: 0,
    anchor: SOLE_CENTER,
    build: FULLY_BUILT,
    isStanding: true,
    blurPixels: standingBlur,
  }
}

/** The second of the pair: carried in from the left and set down just behind the first. */
export function readBenchSecondPose(frame: number): SneakerPose | null {
  if (frame < benchTimeline.pairInStartFrame) return null
  const carried = readProgress(frame, benchTimeline.pairInStartFrame, benchTimeline.pairLandFrame, easings.emphasized)
  const settle = readDropOffset(frame, benchTimeline.pairLandFrame - 4, benchTimeline.pairLandFrame, 0, 6)
  return {
    x: interpolate(carried, [0, 1], [-240, 268]),
    // Carried a little above the bench, lowered as it lands.
    y: interpolate(carried, [0, 0.7, 1], [700, 800, 842]) + settle,
    width: 380,
    rotationDegrees: interpolate(carried, [0, 0.8, 1], [-10, -2, 0]),
    anchor: SOLE_CENTER,
    build: FULLY_BUILT,
    isStanding: carried > 0.9,
    blurPixels: standingBlur,
  }
}
