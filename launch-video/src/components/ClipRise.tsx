import type { CSSProperties, ReactNode } from 'react'
import { interpolate, useCurrentFrame } from 'remotion'
import { easings } from '../theme'

const RISE_DURATION_FRAMES = 24

type ClipRiseProps = {
  startFrame: number
  children: ReactNode
  style?: CSSProperties
}

/** The masked rise for anything that isn't a line of text: it slides up from behind its own clip. */
export function ClipRise({ startFrame, children, style }: ClipRiseProps) {
  const frame = useCurrentFrame()
  return (
    <div style={{ position: 'absolute', overflow: 'hidden', ...style }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          translate: interpolate(
            frame,
            [startFrame, startFrame + RISE_DURATION_FRAMES],
            ['0px 105%', '0px 0%'],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: easings.outExpo,
            },
          ),
        }}
      >
        {children}
      </div>
    </div>
  )
}
