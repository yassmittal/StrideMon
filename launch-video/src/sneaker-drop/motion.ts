import { interpolate } from 'remotion'
import { easings } from '../theme'
import { PUNCH_DURATION_FRAMES, PUNCH_SCALE } from './content'

/** The cowbell's punch: up on the hit's own frame, then eased back. Nothing overshoots. */
export function readPunchScale(frame: number, punchFrames: readonly number[]): number {
  const lastPunchFrame = [...punchFrames].reverse().find((punchFrame) => punchFrame <= frame)
  if (lastPunchFrame === undefined) return 1
  return interpolate(frame - lastPunchFrame, [0, PUNCH_DURATION_FRAMES], [PUNCH_SCALE, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easings.standard,
  })
}

// Never a dead frame: the camera creeps in while a shot holds. Linear, as a drift is continuous
// (launch-video-prompt.md §4), and slow: 2% over a bar.
const DRIFT_PER_FRAME = 0.02 / 150

/** The drift's scale, `framesHeld` frames after the shot began. */
export function readDriftScale(framesHeld: number): number {
  return 1 + Math.max(0, framesHeld) * DRIFT_PER_FRAME
}
