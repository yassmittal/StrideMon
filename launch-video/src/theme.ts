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
 * The Dial film's keypad and end card (docs/dial-video-prompt.md): the reference's warm paper and
 * its phone's green call button. The ink and the link pill are the brand's own.
 */
export const dialColors = {
  /** The page behind the keypad: the reference's warm off-white, lighter in the middle. */
  paper: '#F4EFE6',
  paperLight: '#FBF8F3',
  key: colors.surface,
  keyShadow: 'rgba(110, 84, 50, 0.12)',
  /** The digits and the keypad's letters: a warm near-black, as the reference's. */
  keyInk: '#3A332D',
  /** The phone's own call green. */
  call: '#34C759',
  callRing: 'rgba(52, 199, 89, 0.35)',
  /** The captions over the shots: the reference's cream, with a soft shadow to lift them. */
  caption: '#FFF9F0',
  captionShadow: 'rgba(30, 20, 10, 0.45)',
  ink: colors.darkPanel,
  inkSecondary: 'rgba(20, 21, 21, 0.62)',
} as const

/**
 * The One thing film's reveal and end card (docs/one-thing-video-prompt.md): the reference's gold
 * captions with their glow and its red map pin, on a dark stage with a plum light, from #0137's own
 * colours.
 */
export const oneThingColors = {
  gold: '#FFE34D',
  goldGlowNear: 'rgba(255, 214, 0, 0.85)',
  goldGlowFar: 'rgba(255, 176, 0, 0.45)',
  pinHead: '#E5323B',
  pinHighlight: 'rgba(255, 255, 255, 0.55)',
  pinNeedle: '#C9CDD2',
  stageLight: '#3A1838',
  stageDark: '#07060A',
  floorShadow: 'rgba(0, 0, 0, 0.75)',
  cardShadow: 'rgba(0, 0, 0, 0.6)',
} as const

/** The Stash film (src/stash/): the Sneakers' shadow on the case floor, and the end card over the held case. */
export const stashColors = {
  sneakerShadow: 'rgba(20, 16, 18, 0.38)',
  /** Darkens the blurred, held case under the end card's words. */
  veil: 'rgba(8, 7, 9, 0.66)',
  bodyText: 'rgba(255, 255, 255, 0.78)',
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
  /** The Crush film's captions and title, the reference's own face (fonts.ts). */
  crushCaption: 'Poppins',
  /** The Dial film's tagline, captions and end card headline, close to the reference's serif (fonts.ts). */
  dialSerif: 'Fraunces',
  /** The One thing film's gold captions, close to the reference's condensed face (fonts.ts). */
  oneThingCaption: 'Bebas Neue',
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
