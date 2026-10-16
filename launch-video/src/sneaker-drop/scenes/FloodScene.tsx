import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { colors } from '../../theme'
import { FloodGrid } from '../components/FloodGrid'
import { type SneakerDropFormat, sneakerDropLayouts } from '../layout'
import { readDriftScale } from '../motion'
import { floodGrids } from '../sneakers'
import { floodStepFrames } from '../timeline'

/**
 * Scene 5's end (beats 36–39), on off-white: the flood. Every hit in the bar, hats included,
 * pulls the grid back a step around #0020's cell, until all 1,000 fill the frame on the bar's
 * last clap. The steps are cuts, never a zoom.
 */
export function FloodScene({ format }: { format: SneakerDropFormat }) {
  const frame = useCurrentFrame()
  const layout = sneakerDropLayouts[format]
  const columnSteps = layout.floodColumnSteps
  if (columnSteps.length !== floodStepFrames.length) {
    throw new Error(
      `The flood has ${floodStepFrames.length} hits but ${columnSteps.length} steps in layout.ts`,
    )
  }
  const stepIndex = Math.max(
    0,
    floodStepFrames.filter((stepFrame) => stepFrame <= frame).length - 1,
  )
  const isFullGrid = stepIndex === columnSteps.length - 1
  const stepStartFrame = floodStepFrames[stepIndex] ?? 0
  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      <AbsoluteFill style={{ scale: isFullGrid ? 1 : readDriftScale(frame - stepStartFrame) }}>
        <FloodGrid
          grid={floodGrids[format]}
          columnCount={columnSteps[stepIndex] ?? 1}
          width={layout.width}
          height={layout.height}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
