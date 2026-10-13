// Where everything sits in the waitlist film's 4:5 master (1080 × 1350). Pixels in the composition.
// Type sizes follow docs/launch-video-prompt.md §4: headlines 100 px and up, meta at least 30 px,
// mono callouts at least 56 px.

import type { Box, Point } from '../layouts'

export const WAITLIST_WIDTH = 1080
export const WAITLIST_HEIGHT = 1350
const GUTTER = 60

/** The site's waitlist panel is 385 px wide in a 1080 window; the film draws it 2.5× that. */
export const FORM_SCALE = 2.5

export const waitlistLayout = {
  gutter: GUTTER,
  metaFontSize: 30,
  metaTop: 70,
  hook: {
    headline: { left: GUTTER, top: 150 } satisfies Point,
    headlineFontSize: 140,
    /** The shoe, cropped from the Founder Sneaker picture, at this width. */
    sneaker: { left: 0, top: 560, width: 1080 } as const,
  },
  collection: {
    grid: { left: GUTTER, top: 60, width: 960, height: 960 } satisfies Box,
    gridGap: 15,
    /** The one card after the punch-in, and the Legendary. */
    card: { left: 150, top: 60, width: 780, height: 780 } satisfies Box,
    callout: { left: 150, top: 880 } satisfies Point,
    calloutFontSize: 56,
    headline: { left: GUTTER, top: 1110 } satisfies Point,
    headlineFontSize: 100,
  },
  pass: {
    /** On the margin, not centred like the punch-in's: the same card, now as yours. */
    card: { left: GUTTER, top: 100, width: 760, height: 760 } satisfies Box,
    passHeadline: { left: GUTTER, top: 920 } satisfies Point,
    /** The Founder Sneaker picture, cropped above its level and durability rows. */
    founderSneaker: { left: 90, top: 70, width: 900 } as const,
    founderSneakerHeadline: { left: GUTTER, top: 1000 } satisfies Point,
    headlineFontSize: 100,
  },
  promise: {
    lines: { left: GUTTER, top: 420 } satisfies Point,
    lineGap: 180,
    lineFontSize: 108,
    counter: { left: GUTTER, top: 1230 } satisfies Point,
  },
  ask: {
    headline: { left: GUTTER, top: 150 } satisfies Point,
    headlineFontSize: 106,
    sentence: { left: GUTTER, top: 275 } satisfies Point,
    sentenceFontSize: 106,
    panel: { left: GUTTER, top: 600, width: 960 } as const,
  },
  endCard: {
    pill: { left: GUTTER, top: 620 } satisfies Point,
    pillHeight: 150,
    pillFontSize: 64,
    brand: { left: GUTTER, top: 1110 } satisfies Point,
    wordmarkFontSize: 72,
  },
} as const
