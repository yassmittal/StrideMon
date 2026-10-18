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
  /** The App tour film's rebuilt screens: a disabled label, and the dim behind a bottom sheet. */
  textPlaceholder: 'rgba(0, 0, 0, 0.3)',
  backdrop: 'rgba(0, 0, 0, 0.5)',
} as const

/**
 * The Pass chat film's own colours (docs/pass-chat-video-prompt.md §3). Each is a token above or
 * one flat step from it. The sky photo is the film's only gradient; the shoes keep the art's own.
 */
export const passChatColors = {
  /** The phone's front and back: the lime itself, as a fill. */
  phoneBody: colors.highlight,
  /** Derived: the phone's sides, lime one flat step darker (80%), so its depth reads without shading. */
  phoneSide: '#9ACC00',
  /** Derived: the side buttons and the camera block's rim, a second step darker (64%). */
  phoneDetail: '#7BA300',
  /** The bezel round the screen, the punch-hole and the lenses: the art's ink. */
  phoneInk: colors.darkPanel,
  /** The chat's screen: Lusion's dark white, as the app's secondary surfaces use it. */
  chatScreen: colors.surfaceMuted,
  /** The compose field and the "+" button: white, floating on the screen. */
  chatField: colors.surface,
  /** The bubbles: the site's grey-blue pill colour, almost exactly the reference's slate. */
  chatBubble: colors.primary,
} as const

/**
 * The App tour film's realistic phone (a STOP 1 prototype, Yash asked for a more real phone): a
 * graphite metal rim, black glass and a soft shadow. Only on the device, never on the page.
 */
export const appTourPhoneColors = {
  rimLight: '#6B7078',
  rimMid: '#2E3136',
  rimDark: '#17181B',
  glass: '#050506',
  edgeHighlight: 'rgba(255, 255, 255, 0.22)',
  sheen: 'rgba(255, 255, 255, 0.05)',
  shadowNear: 'rgba(0, 0, 0, 0.28)',
  shadowFar: 'rgba(0, 0, 0, 0.22)',
} as const

/** apps/mobile/src/theme/fonts.ts. The families are loaded in fonts.ts. */
export const fontFamilies = {
  satoshi: 'Satoshi',
  mono: 'IBM Plex Mono',
  /** The Pass chat film's script face, for its lime keywords and "isn’t" (fonts.ts). */
  script: 'Knewave',
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
