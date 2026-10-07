import Svg, { Path, Rect } from 'react-native-svg'
import { colors } from '../../theme'

type BrandMarkProps = {
  size: number
}

/**
 * The StrideMon mark: a line Sneaker with a lime stripe on the dark tile. The same drawing as the
 * app icon (scripts/build-app-icons.sh) and the website's favicon.
 */
export function BrandMark({ size }: BrandMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel="StrideMon">
      <Rect width={64} height={64} rx={14} fill={colors.darkPanel} />
      <Path
        d="M13 43h30c5 0 9-1 10-3 1-1 0-2-1-2L26 37c-5 0-9-1-12-1-1 3-1 6-1 7Z"
        fill="none"
        stroke={colors.textOnDark}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Path
        d="M14 36c-2-5-2-10-1-15 4 2 8 3 11 3l3-6 15 10c7 2 10 6 11 10"
        fill="none"
        stroke={colors.textOnDark}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15 32c8 1 16-2 22-6"
        fill="none"
        stroke={colors.highlight}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
    </Svg>
  )
}
