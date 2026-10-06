import type { ReactNode } from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'

// Never a dead frame: every scene creeps forward a little while it holds. Linear on purpose,
// since a drift is continuous (launch-video-prompt.md §4).
const DRIFT_SCALE = 1.02

export function Drift({
  durationInFrames,
  children,
}: {
  durationInFrames: number
  children: ReactNode
}) {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ scale: interpolate(frame, [0, durationInFrames], [1, DRIFT_SCALE]) }}>
      {children}
    </AbsoluteFill>
  )
}
