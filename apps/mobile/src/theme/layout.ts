// Lusion's gutter drops from 25 to 15 at 400 px wide (`--base-padding-x`).
const NARROW_WINDOW_MAXIMUM_WIDTH = 400
const NARROW_PAGE_GUTTER = 15
const WIDE_PAGE_GUTTER = 25

/** design-system.md §4.2 and the component sizes from §8, at a 390 pt width. */
export const layout = {
  gridColumns: 6,
  pillHeight: 45,
  callToActionPillHeight: 47,
  /** The white dot after a primary pill's label, and each of a secondary pill's two dots. */
  pillDotSize: 4,
  /** The black dot before a call-to-action pill's label; it floods the pill when pressed. */
  callToActionDotSize: 7,
  progressTrackHeight: 4,
  /** "+" corner marks (`--cross-size`). */
  crossMarkSize: 14,
  /** The Sneaker's dark panel fills about half of the first screen. */
  heroPanelMinimumHeightRatio: 0.45,
} as const

export function readPageGutter(windowWidth: number): number {
  return windowWidth <= NARROW_WINDOW_MAXIMUM_WIDTH ? NARROW_PAGE_GUTTER : WIDE_PAGE_GUTTER
}
