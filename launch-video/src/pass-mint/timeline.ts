// The Pass mint film's timeline: every film frame named once. 60 fps, 1920 × 1080.
//
// The footage is Yash's desktop recording of minting #0039 on the local stack
// (../desktopFounderPassMint.mp4, 40.1 s, Screen Studio's own zooms baked in). The film plays it as
// one remapped clock: each segment below shows a stretch of the recording at its own speed, so the
// flow keeps every step but none of the waiting. The cut:
//
//   hook     the reveal first (#0039 flips into its card), with the promise on screen
//   rewind   the whole recording backwards in 0.67 s, to the start
//   pick     "1,000 Sneakers", the gallery, Cherry Runner Dawn, Mint #0039
//   email    the email and its code (the recording's trip to the terminal for the code is cut)
//   wallet   connect MetaMask and sign the free sign-in message
//   mint     Mint #0039, "Minting on Monad"
//   reveal   the same flip again, slower, now that it's earned
//   end      the end card

export const PASS_MINT_FRAMES_PER_SECOND = 60
export const PASS_MINT_WIDTH = 1920
export const PASS_MINT_HEIGHT = 1080
export const RECORDING_WIDTH = 1920
export const RECORDING_HEIGHT = 1080
/** The recording is 40.133 s: 2,408 frames. */
export const RECORDING_LAST_FRAME = 2407

export type PassMintStepName = 'pick' | 'email' | 'wallet' | 'mint'

/** A stretch of the recording: from `startSeconds` to `endSeconds`, at `speed` (2 = twice as fast). */
type RecordingSegment = {
  startSeconds: number
  endSeconds: number
  speed: number
}

/** A part of the film: its segments, back to back. */
type FilmPart = {
  name: 'hook' | 'rewind' | 'reveal' | PassMintStepName
  segments: RecordingSegment[]
}

/**
 * #0039's black card turns edge-on here in the recording, and the Sneaker side comes round: the
 * music's drop lands on it, twice. Measured on the rendered hook (frame 27).
 */
export const RECORDING_FLIP_SECONDS = 33.48

const filmParts: readonly FilmPart[] = [
  // From just before the flip, so the first second already moves.
  { name: 'hook', segments: [{ startSeconds: 33.05, endSeconds: 35.45, speed: 0.96 }] },
  // Backwards, from the hook's last frame to the gallery's "1,000 Sneakers." (handled below).
  { name: 'rewind', segments: [{ startSeconds: 35.45, endSeconds: 1.4, speed: 51 }] },
  {
    name: 'pick',
    segments: [
      { startSeconds: 1.4, endSeconds: 3.3, speed: 2 },
      { startSeconds: 3.3, endSeconds: 5.0, speed: 3.4 },
      { startSeconds: 5.0, endSeconds: 7.05, speed: 1.6 },
      { startSeconds: 7.05, endSeconds: 8.95, speed: 1.3 },
    ],
  },
  {
    name: 'email',
    segments: [
      { startSeconds: 8.95, endSeconds: 10.4, speed: 1.6 },
      { startSeconds: 10.4, endSeconds: 12.15, speed: 1 },
      // The cut: 12.15 → 19.4 s is the terminal, where the local stack logs the code.
      { startSeconds: 19.4, endSeconds: 20.45, speed: 1 },
    ],
  },
  {
    name: 'wallet',
    segments: [
      { startSeconds: 20.45, endSeconds: 24.1, speed: 2 },
      { startSeconds: 24.1, endSeconds: 25.4, speed: 2.4 },
      // The sign-in message, at full speed so it reads.
      { startSeconds: 25.4, endSeconds: 26.75, speed: 1 },
      { startSeconds: 26.75, endSeconds: 27.9, speed: 2 },
    ],
  },
  {
    name: 'mint',
    segments: [
      { startSeconds: 27.9, endSeconds: 28.9, speed: 1 },
      { startSeconds: 28.9, endSeconds: 30.3, speed: 2 },
      { startSeconds: 30.3, endSeconds: 32.95, speed: 1.5 },
    ],
  },
  { name: 'reveal', segments: [{ startSeconds: 32.95, endSeconds: 35.45, speed: 0.8 }] },
]

