import type { CSSProperties, ReactNode } from 'react'
import { type Box, readPhoneBezel, readPhoneRadius } from '../layouts'
import { colors, type SectionTone } from '../theme'

// On black, an ink frame would vanish into the page: a hairline ring keeps its edge. 2 px, so
// it survives the re-encode.
const RING_WIDTH_PIXELS = 2

type PhoneFrameProps = {
  box: Box
  tone: SectionTone
  children: ReactNode
  style?: CSSProperties
}

/**
 * The website's plain phone frame (website/src/components/ui/phone-frame.tsx): an ink bezel
 * and rounded corners, scaled to the box. Not a photoreal device.
 */
export function PhoneFrame({ box, tone, children, style }: PhoneFrameProps) {
  const bezel = readPhoneBezel(box.width)
  const radius = readPhoneRadius(box.width)
  return (
    <div
      style={{
        position: 'absolute',
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
        padding: bezel,
        borderRadius: radius,
        backgroundColor: colors.textPrimary,
        outline: tone === 'dark' ? `${RING_WIDTH_PIXELS}px solid ${colors.overlayOnDark}` : 'none',
        ...style,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          borderRadius: radius - bezel,
        }}
      >
        {children}
      </div>
    </div>
  )
}
