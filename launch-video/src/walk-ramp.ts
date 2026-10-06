import { Easing, interpolate } from 'remotion'
import { readSceneDurationInFrames } from './beats'
import { easings } from './theme'

// The walk's speed ramp, 1× → 8× → 1×, as a map from film frames to source frames of
// public/footage/walk-run-screen.mp4 (video2 from 184.0 s, 60 fps). Both run at 60 fps, so at
// 1× one film frame advances one source frame.

/** walk-run-screen.mp4 starts at this second of video2.mp4. */
export const WALK_FOOTAGE_START_SOURCE_SECONDS = 184.0
/** The cold open ends on 1:56 (video2 187.25–188.0); the walk picks up there. */
const WALK_START_SOURCE_SECONDS = 187.75
const FRAMES_PER_SECOND = 60

const HOLD_AT_START_FRAMES = 45
const RAMP_FRAMES = 45
const HOLD_AT_END_FRAMES = 45
const TOP_SPEED = 8
/** Motion blur only where the footage moves fast: the 8× stretch and the steep part of each ramp. */
const MOTION_BLUR_MINIMUM_SPEED = 2

/** The playback speed at a film frame of the walk scene. */
export function readPlaybackSpeed(sceneFrame: number): number {
  const durationInFrames = readSceneDurationInFrames('walk')
  const rampDownEndFrame = durationInFrames - HOLD_AT_END_FRAMES
  return interpolate(
    sceneFrame,
    [
      HOLD_AT_START_FRAMES,
      HOLD_AT_START_FRAMES + RAMP_FRAMES,
      rampDownEndFrame - RAMP_FRAMES,
      rampDownEndFrame,
    ],
    [1, TOP_SPEED, TOP_SPEED, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: [easings.standard, Easing.linear, easings.standard],
    },
  )
}

const cumulativeSourceFrames: number[] = buildCumulativeSourceFrames()

function buildCumulativeSourceFrames(): number[] {
  const durationInFrames = readSceneDurationInFrames('walk')
  const sourceFrames = [0]
  for (let sceneFrame = 1; sceneFrame <= durationInFrames; sceneFrame++) {
    const previousSourceFrame = sourceFrames[sceneFrame - 1] ?? 0
    // The trapezoid rule keeps the mapping smooth at fractional frames (motion-blur samples).
    const averageSpeed = (readPlaybackSpeed(sceneFrame - 1) + readPlaybackSpeed(sceneFrame)) / 2
    sourceFrames.push(previousSourceFrame + averageSpeed)
  }
  return sourceFrames
}

/** The frame of walk-run-screen.mp4 to show at a (possibly fractional) frame of the walk scene. */
export function toWalkFootageFrame(sceneFrame: number): number {
  const wholeFrame = Math.floor(sceneFrame)
  const fraction = sceneFrame - wholeFrame
  const lower = cumulativeSourceFrames[wholeFrame] ?? cumulativeSourceFrames.at(-1) ?? 0
  const upper = cumulativeSourceFrames[wholeFrame + 1] ?? lower
  const startFrame =
    (WALK_START_SOURCE_SECONDS - WALK_FOOTAGE_START_SOURCE_SECONDS) * FRAMES_PER_SECOND
  return startFrame + lower + (upper - lower) * fraction
}

/** The second of video2.mp4 the walk shows at a frame of the walk scene. */
export function toWalkSourceSeconds(sceneFrame: number): number {
  return WALK_FOOTAGE_START_SOURCE_SECONDS + toWalkFootageFrame(sceneFrame) / FRAMES_PER_SECOND
}

/** The first frame of the walk scene that shows a given second of video2.mp4, or null. */
export function findWalkSceneFrame(sourceSeconds: number): number | null {
  const durationInFrames = readSceneDurationInFrames('walk')
  for (let sceneFrame = 0; sceneFrame < durationInFrames; sceneFrame++) {
    if (toWalkSourceSeconds(sceneFrame) >= sourceSeconds) return sceneFrame
  }
  return null
}

/** Whether a frame of the walk scene is fast enough for motion blur. */
export function isWalkFootageFast(sceneFrame: number): boolean {
  return readPlaybackSpeed(sceneFrame) >= MOTION_BLUR_MINIMUM_SPEED
}
