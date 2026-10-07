// Lusion's gutter drops from 25 to 15 at 400 px wide (`--base-padding-x`).
const NARROW_WINDOW_MAXIMUM_WIDTH = 400
const NARROW_PAGE_GUTTER = 15
const WIDE_PAGE_GUTTER = 25

/** design-system.md §4.2 and the component sizes from §8, at a 390 pt width. */
export const layout = {
  gridColumns: 6,
  pillHeight: 45,
  callToActionPillHeight: 47,
  /** A small status dot, such as the active run's lime recording dot. */
  callToActionDotSize: 7,
  progressTrackHeight: 4,
  /** "+" corner marks (`--cross-size`), drawn with hairline strokes. */
  crossMarkSize: 14,
  crossMarkStrokeWidth: 1,
  textFieldHeight: 61,
  /** The arrow button at the end of a text field. */
  textFieldArrowSize: 21,
  iconCircleButtonSize: 45,
  /** Derived: the StrideMon mark at the top of the welcome screen, as tall as a pill. */
  brandMarkSize: 45,
  /** Derived: the glyph inside an icon circle button, and its line width. */
  iconSize: 18,
  iconStrokeWidth: 1.5,
  /** Derived: the lime check after a transaction goes through. */
  successBadgeSize: 64,
  /** Derived: the step number column on the minting screen. */
  onboardingStepIndicatorWidth: 24,
  /** §3.3: display lines are pulled left so the glyph edge meets the gutter. Times the font size. */
  opticalPullLeftRatio: -0.05,
  /** Derived: the Sneaker glyph that holds the picture's place while it loads. */
  sneakerArtPlaceholderIconSize: 64,
  /** The Sneaker's dark panel fills about half of the first screen. */
  heroPanelMinimumHeightRatio: 0.45,
} as const

export function readPageGutter(windowWidth: number): number {
  return windowWidth <= NARROW_WINDOW_MAXIMUM_WIDTH ? NARROW_PAGE_GUTTER : WIDE_PAGE_GUTTER
}

/** The left margin that lines a display headline's glyph edge up with the page gutter. */
export function readOpticalPullLeft(fontSize: number | undefined): number {
  return layout.opticalPullLeftRatio * (fontSize ?? 0)
}
