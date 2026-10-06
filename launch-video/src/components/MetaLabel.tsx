import type { CSSProperties } from 'react'
import { fontFamilies, fontWeights } from '../theme'

type MetaLabelProps = {
  items: readonly string[]
  fontSize: number
  color: string
  style?: CSSProperties
}

/** Tiny uppercase metadata joined by bullets, like the app's MetaLabel: `LEVEL 02 • EFFICIENCY 12`. */
export function MetaLabel({ items, fontSize, color, style }: MetaLabelProps) {
  return (
    <div
      style={{
        position: 'absolute',
        fontFamily: fontFamilies.satoshi,
        fontWeight: fontWeights.medium,
        fontSize,
        lineHeight: 1.15,
        color,
        textTransform: 'uppercase',
        whiteSpace: 'pre',
        ...style,
      }}
    >
      {items.join('  •  ')}
    </div>
  )
}
