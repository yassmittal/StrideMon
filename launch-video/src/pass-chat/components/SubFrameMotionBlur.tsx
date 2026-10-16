import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'

// Motion blur for the 3D phone, the card and the burst: the picture drawn at several sub-frames
// across the shutter and averaged (each sample at 1/n, added with plus-lighter), as a film camera
// would expose it. The canvas blur (HtmlInCanvasMotionBlur) draws the 3D phone black, and
// CameraMotionBlur freezes the wrong frames inside an offset Sequence, so the picture is told its
// sample frame directly instead (STOP 1, reference.md).

type SubFrameMotionBlurProps = {
  /** The frame being drawn (fractions are fine). */
  frame: number
  /** The shutter, as a share of a frame: 0.5 is a 180° shutter. Centred on the frame. */
  shutterFraction: number
  sampleCount: number
  /** Draws the picture at a sample's frame. */
  render: (sampleFrame: number) => ReactNode
}

export function SubFrameMotionBlur({
  frame,
  shutterFraction,
  sampleCount,
  render,
}: SubFrameMotionBlurProps) {
  if (sampleCount <= 1 || shutterFraction === 0) return render(frame)
  return (
    <AbsoluteFill style={{ isolation: 'isolate' }}>
      {Array.from({ length: sampleCount }, (_, sampleIndex) => {
        const sampleFrame = frame + shutterFraction * (sampleIndex / (sampleCount - 1) - 0.5)
        return (
          <AbsoluteFill
            // biome-ignore lint/suspicious/noArrayIndexKey: samples are positional by design.
            key={sampleIndex}
            style={{ mixBlendMode: 'plus-lighter', filter: `opacity(${1 / sampleCount})` }}
          >
            {render(sampleFrame)}
          </AbsoluteFill>
        )
      })}
    </AbsoluteFill>
  )
}
