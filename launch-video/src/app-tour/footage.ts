import { interpolate } from 'remotion'
import {
  earnTimeline,
  iconTimeline,
  levelUpTimeline,
  meetTimeline,
  repairTimeline,
  walkTimeline,
} from './timeline'

// What the phone shows on every frame: the shot list (docs/app-tour-video-prompt.md §4). Footage
// comes from the submission reel, cut by scripts/cut-app-tour-footage.sh into 60 fps clips in
// public/footage/app-tour/ (FOOTAGE.md, "The App tour film", logs each one). Every clip frame below
// is a frame of that 60 fps clip; the reel second it shows is `clip start + frame / 60`.
// The rebuilt screens (the splash, Home's card drawing in, the repair's "Confirming on Monad…", the
// Sneaker tab after the repair and the whole upgrade) are vector components in components/screens/.
// The reel's own "Confirming on Monad…" (40.37–40.57 s) still shows the app switch's rounded corners
// and the launcher behind them, so it's rebuilt.

/** The reel's size: the phone's screen at 1080 × 2340, scaled by 2/3. */
export const REEL_WIDTH_PIXELS = 720
export const REEL_HEIGHT_PIXELS = 1560
/**
 * App points to reel pixels: the phone ran at a density of 2.8125 (a 384 pt wide window), times
 * 2/3. Measured on the reel's sheet at 41.2 s: the 64 pt badge is 120 px, the 45 pt close button
 * and Done pill 84 px, the 15 pt gutter 28 px. (Screenshot 03, which RunScreen matches, was taken
 * at 2.75.)
 */
export const REEL_PIXELS_PER_POINT = (2.8125 * 2) / 3

export type AppTourClipName =
  | 'minting'
  | 'home'
  | 'home-scroll'
  | 'run'
  | 'stop-press'
  | 'stop-spinner'
  | 'settling'
  | 'summary'
  | 'sneaker-tab'
  | 'repair-review'
  | 'repair-done'

/** Each clip's first second in the reel and its length in 60 fps frames (the cut script's list). */
export const appTourClips: Record<
  AppTourClipName,
  { reelStartSeconds: number; frameCount: number }
> = {
  minting: { reelStartSeconds: 6.5, frameCount: 178 },
  home: { reelStartSeconds: 10.1, frameCount: 66 },
  'home-scroll': { reelStartSeconds: 14.1, frameCount: 90 },
  run: { reelStartSeconds: 16.5, frameCount: 516 },
  'stop-press': { reelStartSeconds: 25.6, frameCount: 48 },
  'stop-spinner': { reelStartSeconds: 27.4, frameCount: 58 },
  settling: { reelStartSeconds: 28.4, frameCount: 154 },
  summary: { reelStartSeconds: 31.0, frameCount: 210 },
  'sneaker-tab': { reelStartSeconds: 34.7, frameCount: 106 },
  'repair-review': { reelStartSeconds: 36.5, frameCount: 60 },
  'repair-done': { reelStartSeconds: 40.6, frameCount: 120 },
}

/** The clip frame (at 60 fps) where something in the reel happens, from its reel second. */
function toClipFrame(clipName: AppTourClipName, reelSeconds: number): number {
  return Math.round((reelSeconds - appTourClips[clipName].reelStartSeconds) * 60)
}

/** Reel moments the cut lands on (FOOTAGE.md). */
export const reelMoments = {
  /** Home, the card drawn, before the reel leaves for Profile (the frame behind the draw-in). */
  homeStill: toClipFrame('home', 10.5),
  /** Home scrolls from the top to START A RUN (14.6–14.9 s), which is pressed at 15.4 s. */
  homeScrollStart: toClipFrame('home-scroll', 14.6),
  homeScrollEnd: toClipFrame('home-scroll', 14.9),
  startPress: toClipFrame('home-scroll', 15.4),
  /** The estimate turns +10 STRIDE (the run's 2:09). */
  plusTen: toClipFrame('run', 22.9),
  /** The STOP pill steps darker. */
  stopPress: toClipFrame('stop-press', 26.15),
  /** REPAIR TO 100 steps darker. */
  repairPress: toClipFrame('sneaker-tab', 36.2),
  /** CONFIRM IN WALLET: the touch shows, then the button greys. */
  confirmPress: toClipFrame('repair-review', 37.33),
} as const

/** A clip on screen from `startFrame`, with film frames mapped to its frames. */
export type FootageShot = {
  kind: 'footage'
  clipName: AppTourClipName
  startFrame: number
  /** The clip frame shown on a (possibly fractional) film frame. */
  readClipFrame: (frame: number) => number
}

/** A rebuilt screen on from `startFrame`. Each names its own state; the film's code draws it. */
export type RebuiltShot = {
  kind: 'splash' | 'homeDrawIn' | 'repairConfirming' | 'sneakerTabUpgrade' | 'upgradeSheet'
  startFrame: number
}

export type AppTourShot = FootageShot | RebuiltShot

/** Plays the clip at 1× from `clipStartFrame`, held on its last frame. */
function playFrom(clipName: AppTourClipName, startFrame: number, clipStartFrame = 0) {
  const lastFrame = appTourClips[clipName].frameCount - 1
  return (frame: number) => Math.min(lastFrame, Math.max(0, clipStartFrame + frame - startFrame))
}

