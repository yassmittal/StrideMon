// The Sneaker drop film's music grid (docs/sneaker-drop-video-prompt.md §1). "Drift Phonk" runs at
// 96.004 BPM, and scripts/fetch-audio.sh cuts clip A so each kick's attack starts on its beat,
// with beat 0 on frame 0. Same 60 fps as the other films; its own grid, so theirs never change.
// Every cut and move is a hit from hits.ts, which sits on this grid's 16ths.

export const SNEAKER_DROP_FRAMES_PER_SECOND = 60
export const SNEAKER_DROP_BEATS_PER_MINUTE = 96.004

/** About 37.5 frames. Each beat (and each 16th) rounds to its own nearest frame. */
export const sneakerDropBeatFrames =
  (SNEAKER_DROP_FRAMES_PER_SECOND * 60) / SNEAKER_DROP_BEATS_PER_MINUTE

/** The frame a beat falls on, counted from the film's first frame. Fractions are 8ths and 16ths. */
export function toSneakerDropBeatFrame(beat: number): number {
  return Math.round(beat * sneakerDropBeatFrames)
}

/** The music's shape, in beats (the brief's §1 table). */
export const musicBeats = {
  build: 4,
  drop: 8,
  /** The second 4-bar phrase of the eight bars. */
  secondPhrase: 24,
  /** The track's last bar, joined on this beat. */
  join: 40,
  /** The music stops; its tail decays to silence by the end. */
  stop: 44,
} as const

/** Where each scene starts, in beats. The last entry is the film's end (in frames: the tail). */
export const sneakerDropSceneStartBeats = {
  coldOpen: 0,
  build: musicBeats.build,
  drop: musicBeats.drop,
  escalation: musicBeats.secondPhrase,
  legendary: musicBeats.join,
  endCard: musicBeats.stop,
} as const

export type SneakerDropSceneName = keyof typeof sneakerDropSceneStartBeats

const SCENE_ORDER: readonly SneakerDropSceneName[] = [
  'coldOpen',
  'build',
  'drop',
  'escalation',
  'legendary',
  'endCard',
]

/** 30.03 s: the end card holds through the tail, which is silent by then. */
export const SNEAKER_DROP_DURATION_IN_FRAMES = 1802

export function readSneakerDropSceneStartFrame(sceneName: SneakerDropSceneName): number {
  return toSneakerDropBeatFrame(sneakerDropSceneStartBeats[sceneName])
}

export function readSneakerDropSceneDurationInFrames(sceneName: SneakerDropSceneName): number {
  const nextSceneName = SCENE_ORDER[SCENE_ORDER.indexOf(sceneName) + 1]
  const endFrame =
    nextSceneName === undefined
      ? SNEAKER_DROP_DURATION_IN_FRAMES
      : readSneakerDropSceneStartFrame(nextSceneName)
  return endFrame - readSneakerDropSceneStartFrame(sceneName)
}
