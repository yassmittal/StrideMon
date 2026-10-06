import { HtmlInCanvasMotionBlur } from '@remotion/motion-blur'
import type { ReactNode } from 'react'
import { useVideoConfig } from 'remotion'

// Subtle, like a film camera: a 180° shutter, 8 samples (launch-video-prompt.md §4). Only fast
// camera moves use it, so frames at rest stay plain DOM, exactly as they were approved.
const SHUTTER_ANGLE_DEGREES = 180
const SAMPLE_COUNT = 8

/**
 * Motion blur for a moving layer. Its children must read `useCurrentFrame()` themselves, so each
 * sample renders its own sub-frame. When `isActive` is false, the children render as usual.
 */
export function MotionBlur({ isActive, children }: { isActive: boolean; children: ReactNode }) {
  const { width, height } = useVideoConfig()
  if (!isActive) return children
  return (
    <HtmlInCanvasMotionBlur
      width={width}
      height={height}
      shutterAngle={SHUTTER_ANGLE_DEGREES}
      samples={SAMPLE_COUNT}
    >
      {children}
    </HtmlInCanvasMotionBlur>
  )
}
