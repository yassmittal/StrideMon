import { AbsoluteFill } from 'remotion'
import { readSceneDurationInFrames, toSceneBeatFrame } from '../beats'
import { Drift } from '../components/Drift'
import { SneakerArt, toSneakerArtFileName, useSneakerArtMarkups } from '../components/SneakerArt'
import { StepText } from '../components/StepText'
import { getSneakerContent } from '../content'
import { filmLayouts } from '../layouts'
import { colors } from '../theme'
import type { SceneProps } from './scene-props'

// The starter Sneaker's stats: level 1, durability 100 (MVP.md §4), drawn by the contract.
const STARTER_ART_FILE_NAMES = [toSneakerArtFileName({ level: 1, durability: 100 })]
const ART_RADIUS_PIXELS = 20

/** Scene 2 (0:04–0:10), off-white. Step 1: the contract's own Sneaker art draws in. */
export function GetSneakerScene({ format }: SceneProps) {
  const layout = filmLayouts[format]
  const { art } = layout.getSneaker
  const markups = useSneakerArtMarkups(STARTER_ART_FILE_NAMES)
  const markup = markups?.get(STARTER_ART_FILE_NAMES[0] ?? '')

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      <Drift durationInFrames={readSceneDurationInFrames('getSneaker')}>
        {markup !== undefined && (
          <div style={{ position: 'absolute', left: art.left, top: art.top }}>
            <SneakerArt
              markup={markup}
              size={art.width}
              drawInStartFrame={0}
              borderRadius={ART_RADIUS_PIXELS}
            />
          </div>
        )}
        <StepText
          copy={getSneakerContent}
          layout={layout.stepText}
          metaFontSize={layout.metaFontSize}
          color={colors.textPrimary}
          labelColor={colors.textSecondarySmall}
          labelStartFrame={0}
          headlineStartFrame={toSceneBeatFrame('getSneaker', 1)}
          sentenceStartFrame={toSceneBeatFrame('getSneaker', 2)}
        />
      </Drift>
    </AbsoluteFill>
  )
}
