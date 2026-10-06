// Where everything sits, per format. Each format is laid out on its own, never a crop of the
// master. All values are pixels in the composition. 4:5 is the master. In 16:9 and 9:16, the
// earn scene and the end card are designed; the other scenes are first passes, re-laid after
// the 4:5 notes (launch-video-prompt.md §6).

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

export type FilmLayout = {
  width: number
  height: number
  gutter: number
  /** Platform UI covers these bands (9:16): no text inside them. */
  safeTop: number
  safeBottom: number
  headlineFontSize: number
  captionFontSize: number
  metaFontSize: number
  monoCalloutFontSize: number
  /** Baseline of the big bottom-left word ("Walk.", "Earn.", "Upgrade."). */
  headlineBaseline: number
  /** The phone's outer box, where it shows the run screen or footage. */
  phone: Box
  coldOpen: {
    /** The run screen (1080 × 2340) at this scale, its top-left at `origin`, framed for the macro. */
    macroScale: number
    macroOrigin: Point
    /** During the macro, nothing below this line shows, so "Walk." reads on black. */
    macroClipBottom: number
  }
  walk: { callouts: Box; caption: Point }
  earn: {
    stopCrop: FootageCrop
    settlePhone: Box
    reward: { meta: Point; number: Point; numberFontSize: number; symbolFontSize: number }
    proof: { origin: Point; width: number; hashFontSize: number }
  }
  upgrade: {
    caption: Point
    art: Box
    callouts: { origin: Point; columnGap: number }
    metamaskCrop: FootageCrop
  }
  ownIt: {
    statement: Point
    statementFontSize: number
    framesMeta: Point
    /** The Home card (video2 07:08) and MonadVision's NFT card (07:21.5): level 02, durability 100. */
    appCrop: FootageCrop
    explorerCrop: FootageCrop
    framesLabelTop: number
    transferArt: Box
    owner: Point
    lockedStats: Point
    caption: Point
    transferCaptionFontSize: number
  }
  rules: {
    meta: Point
    cards: { origin: Point; width: number; rowHeight: number; fontSize: number }
    addresses: { origin: Point; rowHeight: number; fontSize: number }
    verified: Point
    closing: Point
    closingFontSize: number
  }
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
  headlineFontSize: 200,
  captionFontSize: 52,
  metaFontSize: 30,
  monoCalloutFontSize: 72,
  headlineBaseline: 1270,
  phone: buildPhoneBox({ left: 556, top: 70, outerWidth: 464 }),
  coldOpen: {
    macroScale: 1.45,
    macroOrigin: { left: -5, top: -72 },
    macroClipBottom: 800,
  },
  walk: {
    callouts: { left: 60, top: 130, width: 430, height: 820 },
    caption: { left: 60, top: 1100 },
  },
  earn: {
    stopCrop: {
      sourceTop: 880,
      sourceHeight: 400,
      scale: 1080 / 586,
      frame: { left: 0, top: 306 },
    },
    settlePhone: buildPhoneBox({ left: 300, top: 60, outerWidth: 480 }),
    reward: {
      meta: { left: 60, top: 120 },
      number: { left: 60, top: 170 },
      numberFontSize: 360,
      symbolFontSize: 110,
    },
    proof: { origin: { left: 60, top: 640 }, width: 960, hashFontSize: 44 },
  },
  upgrade: {
    caption: { left: 60, top: 80 },
    art: { left: 200, top: 160, width: 680, height: 680 },
    callouts: { origin: { left: 200, top: 880 }, columnGap: 360 },
    metamaskCrop: { sourceTop: 458, sourceHeight: 752, scale: 1.4, frame: { left: 130, top: 200 } },
  },
  ownIt: {
    statement: { left: 60, top: 100 },
    statementFontSize: 80,
    framesMeta: { left: 60, top: 330 },
    appCrop: {
      sourceLeft: 22,
      sourceWidth: 542,
      sourceTop: 150,
      sourceHeight: 520,
      scale: 0.85,
      frame: { left: 60, top: 400 },
    },
    explorerCrop: {
      sourceLeft: 24,
      sourceWidth: 538,
      sourceTop: 422,
      sourceHeight: 540,
      scale: 0.85,
      frame: { left: 563, top: 400 },
    },
    framesLabelTop: 885,
    transferArt: { left: 60, top: 160, width: 520, height: 520 },
    owner: { left: 620, top: 200 },
    lockedStats: { left: 60, top: 720 },
    caption: { left: 60, top: 1050 },
    transferCaptionFontSize: 64,
  },
  rules: {
    meta: { left: 60, top: 110 },
    cards: { origin: { left: 60, top: 190 }, width: 960, rowHeight: 124, fontSize: 56 },
    addresses: { origin: { left: 60, top: 200 }, rowHeight: 140, fontSize: 32 },
    verified: { left: 60, top: 790 },
    closing: { left: 60, top: 1080 },
    closingFontSize: 64,
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
  headlineFontSize: 200,
  captionFontSize: 52,
  metaFontSize: 30,
  monoCalloutFontSize: 72,
  headlineBaseline: 980,
  phone: buildPhoneBox({ left: 1260, top: 60, outerWidth: 444 }),
  coldOpen: {
    macroScale: 1.6,
    macroOrigin: { left: 31, top: -154 },
    macroClipBottom: 760,
  },
  walk: {
    callouts: { left: 100, top: 120, width: 520, height: 640 },
    caption: { left: 700, top: 760 },
  },
  earn: {
    stopCrop: {
      sourceTop: 880,
      sourceHeight: 400,
      scale: 1080 / 586,
      frame: { left: 420, top: 171 },
    },
    settlePhone: buildPhoneBox({ left: 730, top: 50, outerWidth: 454 }),
    reward: {
      meta: { left: 100, top: 130 },
      number: { left: 100, top: 180 },
      numberFontSize: 320,
      symbolFontSize: 100,
    },
    proof: { origin: { left: 1100, top: 210 }, width: 720, hashFontSize: 36 },
  },
  upgrade: {
    caption: { left: 100, top: 100 },
    art: { left: 660, top: 140, width: 600, height: 600 },
    callouts: { origin: { left: 1340, top: 300 }, columnGap: 0 },
    metamaskCrop: { sourceTop: 458, sourceHeight: 752, scale: 1.2, frame: { left: 608, top: 90 } },
  },
  ownIt: {
    statement: { left: 100, top: 100 },
    statementFontSize: 80,
    framesMeta: { left: 1000, top: 240 },
    appCrop: {
      sourceLeft: 22,
      sourceWidth: 542,
      sourceTop: 150,
      sourceHeight: 520,
      scale: 0.75,
      frame: { left: 1000, top: 300 },
    },
    explorerCrop: {
      sourceLeft: 24,
      sourceWidth: 538,
      sourceTop: 422,
      sourceHeight: 540,
      scale: 0.75,
      frame: { left: 1420, top: 300 },
    },
    framesLabelTop: 735,
    transferArt: { left: 100, top: 140, width: 520, height: 520 },
    owner: { left: 700, top: 180 },
    lockedStats: { left: 700, top: 420 },
    caption: { left: 700, top: 700 },
    transferCaptionFontSize: 64,
  },
  rules: {
    meta: { left: 100, top: 100 },
    cards: { origin: { left: 100, top: 180 }, width: 1000, rowHeight: 120, fontSize: 56 },
    addresses: { origin: { left: 100, top: 180 }, rowHeight: 120, fontSize: 32 },
    verified: { left: 100, top: 700 },
    closing: { left: 1080, top: 760 },
    closingFontSize: 56,
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
  headlineFontSize: 200,
  captionFontSize: 52,
  metaFontSize: 30,
  monoCalloutFontSize: 72,
  headlineBaseline: 1500,
  phone: buildPhoneBox({ left: 290, top: 240, outerWidth: 500 }),
  coldOpen: {
    macroScale: 1.45,
    macroOrigin: { left: -5, top: 88 },
    macroClipBottom: 1000,
  },
  walk: {
    callouts: { left: 60, top: 1340, width: 960, height: 200 },
    caption: { left: 60, top: 1380 },
  },
  earn: {
    stopCrop: {
      sourceTop: 880,
      sourceHeight: 400,
      scale: 1080 / 586,
      frame: { left: 0, top: 591 },
    },
    settlePhone: buildPhoneBox({ left: 248, top: 250, outerWidth: 584 }),
    reward: {
      meta: { left: 60, top: 260 },
      number: { left: 60, top: 310 },
      numberFontSize: 360,
      symbolFontSize: 110,
    },
    proof: { origin: { left: 60, top: 780 }, width: 960, hashFontSize: 44 },
  },
  upgrade: {
    caption: { left: 60, top: 240 },
    art: { left: 120, top: 340, width: 840, height: 840 },
    callouts: { origin: { left: 120, top: 1210 }, columnGap: 440 },
    metamaskCrop: { sourceTop: 458, sourceHeight: 752, scale: 1.6, frame: { left: 71, top: 330 } },
  },
  ownIt: {
    statement: { left: 60, top: 240 },
    statementFontSize: 80,
    framesMeta: { left: 60, top: 470 },
    appCrop: {
      sourceLeft: 22,
      sourceWidth: 542,
      sourceTop: 150,
      sourceHeight: 520,
      scale: 0.85,
      frame: { left: 60, top: 530 },
    },
    explorerCrop: {
      sourceLeft: 24,
      sourceWidth: 538,
      sourceTop: 422,
      sourceHeight: 540,
      scale: 0.85,
      frame: { left: 563, top: 530 },
    },
    framesLabelTop: 1015,
    transferArt: { left: 60, top: 240, width: 620, height: 620 },
    owner: { left: 60, top: 900 },
    lockedStats: { left: 60, top: 1080 },
    caption: { left: 60, top: 1260 },
    transferCaptionFontSize: 64,
  },
  rules: {
    meta: { left: 60, top: 240 },
    cards: { origin: { left: 60, top: 320 }, width: 960, rowHeight: 124, fontSize: 56 },
    addresses: { origin: { left: 60, top: 320 }, rowHeight: 150, fontSize: 32 },
    verified: { left: 60, top: 940 },
    closing: { left: 60, top: 1260 },
    closingFontSize: 64,
  },
  endCard: {
    headline: { left: 60, top: 230 },
    headlineFontSize: 180,
    panel: { left: 60, top: 820, width: 440, height: 440 },
    brand: { left: 540, top: 860 },
    pill: { left: 60, top: 1300 },
    pillWidth: 960,
    disclaimer: { left: 60, top: 1450 },
  },
}

export const filmLayouts: Record<FilmFormat, FilmLayout> = {
  '4x5': masterLayout,
  '16x9': wideLayout,
  '9x16': verticalLayout,
}
