// Where everything sits, per format. Each format is laid out on its own, never a crop of the
// master. All values are pixels in the composition; 4:5 is the master.
//
// Every step scene shares one text block: a small step label at the top, and the headline and
// one plain sentence at the bottom. The scene's picture fills the space between them (in 16:9,
// the picture sits on the right and the text on the left).

export type FilmFormat = '4x5' | '16x9' | '9x16'

export type Box = { left: number; top: number; width: number; height: number }
export type Point = { left: number; top: number }

/**
 * A rectangle of a footage file (586 × 1280) shown at `scale`, with its top-left at `frame`.
 * Without `sourceLeft` and `sourceWidth`, it's the file's full width.
 */
export type FootageCrop = {
  sourceTop: number
  sourceHeight: number
  sourceLeft?: number
  sourceWidth?: number
  scale: number
  frame: Point
}

/** The text every step scene shares. */
export type StepTextLayout = {
  stepLabel: Point
  headline: Point
  headlineFontSize: number
  sentence: Point
  sentenceFontSize: number
}

export type FilmLayout = {
  width: number
  height: number
  gutter: number
  /** Platform UI covers these bands (9:16): no text inside them. */
  safeTop: number
  safeBottom: number
  metaFontSize: number
  monoCalloutFontSize: number
  stepText: StepTextLayout
  intro: { headline: Point; headlineFontSize: number; sentence: Point; sentenceFontSize: number }
  getSneaker: { art: Box }
  walk: {
    /** The phone's outer box, showing the rebuilt run screen. */
    phone: Box
    /** The first callout's top-left; the second sits `calloutGap` below it. */
    callouts: Point
    calloutGap: number
  }
  earn: {
    stopCrop: FootageCrop
    reward: {
      meta: Point
      number: Point
      numberFontSize: number
      symbolFontSize: number
      note: Point
    }
  }
  upgrade: { art: Box; callout: Point }
  ownIt: { art: Box; owner: Point; ownerFontSize: number }
  endCard: {
    headline: Point
    headlineFontSize: number
    panel: Box
    brand: Point
    pill: Point
    pillWidth: number
    disclaimer: Point
  }
}

// The phone in 4:5 and 9:16: the screen is 452 wide (1080 × 2340 at 0.4185), with an 8 px bezel.
const PHONE_SCREEN_ASPECT_RATIO = 2340 / 1080

/** A phone box from its outer width, keeping the run screen's aspect ratio. */
export function buildPhoneBox({
  left,
  top,
  outerWidth,
}: {
  left: number
  top: number
  outerWidth: number
}): Box {
  const bezel = readPhoneBezel(outerWidth)
  const screenWidth = outerWidth - 2 * bezel
  return {
    left,
    top,
    width: outerWidth,
    height: Math.round(screenWidth * PHONE_SCREEN_ASPECT_RATIO + 2 * bezel),
  }
}

// The website's phone frame is 296 px wide with a 5 px bezel and a 28 px radius. Scale both.
const WEBSITE_PHONE_WIDTH = 296
const WEBSITE_PHONE_BEZEL = 5
const WEBSITE_PHONE_RADIUS = 28

export function readPhoneBezel(outerWidth: number): number {
  return Math.round((outerWidth * WEBSITE_PHONE_BEZEL) / WEBSITE_PHONE_WIDTH)
}

export function readPhoneRadius(outerWidth: number): number {
  return Math.round((outerWidth * WEBSITE_PHONE_RADIUS) / WEBSITE_PHONE_WIDTH)
}

const masterLayout: FilmLayout = {
  width: 1080,
  height: 1350,
  gutter: 60,
  safeTop: 0,
  safeBottom: 0,
  metaFontSize: 30,
  monoCalloutFontSize: 72,
  stepText: {
    stepLabel: { left: 60, top: 70 },
    headline: { left: 60, top: 960 },
    headlineFontSize: 100,
    sentence: { left: 60, top: 1095 },
    sentenceFontSize: 52,
  },
  intro: {
    headline: { left: 60, top: 380 },
    headlineFontSize: 180,
    sentence: { left: 60, top: 790 },
    sentenceFontSize: 56,
  },
  getSneaker: { art: { left: 170, top: 150, width: 740, height: 740 } },
  walk: {
    phone: buildPhoneBox({ left: 650, top: 130, outerWidth: 370 }),
    callouts: { left: 60, top: 200 },
    calloutGap: 260,
  },
  earn: {
    stopCrop: {
      sourceTop: 880,
      sourceHeight: 400,
      scale: 1080 / 586,
      frame: { left: 0, top: 170 },
    },
    reward: {
      meta: { left: 60, top: 150 },
      number: { left: 60, top: 200 },
      numberFontSize: 300,
      symbolFontSize: 96,
      note: { left: 60, top: 560 },
    },
  },
  upgrade: {
    art: { left: 60, top: 140, width: 700, height: 700 },
    callout: { left: 820, top: 380 },
  },
  ownIt: {
    art: { left: 60, top: 140, width: 560, height: 560 },
    owner: { left: 680, top: 180 },
    ownerFontSize: 44,
  },
  endCard: {
    headline: { left: 60, top: 70 },
    headlineFontSize: 190,
    panel: { left: 620, top: 690, width: 400, height: 400 },
    brand: { left: 60, top: 700 },
    pill: { left: 60, top: 846 },
    pillWidth: 500,
    disclaimer: { left: 60, top: 1230 },
  },
}

