import type { TextStyle } from 'react-native'
import { fontFamilies } from './fonts'

/** design-system.md §3.3, phone sizes at a 390 pt width. */
export const fontSizes = {
  label: 10,
  caption: 14,
  button: 14,
  body: 16,
  input: 18,
  intro: 23,
  title: 25,
  menuItem: 26,
  heading: 47,
  /** The one number a result screen is about: "+50 SOLE". */
  hero: 62,
  counter: 51,
  display: 58,
  displayLarge: 62,
  displayHuge: 76,
} as const

/** Multiples of the font size. */
export const lineHeights = {
  tightest: 0.75,
  tighter: 0.9,
  tight: 1,
  snug: 1.1,
  standard: 1.15,
  relaxed: 1.4,
} as const

/** In em. React Native wants points, so multiply by the font size. Only display type is tightened. */
export const letterSpacings = {
  display: -0.02,
  displayLarge: -0.01,
} as const

function buildTextStyle({
  fontSize,
  lineHeight,
  letterSpacing = 0,
  fontFamily = fontFamilies.regular,
}: {
  fontSize: number
  lineHeight: number
  letterSpacing?: number
  fontFamily?: string
}): TextStyle {
  return {
    fontFamily,
    fontSize,
    lineHeight: Math.round(fontSize * lineHeight),
    letterSpacing: fontSize * letterSpacing,
  }
}

/**
 * Each §3.3 row as one style to spread (`...textStyles.body`). Case stays with the
 * component: `MetaLabel` and the buttons uppercase their own text.
 */
export const textStyles = {
  label: buildTextStyle({ fontSize: fontSizes.label, lineHeight: lineHeights.standard }),
  caption: buildTextStyle({ fontSize: fontSizes.caption, lineHeight: lineHeights.relaxed }),
  button: buildTextStyle({
    fontSize: fontSizes.button,
    lineHeight: lineHeights.standard,
    fontFamily: fontFamilies.medium,
  }),
  body: buildTextStyle({ fontSize: fontSizes.body, lineHeight: lineHeights.relaxed }),
  input: buildTextStyle({ fontSize: fontSizes.input, lineHeight: lineHeights.standard }),
  intro: buildTextStyle({ fontSize: fontSizes.intro, lineHeight: lineHeights.snug }),
  title: buildTextStyle({ fontSize: fontSizes.title, lineHeight: lineHeights.standard }),
  menuItem: buildTextStyle({ fontSize: fontSizes.menuItem, lineHeight: lineHeights.tight }),
  heading: buildTextStyle({ fontSize: fontSizes.heading, lineHeight: lineHeights.standard }),
  hero: buildTextStyle({
    fontSize: fontSizes.hero,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.displayLarge,
  }),
  counter: buildTextStyle({
    fontSize: fontSizes.counter,
    lineHeight: lineHeights.tight,
    fontFamily: fontFamilies.monoRegular,
  }),
  display: buildTextStyle({
    fontSize: fontSizes.display,
    lineHeight: lineHeights.tighter,
    letterSpacing: letterSpacings.display,
  }),
  displayLarge: buildTextStyle({
    fontSize: fontSizes.displayLarge,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.displayLarge,
  }),
  displayHuge: buildTextStyle({ fontSize: fontSizes.displayHuge, lineHeight: lineHeights.tight }),
} as const
