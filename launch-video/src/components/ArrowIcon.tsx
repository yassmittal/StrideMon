// The app's `arrowRight` line glyph (apps/mobile/src/components/ui/Icon.tsx), on its 24-unit grid.
const ARROW_RIGHT_PATH = 'M4 12h16M14 6l6 6-6 6'
// 1.5 units at the app's 18 pt icon size.
const ICON_STROKE_RATIO = 1.5 / 18

/** A thin right arrow, like the app's pills. Decorative: the label beside it says what it is. */
export function ArrowIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={ARROW_RIGHT_PATH}
        stroke={color}
        strokeWidth={24 * ICON_STROKE_RATIO}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
