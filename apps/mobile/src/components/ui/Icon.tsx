import Svg, { Path } from 'react-native-svg'
import { layout } from '../../theme'

export type IconName = 'back' | 'close' | 'arrowRight'

// Line glyphs on a 24-unit grid, scaled to `size`.
const ICON_VIEW_BOX = '0 0 24 24'
const ICON_PATHS: Record<IconName, string> = {
  back: 'M20 12H4M10 6l-6 6 6 6',
  close: 'M6 6l12 12M18 6L6 18',
  arrowRight: 'M4 12h16M14 6l6 6-6 6',
}

type IconProps = {
  name: IconName
  color: string
  size?: number
}

/** A thin line glyph, like Lusion's arrows. Decorative: the button around it carries the label. */
export function Icon({ name, color, size = layout.iconSize }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={ICON_VIEW_BOX}
      fill="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path
        d={ICON_PATHS[name]}
        stroke={color}
        strokeWidth={layout.iconStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}