type TimedSegment = RecordingSegment & { startFrame: number; endFrame: number }

const timedSegments: TimedSegment[] = []
const partFrames = new Map<FilmPart['name'], { startFrame: number; endFrame: number }>()
let nextFrame = 0
for (const part of filmParts) {
  const partStartFrame = nextFrame
  for (const segment of part.segments) {
    const lengthSeconds = Math.abs(segment.endSeconds - segment.startSeconds)
    const durationFrames = Math.round((lengthSeconds / segment.speed) * PASS_MINT_FRAMES_PER_SECOND)
    timedSegments.push({ ...segment, startFrame: nextFrame, endFrame: nextFrame + durationFrames })
    nextFrame += durationFrames
  }
  partFrames.set(part.name, { startFrame: partStartFrame, endFrame: nextFrame })
}

function readPartFrames(name: FilmPart['name']): { startFrame: number; endFrame: number } {
  const frames = partFrames.get(name)
  if (frames === undefined) throw new Error(`No film part named ${name}`)
  return frames
}

export const hookTimeline = {
  ...readPartFrames('hook'),
  /** The second line of the promise comes in once the first has landed. */
  secondLineFrame: 40,
} as const
export const rewindTimeline = readPartFrames('rewind')
export const revealTimeline = readPartFrames('reveal')

export const stepTimelines: Record<PassMintStepName, { startFrame: number; endFrame: number }> = {
  pick: readPartFrames('pick'),
  email: readPartFrames('email'),
  wallet: readPartFrames('wallet'),
  mint: readPartFrames('mint'),
}
export const passMintStepOrder: readonly PassMintStepName[] = ['pick', 'email', 'wallet', 'mint']

const END_CARD_FRAMES = 180
export const endCardTimeline = {
  startFrame: revealTimeline.endFrame,
  /** Each line lands this far apart. */
  lineStaggerFrames: 10,
  pillFrame: revealTimeline.endFrame + 34,
  endFrame: revealTimeline.endFrame + END_CARD_FRAMES,
} as const

export const PASS_MINT_DURATION_IN_FRAMES = endCardTimeline.endFrame

/** Where the email's terminal detour was cut: the film frame the recording jumps on. */
export const emailCutFrame =
  timedSegments.find((segment) => segment.startSeconds === 19.4)?.startFrame ?? 0

/** The film frames the card flips on, in the hook and in the reveal. */
export const hookFlipFrame = readFilmFrameAtRecordingSeconds(RECORDING_FLIP_SECONDS, 'hook')
export const revealFlipFrame = readFilmFrameAtRecordingSeconds(RECORDING_FLIP_SECONDS, 'reveal')

/** The reveal's caption, once the card has settled. */
export const revealCaptionFrame = revealFlipFrame + 36

/** The recording second shown on a film frame (end card: the last frame of the reveal). */
export function readRecordingSecondsAtFrame(frame: number): number {
  for (const segment of timedSegments) {
    if (frame >= segment.startFrame && frame < segment.endFrame) {
      const progress = (frame - segment.startFrame) / (segment.endFrame - segment.startFrame)
      // The rewind eases in and out, so it reads as a tape winding back, not a jump.
      const easedProgress =
        segment.endSeconds < segment.startSeconds
          ? (1 - Math.cos(Math.PI * progress)) / 2
          : progress
      return segment.startSeconds + (segment.endSeconds - segment.startSeconds) * easedProgress
    }
  }
  const lastSegment = timedSegments[timedSegments.length - 1]
  return lastSegment === undefined ? 0 : lastSegment.endSeconds
}

