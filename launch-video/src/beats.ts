// The edit's music grid. Cuts, flips, punch-ins and counter landings sit on beats. To re-time the
// film to a track, change BEATS_PER_MINUTE (and, if the track's first downbeat isn't at 0 s,
// trim the music's start so it is). The picture stays 45 s; the end card absorbs any difference.

export const FRAMES_PER_SECOND = 60
export const BEATS_PER_MINUTE = 120
export const FILM_DURATION_IN_FRAMES = 45 * FRAMES_PER_SECOND

/** 30 frames at 120 BPM and 60 fps. */
export const beatFrames = (FRAMES_PER_SECOND * 60) / BEATS_PER_MINUTE

/** Where each scene starts on the grid, in beats from the first frame. */
export const sceneStartBeats = {
  coldOpen: 0,
  walk: 6,
  earn: 16,
  upgrade: 30,
  ownIt: 48,
  rules: 62,
  endCard: 76,
} as const

export type SceneName = keyof typeof sceneStartBeats

const SCENE_ORDER: readonly SceneName[] = [
  'coldOpen',
  'walk',
  'earn',
  'upgrade',
  'ownIt',
  'rules',
  'endCard',
]

/** The frame a beat falls on, counted from the start of the film. */
export function toBeatFrame(beatIndex: number): number {
  return Math.round(beatIndex * beatFrames)
}

export function readSceneStartFrame(sceneName: SceneName): number {
  return toBeatFrame(sceneStartBeats[sceneName])
}

export function readSceneDurationInFrames(sceneName: SceneName): number {
  const nextSceneName = SCENE_ORDER[SCENE_ORDER.indexOf(sceneName) + 1]
  const endFrame =
    nextSceneName === undefined ? FILM_DURATION_IN_FRAMES : readSceneStartFrame(nextSceneName)
  return endFrame - readSceneStartFrame(sceneName)
}

/**
 * A beat inside a scene, as frames from that scene's first frame. Fractions are allowed
 * (`1.5` is the off-beat) and still land on the film's grid.
 */
export function toSceneBeatFrame(sceneName: SceneName, beatIndex: number): number {
  return (
    toBeatFrame(sceneStartBeats[sceneName] + beatIndex) - toBeatFrame(sceneStartBeats[sceneName])
  )
}
