import { Easing, interpolate } from 'remotion'
import { readSceneDurationInFrames } from './beats'
import { easings } from './theme'

// The walk's speed ramp, 1× → 6× → 1×, as a map from film frames to seconds of the recorded run
// (video2). The rebuilt run screen shows what the phone showed at that second (liveRunReadouts).

/** The walk starts at the run's 1:53 (FACTS.md §3). */
const WALK_START_SOURCE_SECONDS = 184.25
const FRAMES_PER_SECOND = 60

const HOLD_AT_START_FRAMES = 45
const RAMP_FRAMES = 45
const HOLD_AT_END_FRAMES = 45
// 6× keeps the whole walk inside the readouts FACTS.md lists (up to 212 s).
const TOP_SPEED = 6
/** Motion blur only where the screen moves fast: the 6× stretch and the steep part of each ramp. */
const MOTION_BLUR_MINIMUM_SPEED = 2

/** The playback speed at a film frame of the walk scene. */
function readPlaybackSpeed(sceneFrame: number): number {
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

/** The second of video2.mp4 the walk shows at a (possibly fractional) frame of the walk scene. */
export function toWalkSourceSeconds(sceneFrame: number): number {
  const wholeFrame = Math.floor(sceneFrame)
  const fraction = sceneFrame - wholeFrame
  const lower = cumulativeSourceFrames[wholeFrame] ?? cumulativeSourceFrames.at(-1) ?? 0
  const upper = cumulativeSourceFrames[wholeFrame + 1] ?? lower
  return WALK_START_SOURCE_SECONDS + (lower + (upper - lower) * fraction) / FRAMES_PER_SECOND
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
export function isWalkFast(sceneFrame: number): boolean {
  return readPlaybackSpeed(sceneFrame) >= MOTION_BLUR_MINIMUM_SPEED
}
