import type { StepCopy } from '../content'
import type { StepTextLayout } from '../layouts'
import { letterSpacings } from '../theme'
import { MaskedRise } from './MaskedRise'

const SENTENCE_LINE_HEIGHT = 1.2

type StepTextProps = {
  copy: StepCopy
  layout: StepTextLayout
  metaFontSize: number
  color: string
  /** The step label's colour: secondary text for the section's tone. */
  labelColor: string
  labelStartFrame: number
  headlineStartFrame: number
  sentenceStartFrame: number
  /** The ~0.2 s opacity dip out before a cut inside the same colour. */
  exitFrame?: number
}

/**
 * One step's words: a small step label at the top ("STEP 2 OF 4"), then the headline and one
 * plain sentence at the bottom. Every step scene uses it, so the film reads the same way each time.
 */
export function StepText({
  copy,
  layout,
  metaFontSize,
  color,
  labelColor,
  labelStartFrame,
  headlineStartFrame,
  sentenceStartFrame,
  exitFrame,
}: StepTextProps) {
  const exitProps = exitFrame === undefined ? {} : { exitFrame }
  return (
    <>
      {copy.stepLabel !== undefined && (
        <MaskedRise
          lines={[copy.stepLabel.toUpperCase()]}
          startFrame={labelStartFrame}
          fontSize={metaFontSize}
          fontWeight={500}
          color={labelColor}
          style={{ left: layout.stepLabel.left, top: layout.stepLabel.top }}
          {...exitProps}
        />
      )}
      <MaskedRise
        lines={[copy.headline]}
        startFrame={headlineStartFrame}
        fontSize={layout.headlineFontSize}
        color={color}
        letterSpacing={letterSpacings.display}
        isOpticallyPulledLeft
        style={{ left: layout.headline.left, top: layout.headline.top }}
        {...exitProps}
      />
      <MaskedRise
        lines={copy.sentenceLines}
        startFrame={sentenceStartFrame}
        fontSize={layout.sentenceFontSize}
        lineHeight={SENTENCE_LINE_HEIGHT}
        color={color}
        style={{ left: layout.sentence.left, top: layout.sentence.top }}
        {...exitProps}
      />
    </>
  )
}
