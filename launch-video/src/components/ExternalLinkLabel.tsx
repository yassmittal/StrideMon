import { fontFamilies, fontWeights } from '../theme'

// A north-east arrow on the app's 24-unit icon grid, at the arrow's stroke ratio.
const ARROW_UP_RIGHT_PATH = 'M7 17L17 7M8 7h9v9'

type ExternalLinkLabelProps = {
  label: string
  fontSize: number
  color: string
  left: number
  top: number
}

/** The app's "VIEW TRANSACTION ↗" link style: uppercase medium text with a thin arrow. */
export function ExternalLinkLabel({ label, fontSize, color, left, top }: ExternalLinkLabelProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        display: 'flex',
        alignItems: 'center',
        gap: fontSize * 0.25,
        fontFamily: fontFamilies.satoshi,
        fontWeight: fontWeights.medium,
        fontSize,
        lineHeight: 1.15,
        color,
        textTransform: 'uppercase',
      }}
    >
      {label}
      <svg width={fontSize} height={fontSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d={ARROW_UP_RIGHT_PATH}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
