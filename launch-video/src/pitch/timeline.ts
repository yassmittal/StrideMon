import { type PitchSceneId, pitchLines, pitchSceneIds } from './script'
import voiceTiming from './voice-timing.json'

// The pitch video is cut to its voice: src/pitch/voice-timing.json holds when each line of
// script.ts starts and ends (scripts/pitch-voice.ts writes it). Every scene, caption and footage
// segment derives from it, so a new voice take re-times the whole film.

export const PITCH_FRAMES_PER_SECOND = 30
export const PITCH_WIDTH = 1920
export const PITCH_HEIGHT = 1080

/** A scene's picture arrives this long before its first line is spoken. */
const SCENE_LEAD_SECONDS = 0.45
/** The end card holds after the last word, so the disclaimer can be read. */
const END_CARD_HOLD_SECONDS = 4
/** A caption stays up at most this long after its line ends, unless the next one replaces it. */
const CAPTION_HOLD_SECONDS = 1.2

function toFrame(seconds: number): number {
  return Math.round(seconds * PITCH_FRAMES_PER_SECOND)
}

if (voiceTiming.lines.length !== pitchLines.length) {
  throw new Error(
    `voice-timing.json has ${voiceTiming.lines.length} lines, script.ts has ${pitchLines.length}. Re-run scripts/pitch-voice.ts.`,
  )
}

export type TimedLine = {
  lineIndex: number
  scene: PitchSceneId
  text: string
  startFrame: number
  endFrame: number
  /** Until the next caption, or the hold, whichever is first. */
  captionEndFrame: number
}

export const timedLines: readonly TimedLine[] = pitchLines.map((line, lineIndex) => {
  const timing = voiceTiming.lines[lineIndex]
  const nextTiming = voiceTiming.lines[lineIndex + 1]
  if (timing === undefined) throw new Error(`No timing for line ${lineIndex}`)
  const holdEndSeconds = timing.endSeconds + CAPTION_HOLD_SECONDS
  const captionEndSeconds =
    nextTiming === undefined ? holdEndSeconds : Math.min(holdEndSeconds, nextTiming.startSeconds)
  return {
    lineIndex,
    scene: line.scene,
    text: line.text,
    startFrame: toFrame(timing.startSeconds),
    endFrame: toFrame(timing.endSeconds),
    captionEndFrame: toFrame(captionEndSeconds),
  }
})

export const PITCH_DURATION_IN_FRAMES = toFrame(voiceTiming.durationSeconds + END_CARD_HOLD_SECONDS)

export type SceneRange = { scene: PitchSceneId; startFrame: number; durationInFrames: number }

export const sceneRanges: readonly SceneRange[] = pitchSceneIds.map((scene, sceneIndex) => {
  const startFrame = readSceneStartFrame(scene, sceneIndex)
  const nextScene = pitchSceneIds[sceneIndex + 1]
  const endFrame =
    nextScene === undefined
      ? PITCH_DURATION_IN_FRAMES
      : readSceneStartFrame(nextScene, sceneIndex + 1)
  return { scene, startFrame, durationInFrames: endFrame - startFrame }
})

function readSceneStartFrame(scene: PitchSceneId, sceneIndex: number): number {
  if (sceneIndex === 0) return 0
  const firstLine = timedLines.find((line) => line.scene === scene)
  if (firstLine === undefined) throw new Error(`Scene ${scene} has no lines`)
  return firstLine.startFrame - toFrame(SCENE_LEAD_SECONDS)
}

/** The scene's own lines, with frames relative to the scene's start. */
export function readSceneLines(scene: PitchSceneId): TimedLine[] {
  const range = readSceneRange(scene)
  return timedLines
    .filter((line) => line.scene === scene)
    .map((line) => ({
      ...line,
      startFrame: line.startFrame - range.startFrame,
      endFrame: line.endFrame - range.startFrame,
      captionEndFrame: line.captionEndFrame - range.startFrame,
    }))
}

export function readSceneRange(scene: PitchSceneId): SceneRange {
  const range = sceneRanges.find((candidate) => candidate.scene === scene)
  if (range === undefined) throw new Error(`No range for scene ${scene}`)
  return range
}

/** When the scene's nth line (0-based) starts, relative to the scene. */
export function readSceneLineStartFrame(scene: PitchSceneId, sceneLineIndex: number): number {
  const line = readSceneLines(scene)[sceneLineIndex]
  if (line === undefined) throw new Error(`Scene ${scene} has no line ${sceneLineIndex}`)
  return line.startFrame
}
