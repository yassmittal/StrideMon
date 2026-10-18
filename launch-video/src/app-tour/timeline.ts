// The App tour film's timeline: every section's frames, named once and derived from the beat grid
// in beats.ts (docs/app-tour-video-prompt.md §2). Today it follows the reference's own timing
// (reference.md): its wipes snap on beats 9.35, 17, 26, 31.5 and 39, its drop is on beat 32.5.
// Retiming to the chosen track means moving beats here, never typing frames elsewhere.

import {
  APP_TOUR_DURATION_IN_FRAMES,
  APP_TOUR_FRAMES_PER_SECOND,
  secondsToFrames,
  toBeatFrame,
} from './beats'
import { WIPE_SNAP_SECONDS } from './wipe'

const WIPE_SNAP_FRAMES = WIPE_SNAP_SECONDS * APP_TOUR_FRAMES_PER_SECOND

/** A wipe, from the beat its snap lands on. It starts 0.48 s before (wipe.ts). */
function buildWipe(snapBeat: number) {
  const snapFrame = toBeatFrame(snapBeat)
  return { startFrame: Math.round(snapFrame - WIPE_SNAP_FRAMES), snapFrame }
}

/** The intro, in frames from beat 0: the icon settles on it and the phone lands half a beat later. */
const INTRO_BEAT_FRAME = toBeatFrame(0)

export const coverTimeline = {
  /** Frames 0–7 show section 1's styleframe, so the auto-thumbnail isn't a bare icon. */
  endFrame: 8,
} as const

export const iconTimeline = {
  /** The icon rises in from below, already big (reference frames 4–7). */
  riseStartFrame: 8,
  riseEndFrame: 14,
  /** It grows a little (8–10)… */
  growEndFrame: 20,
  /** …punches past the frame (11–14)… */
  punchPeakFrame: 28,
  /** …and settles back to 62% on beat 0 (17–21). */
  settleFrame: INTRO_BEAT_FRAME,
  /** It collapses into the splash's tile while the screen grows from its edges (24–30). */
  collapseStartFrame: INTRO_BEAT_FRAME + 6,
  /** The phone's screen is out from behind the tile here, and the bezel starts to fade in. */
  screenOutFrame: INTRO_BEAT_FRAME + 10,
  landFrame: toBeatFrame(0.5),
} as const

/** Section 1, Meet StrideMon: the splash, minting, Home's Sneaker card drawing in, START A RUN. */
export const meetTimeline = {
  headlineFrame: toBeatFrame(1),
  /** The phone grows 58% → 64% (reference 1.33–2.33 s). */
  growStartFrame: toBeatFrame(1),
  growEndFrame: toBeatFrame(2.75),
  /** The splash slides up to "Minting your Sneaker…". */
  mintingFrame: toBeatFrame(2.5),
  /** A hard cut to Home; the Sneaker card's art draws itself, the bars fill. */
  homeFrame: toBeatFrame(4.5),
  /** The phone shrinks back to 58% while the screens change (reference 3.1–3.9 s). */
  shrinkStartFrame: toBeatFrame(3),
  shrinkEndFrame: toBeatFrame(5),
  /** Home scrolls up to START A RUN (the reel's own scroll, 14.6–14.9 s). */
  scrollFrame: toBeatFrame(7.25),
  /** Tap 1, on START A RUN. */
  tapFrame: toBeatFrame(8),
} as const

/** Section 2, Walk or run: the run, ramped, with a push-in on its counters. */
const walkWipe = buildWipe(9.35)
export const walkTimeline = {
  /** The run screen comes in on the tap (the location prompt is cut). */
  runFrame: meetTimeline.tapFrame + 6,
  wipeStartFrame: walkWipe.startFrame,
  wipeSnapFrame: walkWipe.snapFrame,
  /** The estimate turns +10 STRIDE here, at normal speed (the reel's 22.90 s). */
  plusTenFrame: toBeatFrame(13),
  pushInStartFrame: secondsToFrames(7.4),
  pushInEndFrame: toBeatFrame(13),
  pullBackEndFrame: toBeatFrame(14.75),
  /** Tap 2, on STOP. The STOP footage's press lands on it. */
  stopTapFrame: toBeatFrame(15.5),
} as const

