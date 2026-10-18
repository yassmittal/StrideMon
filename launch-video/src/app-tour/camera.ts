import { interpolate } from 'remotion'
import { easings } from '../theme'
import { APP_TOUR_HEIGHT, APP_TOUR_WIDTH } from './beats'
import {
  earnTimeline,
  endTimeline,
  levelUpTimeline,
  meetTimeline,
  repairTimeline,
  walkTimeline,
} from './timeline'

// The phone's camera: one framing per frame, so every transform of the phone lives here
// (docs/app-tour-video-prompt.md §4). Sizes are the reference's (reference.md, "The phone"): it
// lands at 57.8% of the width with its top at 23.5%, breathes to 64% and back, pushes in to 70–79%
// with its top kept under the headline (so its bottom leaves the frame), and tilts off left.

export type PhoneFraming = {
  /** The phone's outer width as a share of the frame's width. */
  widthShare: number
  /** The phone's top edge, in frame pixels (before rotation). */
  top: number
  /** The phone's horizontal centre, in frame pixels. */
  centerX: number
  /** Degrees; negative is counter-clockwise. About the phone's centre. */
  rotation: number
}

type FramingProperty = keyof PhoneFraming

const toTop = (heightShare: number) => heightShare * APP_TOUR_HEIGHT

/** Where the phone lands (frame 60 at 30 fps × 2): 57.8% wide, its top at 23.5%. */
export const REST_FRAMING: PhoneFraming = {
  widthShare: 0.578,
  top: toTop(0.235),
  centerX: APP_TOUR_WIDTH / 2,
  rotation: 0,
}
/** Grown, as the reference's phone is after its first second: 63.9%, its top at 21.6%. */
const GROWN_FRAMING: Partial<PhoneFraming> = { widthShare: 0.639, top: toTop(0.216) }

/** An eased move of some properties to new values, starting from wherever they are. */
type CameraMove = {
  fromFrame: number
  toFrame: number
  to: Partial<PhoneFraming>
  easing: (progress: number) => number
}

/** Drifts are continuous, so linear (launch-video-prompt.md §4). */
const linearEase = (progress: number) => progress

/** The tilt-off: an ease-in, like a throw (the reference's edge speeds up to the cut). */
const throwEase = (progress: number) => progress ** 3

const cameraMoves: readonly CameraMove[] = [
  // Section 1: grows as the headline rises, shrinks back while the screens change.
  {
    fromFrame: meetTimeline.growStartFrame,
    toFrame: meetTimeline.growEndFrame,
    to: GROWN_FRAMING,
    easing: easings.standard,
  },
  {
    fromFrame: meetTimeline.shrinkStartFrame,
    toFrame: meetTimeline.shrinkEndFrame,
    to: { widthShare: REST_FRAMING.widthShare, top: REST_FRAMING.top },
    easing: easings.standard,
  },
  // Section 2: grows with the wipe, then pushes in on the counters as +10 STRIDE lands.
  {
    fromFrame: walkTimeline.wipeSnapFrame,
    toFrame: walkTimeline.wipeSnapFrame + 66,
    to: { widthShare: 0.639, top: toTop(0.204) },
    easing: easings.standard,
  },
  {
    fromFrame: walkTimeline.pushInStartFrame,
    toFrame: walkTimeline.pushInEndFrame,
    to: { widthShare: 0.7, top: toTop(0.19) },
    easing: easings.standard,
  },
  {
    fromFrame: walkTimeline.pushInEndFrame + 12,
    toFrame: walkTimeline.pullBackEndFrame,
    to: { widthShare: 0.639, top: toTop(0.204) },
    easing: easings.standard,
  },
  // Section 3: on the snap the phone jumps in on +10 STRIDE and settles (footage: at most ~72%).
  {
    fromFrame: earnTimeline.summaryFrame,
    toFrame: earnTimeline.summaryFrame,
    to: { widthShare: 0.76, top: toTop(0.2) },
    easing: easings.standard,
  },
  {
    fromFrame: earnTimeline.summaryFrame,
    toFrame: earnTimeline.pushInEndFrame,
    to: { widthShare: 0.72, top: toTop(0.205) },
    easing: easings.outExpo,
  },
  // The glide down the summary: the camera moves, the app doesn't.
  {
    fromFrame: earnTimeline.pushInEndFrame,
    toFrame: earnTimeline.glideEndFrame,
    to: { widthShare: 0.74, top: toTop(0.17) },
    easing: easings.standard,
  },
  {
    fromFrame: earnTimeline.glideEndFrame,
    toFrame: earnTimeline.pullBackEndFrame,
    to: { widthShare: 0.61, top: toTop(0.23) },
    easing: easings.standard,
  },
  // Section 4: the review and the result at 61%, creeping in (never a dead frame), then a little in
  // for the Upgrade panel.
  {
    fromFrame: earnTimeline.pullBackEndFrame,
    toFrame: repairTimeline.upgradePanelFrame,
    to: { widthShare: 0.62 },
    easing: linearEase,
  },
  {
    fromFrame: repairTimeline.upgradePanelFrame,
    toFrame: repairTimeline.upgradePanelFrame,
    to: { widthShare: 0.64, top: toTop(0.215) },
    easing: easings.standard,
  },
  // Section 5: on the drop, a cut back to rest (as the reference cuts to 57.8% after its drop), so
  // the whole sheet is in frame while Level 1 → 2 and Efficiency 10 → 12 roll; then, as the sheet
  // slides down, a push-in on the card's level and efficiency.
  {
    fromFrame: levelUpTimeline.dropFrame,
    toFrame: levelUpTimeline.dropFrame,
    to: { widthShare: REST_FRAMING.widthShare, top: REST_FRAMING.top },
    easing: linearEase,
  },
  {
    fromFrame: levelUpTimeline.sheetCloseFrame,
    toFrame: levelUpTimeline.sheetCloseFrame + 42,
    to: { widthShare: 0.79, top: toTop(0.2) },
    easing: easings.standard,
  },
  // The card holds, creeping in, until the tilt.
  {
    fromFrame: levelUpTimeline.sheetCloseFrame + 42,
    toFrame: endTimeline.tiltStartFrame,
    to: { widthShare: 0.8 },
    easing: linearEase,
  },
  // Section 6: tilts counter-clockwise and slides off left, accelerating, under the lime wipe.
  {
    fromFrame: endTimeline.tiltStartFrame,
    toFrame: endTimeline.wipeSnapFrame,
    to: { rotation: -14, centerX: -0.35 * APP_TOUR_WIDTH },
    easing: throwEase,
  },
]

/** The phone's framing on a (possibly fractional) frame. Before it lands, IconToPhone draws it. */
export function readPhoneFraming(frame: number): PhoneFraming {
  const framing = { ...REST_FRAMING }
  for (const move of cameraMoves) {
    if (frame < move.fromFrame) continue
    const progress =
      move.toFrame === move.fromFrame
        ? 1
        : interpolate(frame, [move.fromFrame, move.toFrame], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: move.easing,
          })
    for (const property of Object.keys(move.to) as FramingProperty[]) {
      const target = move.to[property]
      if (target === undefined) continue
      framing[property] += (target - framing[property]) * progress
    }
  }
  return framing
}
