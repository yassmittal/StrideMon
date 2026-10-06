import type { CSSProperties } from 'react'
import { interpolate, useCurrentFrame } from 'remotion'
import { easings } from '../theme'

export const LABEL_ROLL_DURATION_FRAMES = 24

export type LabelRollStep = { startFrame: number; text: string }

type LabelRollProps = {
  steps: readonly LabelRollStep[]
  /** The clip's height: one line. */
  lineHeightPixels: number
  style?: CSSProperties
}

/**
 * The site's pill label roll, for swapping words in place: the shown text slides up out of
 * its clip while the next one slides in from below.
 */
export function LabelRoll({ steps, lineHeightPixels, style }: LabelRollProps) {
  const frame = useCurrentFrame()
  const currentIndex = findCurrentStepIndex(steps, frame)
  if (currentIndex === -1) return null
  const currentStep = steps[currentIndex]
  const previousStep = steps[currentIndex - 1]
  if (currentStep === undefined) return null
  const progress =
    previousStep === undefined
      ? 1
      : interpolate(
          frame,
          [currentStep.startFrame, currentStep.startFrame + LABEL_ROLL_DURATION_FRAMES],
          [0, 1],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: easings.standard,
          },
        )

  return (
    <div style={{ position: 'relative', overflow: 'hidden', height: lineHeightPixels, ...style }}>
      {previousStep !== undefined && progress < 1 && (
        <div
          style={{ position: 'absolute', whiteSpace: 'pre', translate: `0px ${-progress * 100}%` }}
        >
          {previousStep.text}
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          whiteSpace: 'pre',
          translate: `0px ${(1 - progress) * 100}%`,
        }}
      >
        {currentStep.text}
      </div>
    </div>
  )
}

function findCurrentStepIndex(steps: readonly LabelRollStep[], frame: number): number {
  let currentIndex = -1
  steps.forEach((step, stepIndex) => {
    if (step.startFrame <= frame) currentIndex = stepIndex
  })
  return currentIndex
}
