import { colors } from '../../theme'

// The StrideMon mark: the line Sneaker with its lime stripe on the dark tile, from
// website/src/app/icon.svg's own strokes (the same drawing as apps/mobile/assets/icon.png and the
// splash, made by apps/mobile/scripts/build-app-icons.sh). Vector at any size, never a scaled PNG.

/** The tile's corner radius on the mark's 64-unit grid (icon.svg's rx). */
export const MARK_TILE_RADIUS_UNITS = 14
const MARK_GRID_UNITS = 64

export function StrideMonMark({ size, tileRadius }: { size: number; tileRadius?: number }) {
  const radiusUnits =
    tileRadius === undefined ? MARK_TILE_RADIUS_UNITS : (tileRadius / size) * MARK_GRID_UNITS
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <rect width="64" height="64" rx={radiusUnits} fill={colors.darkPanel} />
      <MarkStrokes />
    </svg>
  )
}

/** The mark's three strokes on the 64-unit grid, without the tile. */
export function MarkStrokes() {
  return (
    <>
      <path
        d="M13 43h30c5 0 9-1 10-3 1-1 0-2-1-2L26 37c-5 0-9-1-12-1-1 3-1 6-1 7Z"
        fill="none"
        stroke={colors.textOnDark}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M14 36c-2-5-2-10-1-15 4 2 8 3 11 3l3-6 15 10c7 2 10 6 11 10"
        fill="none"
        stroke={colors.textOnDark}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 32c8 1 16-2 22-6"
        fill="none"
        stroke={colors.highlight}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </>
  )
}
