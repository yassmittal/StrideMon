import type { ColorValue } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { layout } from '../../theme'

export type IconName = 'back' | 'close' | 'arrowRight' | 'home' | 'sneaker' | 'history' | 'profile'

// Line glyphs on a 24-unit grid, scaled to `size`.
const ICON_VIEW_BOX = '0 0 24 24'
const ICON_PATHS: Record<IconName, string> = {
  back: 'M20 12H4M10 6l-6 6 6 6',
  close: 'M6 6l12 12M18 6L6 18',
  arrowRight: 'M4 12h16M14 6l6 6-6 6',
  home: 'M4 10.5L12 4l8 6.5V20H4zM10 20v-5h4v5',
  sneaker: 'M3 16V8h4l1.5 2.5L11 9.5l7.5 4.2a3 3 0 0 1 2 2.3zM3 19.5h17.5',
  history: 'M12 7.5V12l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20c.6-3.4 3.8-5.5 7.5-5.5s6.9 2.1 7.5 5.5',
}

type IconProps = {
  name: IconName
  color: ColorValue
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
