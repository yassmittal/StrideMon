import { interpolate } from 'remotion'
import { easings } from '../theme'
import { BURST_DESIGN_NUMBERS } from './sneakers'
import { burstTimeline, ringTimeline } from './timeline'

// Where each of the ten burst shoes flies (scene 5), measured from the reference's burst: the
// objects leave from behind the hero on a 2-frame stagger, come towards the camera (they grow),
// spin 20–60°, end round it on a ragged ring that breaks past the grown card's edges, and then
// drift slowly outwards. All positions are from the hero's centre, in the frame's pixels.

/** A seeded jitter, so the ring is ragged but never changes between renders. */
function readJitter(index: number, salt: number): number {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453
  return value - Math.floor(value)
}

export type BurstShoe = {
  designNumber: number
  launchFrame: number
  /** Where it ends its flight, from the hero's centre. */
  targetX: number
  targetY: number
  /** Its shoe frame's width at the end of the flight, in pixels. */
  width: number
  /** Its turn by the end of the flight, in degrees. */
  spinDegrees: number
}

// The ring the shoes land on: wide, because the frame is 16:9 and the card grows to 92% of it.
const RING_RADIUS_X = 790
const RING_RADIUS_Y = 390
/** Each burst shoe ends at 35–45% of #0627's width, so #0627 stays the biggest by far. */
const SHOE_WIDTH_RANGE = [200, 260] as const

export const burstShoes: readonly BurstShoe[] = BURST_DESIGN_NUMBERS.map((designNumber, index) => {
  // Clockwise from the top, evenly spaced, each nudged off its slot so the ring isn't a clock face.
  const angle = ((-90 + index * 36 + (readJitter(index, 1) - 0.5) * 16) * Math.PI) / 180
  const radius = 0.86 + readJitter(index, 2) * 0.24
  const spinSign = index % 2 === 0 ? 1 : -1
  return {
    designNumber,
    launchFrame: burstTimeline.firstShoeFrame + index * burstTimeline.shoeStaggerFrames,
    targetX: Math.cos(angle) * RING_RADIUS_X * radius,
    targetY: Math.sin(angle) * RING_RADIUS_Y * radius,
    width: SHOE_WIDTH_RANGE[0] + readJitter(index, 3) * (SHOE_WIDTH_RANGE[1] - SHOE_WIDTH_RANGE[0]),
    spinDegrees: spinSign * (20 + readJitter(index, 4) * 40),
  }
})

/** How a burst shoe starts: small and hidden behind the hero, at its centre. */
const LAUNCH_SCALE = 0.2
/** After the flight, every shoe keeps drifting outwards and turning, slowly and linearly. */
const DRIFT_OUTWARD_PER_FRAME = 0.0022
const DRIFT_SPIN_DEGREES_PER_FRAME = 0.12

export type BurstShoePose = { x: number; y: number; scale: number; rotateDegrees: number }

/** A burst shoe's pose on a (sub-)frame, from the hero's centre. */
export function readBurstShoePose(shoe: BurstShoe, frame: number): BurstShoePose {
  const flight = interpolate(
    frame,
    [shoe.launchFrame, shoe.launchFrame + burstTimeline.shoeFlightFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.outExpo },
  )
  const driftFrames = Math.max(0, frame - (shoe.launchFrame + burstTimeline.shoeFlightFrames))
  const outward = flight * (1 + driftFrames * DRIFT_OUTWARD_PER_FRAME)
  // As the card leaves (scene 6), the shoes pull back in towards the hero with it.
  const gather = interpolate(
    frame,
    [ringTimeline.startFrame, ringTimeline.startFrame + ringTimeline.cardExitDurationFrames],
    [1, 0.35],
    // With the card's exit, accelerating into the flip.
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (progress) => progress ** 2 },
  )
  return {
    x: shoe.targetX * outward * gather,
    y: shoe.targetY * outward * gather,
    scale: LAUNCH_SCALE + (1 - LAUNCH_SCALE) * flight,
    rotateDegrees:
      shoe.spinDegrees * flight +
      driftFrames * DRIFT_SPIN_DEGREES_PER_FRAME * Math.sign(shoe.spinDegrees),
  }
}
