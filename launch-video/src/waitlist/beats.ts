// The waitlist film's music grid (docs/waitlist-video-prompt.md §2). Cuts, flips, row landings and
// presses sit on beats of the track (CREDITS.md), measured at 124.052 BPM. Same 60 fps as the
// launch film; its own grid, so the launch film's beats.ts never changes.

export const WAITLIST_FRAMES_PER_SECOND = 60
export const WAITLIST_BEATS_PER_MINUTE = 124.052

/** About 29 frames: a beat is a fraction of a frame off the grid, so every beat rounds to a frame. */
export const waitlistBeatFrames = (WAITLIST_FRAMES_PER_SECOND * 60) / WAITLIST_BEATS_PER_MINUTE

/** Where each scene starts, in beats from the first frame. The last entry is the film's end. */
export const waitlistSceneStartBeats = {
  hook: 0,
  collection: 6,
  pass: 15,
  promise: 25,
  ask: 32,
  end: 47,
} as const

export type WaitlistSceneName = Exclude<keyof typeof waitlistSceneStartBeats, 'end'>

const SCENE_ORDER: readonly (keyof typeof waitlistSceneStartBeats)[] = [
  'hook',
  'collection',
  'pass',
  'promise',
  'ask',
  'end',
]

/** The frame a beat falls on, counted from the start of the film. */
export function toWaitlistBeatFrame(beatIndex: number): number {
  return Math.round(beatIndex * waitlistBeatFrames)
}

export const WAITLIST_DURATION_IN_FRAMES = toWaitlistBeatFrame(waitlistSceneStartBeats.end)

export function readWaitlistSceneStartFrame(sceneName: WaitlistSceneName): number {
  return toWaitlistBeatFrame(waitlistSceneStartBeats[sceneName])
}

export function readWaitlistSceneDurationInFrames(sceneName: WaitlistSceneName): number {
  const nextSceneName = SCENE_ORDER[SCENE_ORDER.indexOf(sceneName) + 1] ?? 'end'
  return (
    toWaitlistBeatFrame(waitlistSceneStartBeats[nextSceneName]) -
    readWaitlistSceneStartFrame(sceneName)
  )
}

/**
 * A beat inside a scene, as frames from that scene's first frame. Fractions are allowed (`1.5` is
 * the off-beat) and still land on the film's grid.
 */
export function toWaitlistSceneBeatFrame(sceneName: WaitlistSceneName, beatIndex: number): number {
  const sceneStartBeat = waitlistSceneStartBeats[sceneName]
  return toWaitlistBeatFrame(sceneStartBeat + beatIndex) - toWaitlistBeatFrame(sceneStartBeat)
}
