import { AbsoluteFill } from 'remotion'
import { readSceneDurationInFrames, toSceneBeatFrame } from '../beats'
import { Drift } from '../components/Drift'
import { MaskedRise } from '../components/MaskedRise'
import { introContent } from '../content'
import { filmLayouts } from '../layouts'
import { colors, letterSpacings } from '../theme'
import type { SceneProps } from './scene-props'

const HEADLINE_LINE_HEIGHT = 0.95

/**
 * Scene 1 (0:00–0:04), black. Says what StrideMon is before anything else: nobody has heard of it
 * yet. The name rises on the first frame and the one-line description two beats later.
 */
export function IntroScene({ format }: SceneProps) {
  const { intro } = filmLayouts[format]
  return (
    <AbsoluteFill style={{ backgroundColor: colors.darkBackground }}>
      <Drift durationInFrames={readSceneDurationInFrames('intro')}>
        <MaskedRise
          lines={introContent.headlineLines}
          startFrame={0}
          fontSize={intro.headlineFontSize}
          lineHeight={HEADLINE_LINE_HEIGHT}
          letterSpacing={letterSpacings.display}
          color={colors.textOnDark}
          isOpticallyPulledLeft
          style={{ left: intro.headline.left, top: intro.headline.top }}
        />
        <MaskedRise
          lines={[introContent.sentence]}
          startFrame={toSceneBeatFrame('intro', 2)}
          fontSize={intro.sentenceFontSize}
          color={colors.textOnDarkSecondary}
          style={{ left: intro.sentence.left, top: intro.sentence.top }}
        />
      </Drift>
    </AbsoluteFill>
  )
}
