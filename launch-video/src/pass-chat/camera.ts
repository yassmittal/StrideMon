import { interpolate } from 'remotion'
import { easings } from '../theme'
import { phoneFacePoints } from './layout'
import {
  chatTimeline,
  endTimeline,
  phoneInTimeline,
  ringTimeline,
  spinTimeline,
  writeTimeline,
} from './timeline'

// The phone shot's camera (scenes 1–3): one pose per frame, so every transform lives here and
// nowhere in the scenes. The pose is a slow linear drift that never stops (the reference's camera
// is always moving) plus eased moves layered on top, each starting before the last has settled:
// the swing in, a push-in as each bubble lands, and the spin. Measured from the reference in
// reference.md.

export type PhoneCamera = {
  /** Tilt: the phone's top away from the camera (the low angle), in degrees. */
  rotateX: number
  /** Turn on the phone's own vertical axis, in degrees: negative faces left, 180 shows the back. */
  rotateY: number
  /** Roll, in degrees. */
  rotateZ: number
  /** How big the focus point appears: 1 is the phone's own pixels. */
  scale: number
  /** The point on the phone the camera looks at, from the phone's centre, in its pixels. */
  focusX: number
  focusY: number
  /** Where that point lands in the frame. */
  anchorX: number
  anchorY: number
}

type CameraProperty = keyof PhoneCamera

/** The pose when the phone has swung in (frame 30), before any move or drift is added. */
const restingPose: PhoneCamera = {
  rotateX: 24,
  rotateY: -22,
  rotateZ: -6,
  scale: 1,
  focusX: phoneFacePoints.newestBubble.x,
  focusY: phoneFacePoints.newestBubble.y,
  anchorX: 900,
  anchorY: 500,
}

/** Linear change per frame, all through the shot: the camera never holds still. */
const driftPerFrame: Partial<PhoneCamera> = {
  rotateX: -6 / 270,
  rotateY: 34 / 270,
  rotateZ: 4 / 270,
  scale: 0.1 / 270,
  anchorX: 60 / 270,
}

/** An eased change to one property, added on top of the drift. */
type CameraMove = {
  property: CameraProperty
  fromFrame: number
  toFrame: number
  /** The change the move adds by its end (before that, a share of it, through the easing). */
  delta: number
  easing: (progress: number) => number
}

/**
 * The spin's ease: a cubic ease-in, accelerating all the way into the cut. Measured from the
 * reference, whose phone is edge-on 78% of the way through its spin (t³ = 0.47 of the turn). The
 * theme's three curves all slow down at their end, which would brake the spin before the whip.
 */
const acceleratingEase = (progress: number) => progress ** 3

/**
 * The swing's ease: emphasized, so it winds up for a few frames before it whips in. Frame 0 is the
 * X thumbnail, and out-expo would put it at full speed there, a blur instead of a phone.
 */
const PHONE_IN_EASE = easings.emphasized

/** The swing starts before frame 0, so frame 0 is already startProgress into it. */
const PHONE_IN_FROM_FRAME =
  phoneInTimeline.startFrame -
  readFramesBeforeEnd(phoneInTimeline.startProgress, phoneInTimeline.endFrame)

/** The swing in: from the right, turned almost edge-on, settling into the resting pose. */
const phoneInMoves: CameraMove[] = (
  [
    // From its lime back with the StrideMon mark (the thumbnail), round to the chat.
    ['rotateY', -170],
    ['rotateX', -6],
    ['rotateZ', -8],
    ['scale', -0.4],
    ['focusY', -1100],
    ['anchorX', 640],
    ['anchorY', 60],
  ] as const
).map(([property, startOffset]) => ({
  property,
  fromFrame: PHONE_IN_FROM_FRAME,
  toFrame: phoneInTimeline.endFrame,
  // The move runs from the offset back to 0, so it ends exactly on the resting pose.
  delta: -startOffset,
  easing: PHONE_IN_EASE,
}))

/** As bubbles 2–4 land, the camera pushes in a little and tips towards them. */
const PUSH_DURATION_FRAMES = 40
const bubblePushMoves: CameraMove[] = chatTimeline.bubbleFrames.slice(1).flatMap((bubbleFrame) => [
  {
    property: 'scale',
    fromFrame: bubbleFrame,
    toFrame: bubbleFrame + PUSH_DURATION_FRAMES,
    delta: 0.06,
    easing: easings.standard,
  },
  {
    property: 'rotateZ',
    fromFrame: bubbleFrame,
    toFrame: bubbleFrame + PUSH_DURATION_FRAMES,
    delta: 0.8,
    easing: easings.standard,
  },
])

/** The spin: on Y, faster and faster, through the edge to the back, as the back fills the frame. */
const spinMoves: CameraMove[] = (
  [
    ['rotateY', 172],
    ['rotateX', -14],
    ['rotateZ', 2],
    ['scale', 0.3],
    // Up the back to its camera block, which slides left out of frame as the turn speeds up.
    ['focusY', -1880],
    ['anchorX', -260],
    ['anchorY', 60],
  ] as const
).map(([property, delta]) => ({
  property,
  fromFrame: spinTimeline.startFrame,
  toFrame: spinTimeline.endFrame,
  delta,
  easing: acceleratingEase,
}))

const cameraMoves: readonly CameraMove[] = [...phoneInMoves, ...bubblePushMoves, ...spinMoves]

