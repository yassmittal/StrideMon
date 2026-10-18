import type { CSSProperties } from 'react'
import { colors, fontFamilies, fontWeights } from '../../../theme'
import { REEL_PIXELS_PER_POINT } from '../../footage'

// The app's tokens (apps/mobile/src/theme/) in reel pixels, for the rebuilt screens. Everything
// rebuilt is drawn at the reel's own size (720 × 1560), so it scales exactly like the footage
// beside it and can be overlaid on a reel frame (scripts/check-app-tour-rebuilds.py).

/** App points to reel pixels. */
export function toReelPixels(points: number): number {
  return points * REEL_PIXELS_PER_POINT
}

/** apps/mobile/src/theme/spacing.ts */
export const appSpacing = {
  extraSmall: toReelPixels(5),
  small: toReelPixels(10),
  medium: toReelPixels(15),
  large: toReelPixels(20),
  extraLarge: toReelPixels(30),
} as const

export const appRadii = {
  tiny: toReelPixels(3),
  medium: toReelPixels(10),
  card: toReelPixels(20),
} as const

/** The narrow page gutter (the phone is 384 pt wide, under the 400 pt breakpoint). */
export const appPageGutter = toReelPixels(15)

/**
 * How Android's text differs from Chrome's at the same size, measured on the reel's sheets (41.2 s):
 * each line box comes out about a pixel taller, and caption-size text (14 pt) about 4% wider,
 * because Android rounds each glyph's advance to a whole native pixel.
 */
const ANDROID_LINE_HEIGHT_EXTRA_PIXELS = 1
const ANDROID_SMALL_TEXT_TRACKING_PIXELS = 0.42
const SMALL_TEXT_MAXIMUM_POINTS = 14
/** Titles (25 pt) run a few pixels wide too, once the film's text is unhinted. */
const ANDROID_TITLE_TRACKING_PIXELS = 0.18
const TITLE_POINTS = 25

/** typography.ts's `buildTextStyle`: the line height is rounded in points, as the app does. */
function buildAppTextStyle({
  fontSize,
  lineHeight,
  letterSpacing = 0,
  fontFamily = fontFamilies.satoshi,
  fontWeight = fontWeights.regular,
}: {
  fontSize: number
  lineHeight: number
  letterSpacing?: number
  fontFamily?: string
  fontWeight?: number
}): CSSProperties {
  return {
    fontFamily,
    fontWeight,
    fontSize: toReelPixels(fontSize),
    lineHeight: `${toReelPixels(Math.round(fontSize * lineHeight)) + ANDROID_LINE_HEIGHT_EXTRA_PIXELS}px`,
    letterSpacing:
      toReelPixels(fontSize * letterSpacing) +
      (fontSize <= SMALL_TEXT_MAXIMUM_POINTS
        ? ANDROID_SMALL_TEXT_TRACKING_PIXELS
        : fontSize === TITLE_POINTS
          ? ANDROID_TITLE_TRACKING_PIXELS
          : 0),
  }
}

export const appTextStyles = {
  label: buildAppTextStyle({ fontSize: 10, lineHeight: 1.15 }),
  caption: buildAppTextStyle({ fontSize: 14, lineHeight: 1.4 }),
  captionMono: buildAppTextStyle({ fontSize: 14, lineHeight: 1.4, fontFamily: fontFamilies.mono }),
  captionMedium: buildAppTextStyle({
    fontSize: 14,
    lineHeight: 1.4,
    fontWeight: fontWeights.medium,
  }),
  button: buildAppTextStyle({ fontSize: 14, lineHeight: 1.15, fontWeight: fontWeights.medium }),
  body: buildAppTextStyle({ fontSize: 16, lineHeight: 1.4 }),
  bodyMono: buildAppTextStyle({ fontSize: 16, lineHeight: 1.4, fontFamily: fontFamilies.mono }),
  title: buildAppTextStyle({ fontSize: 25, lineHeight: 1.15 }),
  titleMono: buildAppTextStyle({ fontSize: 25, lineHeight: 1.15, fontFamily: fontFamilies.mono }),
  menuItem: buildAppTextStyle({ fontSize: 26, lineHeight: 1 }),
  heading: buildAppTextStyle({ fontSize: 47, lineHeight: 1.15 }),
} as const

export const appLayoutSizes = {
  pillHeight: toReelPixels(45),
  progressTrackHeight: toReelPixels(4),
  iconSize: toReelPixels(18),
  successBadgeSize: toReelPixels(64),
  iconCircleButtonSize: toReelPixels(45),
} as const

export const appColors = colors
