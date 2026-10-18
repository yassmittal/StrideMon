import { APP_TOUR_HEIGHT, APP_TOUR_WIDTH } from './beats'

// Where the App tour film's words sit, in frame pixels (1080 × 1920), from the reference's shares
// (reference.md). Every word stays above 78% of the height and 120 px clear of the right edge, out
// of the Reels and Shorts overlays.

const HEADLINE_FONT_SIZE = Math.round(0.095 * APP_TOUR_WIDTH)
/** Satoshi at line height 1: its cap top sits about 0.18 em under the line box's top. */
const SATOSHI_CAP_TOP_EM = 0.18

export const appTourLayout = {
  headlineFontSize: HEADLINE_FONT_SIZE,
  /** Satoshi Bold, as heavy as the reference's headlines (Yash, STOP 1; fonts.ts loads it). */
  headlineFontWeight: 700,
  /** The reference's first line has its cap top at 10.8% of the height. */
  headlineLineTop: Math.round(0.108 * APP_TOUR_HEIGHT - SATOSHI_CAP_TOP_EM * HEADLINE_FONT_SIZE),
  endCard: {
    /** The lockup's centre: the reference's logo sits at 38–53.5% of the height. */
    lockupCenterY: Math.round(0.455 * APP_TOUR_HEIGHT),
    wordmarkFontSize: 104,
    taglineTop: Math.round(0.565 * APP_TOUR_HEIGHT),
    taglineFontSize: 54,
    urlTop: Math.round(0.612 * APP_TOUR_HEIGHT),
    urlFontSize: 46,
    pillsTop: Math.round(0.67 * APP_TOUR_HEIGHT),
    pillFontSize: 30,
    pillGap: 18,
  },
} as const
