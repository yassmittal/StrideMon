import { Easing } from 'remotion'

// Token values copied from apps/mobile/src/theme/ (colors.ts, typography.ts, motion.ts,
// layout.ts, radii.ts, shadows.ts). This project isn't a workspace, so it can't import them.
// If a token changes there, change it here too.

/** apps/mobile/src/theme/colors.ts */
export const colors = {
  background: '#F0F1FA',
  surface: '#FFFFFF',
  surfaceMuted: '#E4E6EF',
  textPrimary: '#000000',
  textSecondary: 'rgba(0, 0, 0, 0.5)',
  /** Small text on light: 0.5 is 3.9:1 on the page, under WCAG AA (as the website found). */
  textSecondarySmall: 'rgba(0, 0, 0, 0.6)',
  primary: '#2B2E3A',
  accent: '#1A2FFB',
  /** Lime. Only on dark, never as text on a light background. */
  highlight: '#C1FF00',
  darkBackground: '#000000',
  darkPanel: '#141515',
  darkTrack: '#34393F',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: 'rgba(255, 255, 255, 0.3)',
  /** Derived: the art's own labels use white at 0.5 (fill-opacity in SneakerArtRenderer). */
  textOnDarkSecondary: 'rgba(255, 255, 255, 0.5)',
  overlayOnLight: 'rgba(0, 0, 0, 0.1)',
  overlayOnDark: 'rgba(255, 255, 255, 0.1)',
  crossMark: '#999999',
} as const

/** apps/mobile/src/theme/fonts.ts. The families are loaded in fonts.ts. */
export const fontFamilies = {
  satoshi: 'Satoshi',
  mono: 'IBM Plex Mono',
} as const

/** Satoshi 400 for everything readable, 500 only for uppercase meta and pills. */
export const fontWeights = {
  regular: 400,
  medium: 500,
} as const

/** apps/mobile/src/theme/typography.ts, in em. */
export const letterSpacings = {
  display: '-0.02em',
  displayLarge: '-0.01em',
} as const

/** apps/mobile/src/theme/motion.ts. Nothing else moves the film. */
export const easings = {
  standard: Easing.bezier(0.4, 0, 0.1, 1),
  emphasized: Easing.bezier(0.35, 0, 0, 1),
  outExpo: Easing.bezier(0.16, 1, 0.3, 1),
} as const

/** apps/mobile/src/theme/layout.ts */
export const appLayout = {
  callToActionDotSize: 7,
  progressTrackHeight: 4,
  crossMarkSize: 14,
  pillHeight: 45,
  callToActionPillHeight: 47,
  opticalPullLeftRatio: -0.05,
} as const

/** apps/mobile/src/theme/radii.ts */
export const radii = {
  tiny: 3,
  medium: 10,
  pill: 999,
} as const

/** apps/mobile/src/theme/shadows.ts: the one shadow, only on floating white pills. */
export const floatingPillShadow =
  '0px 6px 10px rgba(0, 0, 0, 0.04), 0px 2px 4px rgba(0, 0, 0, 0.04)'

/** The section a scene sits in. Lusion flips whole sections between these two. */
export type SectionTone = 'dark' | 'light'

export function readSectionBackground(tone: SectionTone): string {
  return tone === 'dark' ? colors.darkBackground : colors.background
}

export function readSectionText(tone: SectionTone): string {
  return tone === 'dark' ? colors.textOnDark : colors.textPrimary
}

export function readSectionSecondaryText(tone: SectionTone): string {
  return tone === 'dark' ? colors.textOnDarkSecondary : colors.textSecondary
}