/** Maps film frames to clip frames through keyframes, linear between them, held at the ends. */
function mapThrough(filmFrames: readonly number[], clipFrames: readonly number[]) {
  return (frame: number) =>
    interpolate(frame, filmFrames, clipFrames, {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
}

/**
 * The run, ramped (like walk-ramp.ts): 1× as it starts, faster through the walk, 1× again as the
 * estimate turns +10 STRIDE (on its beat, under the push-in), then faster to 2:29 for the STOP tap.
 * Each stretch is a cubic Hermite with a speed of 1 at both ends, so the speed never jumps.
 */
const runEndFrame = walkTimeline.stopTapFrame - reelMoments.stopPress
const runAnchors = [
  { frame: walkTimeline.runFrame, clipFrame: 0 },
  { frame: walkTimeline.plusTenFrame, clipFrame: reelMoments.plusTen },
  { frame: runEndFrame, clipFrame: appTourClips.run.frameCount - 1 },
] as const

export function readRunClipFrame(frame: number): number {
  const first = runAnchors[0]
  const last = runAnchors[runAnchors.length - 1] ?? first
  if (frame <= first.frame) return first.clipFrame
  if (frame >= last.frame) return last.clipFrame
  for (let index = 0; index < runAnchors.length - 1; index += 1) {
    const from = runAnchors[index]
    const to = runAnchors[index + 1]
    if (from === undefined || to === undefined || frame > to.frame) continue
    const duration = to.frame - from.frame
    const t = (frame - from.frame) / duration
    // Speed 1 (one clip frame per film frame) at both ends, in units of the stretch.
    const tangent = duration
    const t2 = t * t
    const t3 = t2 * t
    return (
      (2 * t3 - 3 * t2 + 1) * from.clipFrame +
      (t3 - 2 * t2 + t) * tangent +
      (-2 * t3 + 3 * t2) * to.clipFrame +
      (t3 - t2) * tangent
    )
  }
  return last.clipFrame
}

const homeScrollStartFrame = meetTimeline.scrollFrame
const homeScrollEndFrame =
  homeScrollStartFrame + (reelMoments.homeScrollEnd - reelMoments.homeScrollStart)
const stopPressStartFrame = walkTimeline.stopTapFrame - reelMoments.stopPress

/** Every shot in order; each lasts until the next one starts. */
export const appTourShots: readonly AppTourShot[] = [
  { kind: 'splash', startFrame: iconTimeline.screenOutFrame },
  {
    kind: 'footage',
    clipName: 'minting',
    startFrame: meetTimeline.mintingFrame,
    readClipFrame: playFrom('minting', meetTimeline.mintingFrame),
  },
  { kind: 'homeDrawIn', startFrame: meetTimeline.homeFrame },
  {
    kind: 'footage',
    clipName: 'home-scroll',
    startFrame: homeScrollStartFrame,
    // The reel's scroll at 1×, then a hold on Home's bottom until the press lands on the tap.
    readClipFrame: mapThrough(
      [homeScrollStartFrame, homeScrollEndFrame, meetTimeline.tapFrame - 4, meetTimeline.tapFrame],
      [
        reelMoments.homeScrollStart,
        reelMoments.homeScrollEnd,
        reelMoments.startPress - 4,
        reelMoments.startPress,
      ],
    ),
  },
  {
    kind: 'footage',
    clipName: 'run',
    startFrame: walkTimeline.runFrame,
    readClipFrame: readRunClipFrame,
  },
  {
    kind: 'footage',
    clipName: 'stop-press',
    startFrame: stopPressStartFrame,
    readClipFrame: playFrom('stop-press', stopPressStartFrame),
  },
  {
    kind: 'footage',
    clipName: 'stop-spinner',
    startFrame: earnTimeline.spinnerFrame,
    readClipFrame: playFrom('stop-spinner', earnTimeline.spinnerFrame),
  },
  {
    kind: 'footage',
    clipName: 'settling',
    startFrame: earnTimeline.settlingFrame,
    readClipFrame: playFrom('settling', earnTimeline.settlingFrame),
  },
  {
    kind: 'footage',
    clipName: 'summary',
    startFrame: earnTimeline.summaryFrame,
    readClipFrame: playFrom('summary', earnTimeline.summaryFrame),
  },
  {
    kind: 'footage',
    clipName: 'sneaker-tab',
    startFrame: earnTimeline.sneakerTabFrame,
    // The tab opens (its ripple is the reel's own), scrolls to Repair, and REPAIR TO 100 is pressed
    // on tap 3: about 1× from the cut.
    readClipFrame: mapThrough(
      [earnTimeline.sneakerTabFrame, earnTimeline.repairTapFrame],
      [0, reelMoments.repairPress],
    ),
  },
  {
    kind: 'footage',
    clipName: 'repair-review',
    startFrame: repairTimeline.reviewFrame,
    // The review holds a little longer than the reel's (so it reads), and the press lands on tap 4.
    readClipFrame: mapThrough(
      [repairTimeline.reviewFrame, repairTimeline.confirmTapFrame],
      [0, reelMoments.confirmPress],
    ),
  },
  { kind: 'repairConfirming', startFrame: repairTimeline.confirmingFrame },
  {
    kind: 'footage',
    clipName: 'repair-done',
    startFrame: repairTimeline.repairedFrame,
    readClipFrame: playFrom('repair-done', repairTimeline.repairedFrame),
  },
  { kind: 'sneakerTabUpgrade', startFrame: repairTimeline.upgradePanelFrame },
  { kind: 'upgradeSheet', startFrame: levelUpTimeline.confirmingFrame },
]

/** The shot on screen at a frame, or null before the phone's screen is out. */
export function findAppTourShot(frame: number): AppTourShot | null {
  let current: AppTourShot | null = null
  for (const shot of appTourShots) {
    if (shot.startFrame <= frame) current = shot
  }
  return current
}