/** Section 3, Earn STRIDE: settling, the +10 STRIDE summary, the Sneaker tab. */
const earnWipe = buildWipe(17)
export const earnTimeline = {
  /** The STOP pill's spinner, the dialog cut. */
  spinnerFrame: walkTimeline.stopTapFrame + 12,
  settlingFrame: walkTimeline.stopTapFrame + 24,
  wipeStartFrame: earnWipe.startFrame,
  /** The summary arrives on the snap, with the push-in's jump. */
  summaryFrame: earnWipe.snapFrame,
  pushInEndFrame: earnWipe.snapFrame + 52,
  /** The camera glides down the summary; the app doesn't move. */
  glideEndFrame: toBeatFrame(21.75) - 36,
  /** Back to 61% as the summary leaves. */
  pullBackEndFrame: toBeatFrame(21.75),
  /** A tab tap cuts to the Sneaker tab, which scrolls to Repair (the reel's 34.7–36.2 s). */
  sneakerTabFrame: toBeatFrame(21.75),
  /** Tap 3, on REPAIR TO 100. */
  repairTapFrame: toBeatFrame(24.25),
} as const

/** Section 4, Keep it running: review, confirm, repaired, then the Upgrade panel. */
const repairWipe = buildWipe(26)
export const repairTimeline = {
  reviewFrame: earnTimeline.repairTapFrame + 16,
  wipeStartFrame: repairWipe.startFrame,
  wipeSnapFrame: repairWipe.snapFrame,
  /** Tap 4, on CONFIRM IN WALLET. MetaMask is cut. */
  confirmTapFrame: toBeatFrame(26.75),
  confirmingFrame: toBeatFrame(26.75) + 8,
  repairedFrame: toBeatFrame(27.75),
  /**
   * A hard cut to the Sneaker tab, scrolled to the Upgrade panel (rebuilt: the reel never upgrades
   * #3). The Upgrade button sits below the reel's tab bar, so a scroll wouldn't fit before the tap.
   */
  upgradePanelFrame: toBeatFrame(29.5),
  /** Tap 5, on UPGRADE TO LEVEL 2. */
  upgradeTapFrame: toBeatFrame(30),
} as const

/** Section 5, Level up: the music stops, the snap and "Level up." land in the silence, the drop. */
const levelUpWipe = buildWipe(31.5)
export const levelUpTimeline = {
  /** "Confirming on Monad…" slides up on the tap. */
  confirmingFrame: repairTimeline.upgradeTapFrame + 4,
  wipeStartFrame: levelUpWipe.startFrame,
  wipeSnapFrame: levelUpWipe.snapFrame,
  /** The drop: CONFIRMED ON MONAD, Level 2 reached. */
  dropFrame: toBeatFrame(32.5),
  /** The sheet slides down to the Sneaker card, which swaps to level 2. */
  sheetCloseFrame: toBeatFrame(34.5),
} as const

/** Section 6, End: the phone tilts off left as the lime wipe crosses over it. */
const endWipe = buildWipe(39)
export const endTimeline = {
  tiltStartFrame: secondsToFrames(23.4),
  wipeStartFrame: endWipe.startFrame,
  wipeSnapFrame: endWipe.snapFrame,
} as const

/** Section 7, the call to action. Its last frame is the poster's neighbour; the drift never stops. */
export const callToActionTimeline = {
  questionFrame: toBeatFrame(42),
  urlFrame: toBeatFrame(42.5),
  pillsFrame: toBeatFrame(43.5),
  endFrame: APP_TOUR_DURATION_IN_FRAMES,
} as const

/** The wipes in order: each brings in the named section. The last goes over the phone. */
export const appTourWipes = [
  { section: 'walk', ...walkWipe },
  { section: 'earn', ...earnWipe },
  { section: 'repair', ...repairWipe },
  { section: 'levelUp', ...levelUpWipe },
  { section: 'end', ...endWipe },
] as const

export type AppTourSceneName = 'intro' | 'meet' | 'walk' | 'earn' | 'repair' | 'levelUp' | 'end'

/** Where each section starts and ends, for the AppTourScenes-9x16 folder. */
export const appTourScenes: Record<AppTourSceneName, { startFrame: number; endFrame: number }> = {
  intro: { startFrame: 0, endFrame: meetTimeline.headlineFrame },
  meet: { startFrame: meetTimeline.headlineFrame, endFrame: walkWipe.startFrame },
  walk: { startFrame: walkWipe.startFrame, endFrame: earnWipe.startFrame },
  earn: { startFrame: earnWipe.startFrame, endFrame: repairWipe.startFrame },
  repair: { startFrame: repairWipe.startFrame, endFrame: levelUpWipe.startFrame },
  levelUp: { startFrame: levelUpWipe.startFrame, endFrame: endTimeline.tiltStartFrame },
  end: { startFrame: endTimeline.tiltStartFrame, endFrame: APP_TOUR_DURATION_IN_FRAMES },
}