/** The film frame a recording second plays on, within one part (forward parts only). */
export function readFilmFrameAtRecordingSeconds(
  recordingSeconds: number,
  partName: FilmPart['name'],
): number {
  const { startFrame, endFrame } = readPartFrames(partName)
  for (const segment of timedSegments) {
    if (segment.startFrame < startFrame || segment.endFrame > endFrame) continue
    if (recordingSeconds >= segment.startSeconds && recordingSeconds < segment.endSeconds) {
      const progress =
        (recordingSeconds - segment.startSeconds) / (segment.endSeconds - segment.startSeconds)
      return Math.round(segment.startFrame + progress * (segment.endFrame - segment.startFrame))
    }
  }
  throw new Error(`${recordingSeconds} s isn't shown in the ${partName}`)
}

/** The film frame a recording second plays on during the four steps. */
export function readStepFrameAtRecordingSeconds(recordingSeconds: number): number {
  const stepName = passMintStepOrder.find((name) => {
    const { startFrame, endFrame } = stepTimelines[name]
    return timedSegments.some(
      (segment) =>
        segment.startFrame >= startFrame &&
        segment.endFrame <= endFrame &&
        recordingSeconds >= segment.startSeconds &&
        recordingSeconds < segment.endSeconds,
    )
  })
  if (stepName === undefined) throw new Error(`${recordingSeconds} s isn't shown in a step`)
  return readFilmFrameAtRecordingSeconds(recordingSeconds, stepName)
}

/** Whether a film frame shows the recording backwards. */
export function isRewindFrame(frame: number): boolean {
  return frame >= rewindTimeline.startFrame && frame < rewindTimeline.endFrame
}

/**
 * The film's own camera over the recording, as keyframes in recording seconds (so it follows the
 * footage through every speed change): a zoom and the recording pixel it centres on. Between
 * keyframes it eases. The base zoom trims the wallpaper round Screen Studio's window. Where the
 * recording is wide (the wallet's sign-in and the mint), it frames the dialog or MetaMask, which
 * also keeps the browser's address bar and the left edge (the email) out of the picture.
 */
export type CameraKeyframe = { seconds: number; zoom: number; centerX: number; centerY: number }

const BASE: Omit<CameraKeyframe, 'seconds'> = { zoom: 1.08, centerX: 960, centerY: 540 }
const DIALOG: Omit<CameraKeyframe, 'seconds'> = { zoom: 1.75, centerX: 768, centerY: 576 }

export const cameraKeyframes: readonly CameraKeyframe[] = [
  { seconds: 0, ...BASE },
  { seconds: 12.15, ...BASE },
  // Back from the terminal the recording is wide: frame the dialog until Screen Studio zooms in.
  { seconds: 19.4, zoom: 1.5, centerX: 650, centerY: 530 },
  { seconds: 19.95, zoom: 1.5, centerX: 650, centerY: 530 },
  { seconds: 20.3, ...BASE },
  { seconds: 25.25, ...BASE },
  // MetaMask's sign-in message.
  { seconds: 25.55, zoom: 1.55, centerX: 1450, centerY: 560 },
  { seconds: 26.65, zoom: 1.55, centerX: 1450, centerY: 560 },
  { seconds: 26.95, ...BASE },
  { seconds: 29.0, ...BASE },
  { seconds: 29.6, ...DIALOG },
  { seconds: 33.0, ...DIALOG },
  // The card and "Founder 2 of 1,000", pushed in.
  { seconds: 34.2, zoom: 1.95, centerX: 768, centerY: 575 },
  { seconds: 40, zoom: 1.95, centerX: 768, centerY: 575 },
]

/** The hook's own camera: close on the card from the first frame, pushing in a little. */
export const hookCamera = {
  fromZoom: 2.05,
  toZoom: 2.2,
  centerX: 768,
  centerY: 575,
} as const

/** The recording seconds each mouse click lands on (a click sound in the steps). */
export const recordingClickSeconds: readonly number[] = [
  3.2, 7.1, 8.9, 10.0, 11.02, 11.58, 19.88, 20.62, 22.6, 24.05, 26.6, 28.72,
]