/** The phone shot's camera on a frame (fractional frames too, for motion blur's sub-frames). */
export function readPhoneCamera(frame: number): PhoneCamera {
  const driftFrames = frame - phoneInTimeline.endFrame
  const pose = { ...restingPose }
  for (const property of Object.keys(pose) as CameraProperty[]) {
    pose[property] += (driftPerFrame[property] ?? 0) * driftFrames
  }
  // The swing in starts from its offsets, which the moves then take back to 0.
  for (const move of phoneInMoves) pose[move.property] -= move.delta
  for (const move of cameraMoves) {
    const progress = interpolate(frame, [move.fromFrame, move.toFrame], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: move.easing,
    })
    pose[move.property] += move.delta * progress
  }
  return pose
}

/**
 * For the swing, which ends on `endFrame` and has run `progress` by frame 0: how many frames
 * before frame 0 it started. Solves PHONE_IN_EASE(t) = progress by bisection.
 */
function readFramesBeforeEnd(progress: number, endFrame: number): number {
  let low = 0
  let high = 1
  for (let step = 0; step < 40; step += 1) {
    const middle = (low + high) / 2
    if (PHONE_IN_EASE(middle) < progress) low = middle
    else high = middle
  }
  const swingFrames = endFrame / (1 - low)
  return swingFrames * low
}

/** The perspective the phone shot is seen through: a long lens, so the phone isn't distorted. */
export const PHONE_SHOT_PERSPECTIVE_PIXELS = 2600

/**
 * The phone's CSS transform for a pose, in a scene whose perspective origin is the frame's centre.
 * The dolly brings the focus point to `scale` (a real push, so the perspective changes as in the
 * reference), and the anchor is pre-divided so the focus still lands on it.
 */
export function toPhoneTransform(pose: PhoneCamera, frameCentre: { x: number; y: number }): string {
  const dolly = PHONE_SHOT_PERSPECTIVE_PIXELS * (1 - 1 / pose.scale)
  const anchorX = frameCentre.x + (pose.anchorX - frameCentre.x) / pose.scale
  const anchorY = frameCentre.y + (pose.anchorY - frameCentre.y) / pose.scale
  return [
    `translate3d(${anchorX}px, ${anchorY}px, ${dolly}px)`,
    `rotateZ(${pose.rotateZ}deg)`,
    `rotateX(${pose.rotateX}deg)`,
    `rotateY(${pose.rotateY}deg)`,
    `translate3d(${-pose.focusX}px, ${-pose.focusY}px, 0px)`,
  ].join(' ')
}

/** The twist line's camera (scenes 6–8): how big the line is and which of its points is where. */
export type LineCamera = {
  zoom: number
  /** The point on the line it looks at, in the line's pixels at zoom 1 (x from its start, y from its baseline). */
  focusX: number
  focusY: number
  /** Where that point lands in the frame. */
  anchorX: number
  anchorY: number
}

/** How close the line starts: "This" about a fifth of the frame wide, as in the reference. */
export const LINE_CLOSE_ZOOM = 1.45
/** While close, "This" sits in the frame's middle, where the ring closes in. */
const LINE_CLOSE_ANCHOR = { x: 960, y: 540 }

/**
 * Close on "This" while the ring closes in; as the pen writes, the camera slides along so the
 * written part stays centred (as the reference's does); then one out-expo pull-back, which is a
 * whip in its first frames and the reference's slow drift back after; then the end card's drift.
 */
export function readLineCamera(
  frame: number,
  framing: {
    /** In the line's pixels: "This"'s visual centre, "This isn’t"'s, and the whole line's. */
    thisCentre: { x: number; y: number }
    writtenCentre: { x: number; y: number }
    lineCentre: { x: number; y: number }
    /** Where the line's centre sits in the end card. */
    restingAnchor: { x: number; y: number }
  },
): LineCamera {
  const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
  const pullBackEndFrame = writeTimeline.pullBackStartFrame + writeTimeline.pullBackDurationFrames
  const follow = interpolate(
    frame,
    [writeTimeline.penStartFrame, writeTimeline.penEndFrame],
    [0, 1],
    { ...clamp, easing: easings.standard },
  )
  const pullBack = interpolate(
    frame,
    [writeTimeline.pullBackStartFrame, pullBackEndFrame],
    [0, 1],
    {
      ...clamp,
      easing: easings.outExpo,
    },
  )
  // While close, the camera eases back a touch (a drift), so the frame is never dead.
  const closeZoom = interpolate(
    frame,
    [ringTimeline.flipFrame, writeTimeline.pullBackStartFrame],
    [LINE_CLOSE_ZOOM, LINE_CLOSE_ZOOM * 0.97],
    clamp,
  )
  const endDrift = interpolate(frame, [pullBackEndFrame, endTimeline.endFrame], [1, 1.02], clamp)
  const closeFocusX =
    framing.thisCentre.x + (framing.writtenCentre.x - framing.thisCentre.x) * follow
  return {
    zoom: (closeZoom + (1 - closeZoom) * pullBack) * endDrift,
    focusX: closeFocusX + (framing.lineCentre.x - closeFocusX) * pullBack,
    focusY: framing.thisCentre.y + (framing.lineCentre.y - framing.thisCentre.y) * pullBack,
    anchorX: LINE_CLOSE_ANCHOR.x + (framing.restingAnchor.x - LINE_CLOSE_ANCHOR.x) * pullBack,
    anchorY: LINE_CLOSE_ANCHOR.y + (framing.restingAnchor.y - LINE_CLOSE_ANCHOR.y) * pullBack,
  }
}