const wideLayout: FilmLayout = {
  width: 1920,
  height: 1080,
  gutter: 100,
  safeTop: 0,
  safeBottom: 0,
  metaFontSize: 30,
  monoCalloutFontSize: 72,
  stepText: {
    stepLabel: { left: 100, top: 80 },
    headline: { left: 100, top: 700 },
    headlineFontSize: 100,
    sentence: { left: 100, top: 835 },
    sentenceFontSize: 48,
  },
  intro: {
    headline: { left: 100, top: 230 },
    headlineFontSize: 190,
    sentence: { left: 100, top: 650 },
    sentenceFontSize: 60,
  },
  getSneaker: { art: { left: 1060, top: 160, width: 760, height: 760 } },
  walk: {
    phone: buildPhoneBox({ left: 1390, top: 80, outerWidth: 430 }),
    callouts: { left: 100, top: 220 },
    calloutGap: 220,
  },
  earn: {
    stopCrop: {
      sourceTop: 880,
      sourceHeight: 400,
      scale: 1.4,
      frame: { left: 1000, top: 260 },
    },
    reward: {
      meta: { left: 100, top: 150 },
      number: { left: 100, top: 200 },
      numberFontSize: 260,
      symbolFontSize: 84,
      note: { left: 100, top: 500 },
    },
  },
  upgrade: {
    art: { left: 1060, top: 160, width: 760, height: 760 },
    callout: { left: 100, top: 260 },
  },
  ownIt: {
    art: { left: 1180, top: 200, width: 640, height: 640 },
    owner: { left: 100, top: 260 },
    ownerFontSize: 58,
  },
  endCard: {
    headline: { left: 100, top: 70 },
    headlineFontSize: 190,
    panel: { left: 1220, top: 240, width: 600, height: 600 },
    brand: { left: 100, top: 690 },
    pill: { left: 100, top: 836 },
    pillWidth: 500,
    disclaimer: { left: 100, top: 990 },
  },
}

const verticalLayout: FilmLayout = {
  width: 1080,
  height: 1920,
  gutter: 60,
  safeTop: 220,
  safeBottom: 380,
  metaFontSize: 30,
  monoCalloutFontSize: 72,
  stepText: {
    stepLabel: { left: 60, top: 240 },
    headline: { left: 60, top: 1240 },
    headlineFontSize: 100,
    sentence: { left: 60, top: 1375 },
    sentenceFontSize: 52,
  },
  intro: {
    headline: { left: 60, top: 620 },
    headlineFontSize: 180,
    sentence: { left: 60, top: 1030 },
    sentenceFontSize: 56,
  },
  getSneaker: { art: { left: 110, top: 330, width: 860, height: 860 } },
  walk: {
    phone: buildPhoneBox({ left: 610, top: 320, outerWidth: 410 }),
    callouts: { left: 60, top: 400 },
    calloutGap: 300,
  },
  earn: {
    stopCrop: {
      sourceTop: 880,
      sourceHeight: 400,
      scale: 1080 / 586,
      frame: { left: 0, top: 420 },
    },
    reward: {
      meta: { left: 60, top: 320 },
      number: { left: 60, top: 370 },
      numberFontSize: 300,
      symbolFontSize: 96,
      note: { left: 60, top: 730 },
    },
  },
  upgrade: {
    art: { left: 60, top: 330, width: 700, height: 700 },
    callout: { left: 800, top: 580 },
  },
  ownIt: {
    art: { left: 60, top: 330, width: 640, height: 640 },
    owner: { left: 60, top: 1020 },
    ownerFontSize: 58,
  },
  endCard: {
    headline: { left: 60, top: 230 },
    headlineFontSize: 180,
    // The brand's meta line is about 560 px wide, so it sits under the wordmark on the left
    // and the panel takes the right.
    panel: { left: 640, top: 800, width: 380, height: 380 },
    brand: { left: 60, top: 820 },
    pill: { left: 60, top: 1230 },
    pillWidth: 960,
    disclaimer: { left: 60, top: 1380 },
  },
}

export const filmLayouts: Record<FilmFormat, FilmLayout> = {
  '4x5': masterLayout,
  '16x9': wideLayout,
  '9x16': verticalLayout,
}
