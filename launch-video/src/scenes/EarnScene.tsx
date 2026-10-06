import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from 'remotion'
import { readSceneDurationInFrames, toSceneBeatFrame } from '../beats'
import { Drift } from '../components/Drift'
import { CroppedFootage } from '../components/Footage'
import { MaskedRise } from '../components/MaskedRise'
import { StepText } from '../components/StepText'
import { earnContent, TOKEN_SYMBOL } from '../content'
import { filmLayouts } from '../layouts'
import { colors, easings, fontFamilies } from '../theme'
import type { SceneProps } from './scene-props'

// stop-tap.mp4 starts at video2 252.80 s and the pill presses at 253.31 s (FOOTAGE.md M4):
// trimming 1 frame lands the press on the scene's beat 1 (earnSceneBeats.stopTap). The crop
// shows the pill and the GPS line only: no token name, and never the +15 estimate.
const STOP_TAP_TRIM_FRAMES = 1
const REWARD_NUMBER_SLOTS = 3
const MONO_CHARACTER_WIDTH_EM = 0.6

/** The earn scene's grid, in beats from its first frame. */
export const earnSceneBeats = {
  stopTap: 1,
  flip: 3,
  rewardLanding: 4,
} as const

/**
 * Scene 4 (0:16–0:23). Step 3. Black: the real STOP tap. On the flip the section turns off-white
 * and +10 STRIDE counts up, landing on the next beat. Every element flips colour with it.
 */
export function EarnScene({ format }: SceneProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const layout = filmLayouts[format]
  const flipFrame = toSceneBeatFrame('earn', earnSceneBeats.flip)
  const isFlipped = frame >= flipFrame

  return (
    <AbsoluteFill
      style={{ backgroundColor: isFlipped ? colors.background : colors.darkBackground }}
    >
      <Drift durationInFrames={readSceneDurationInFrames('earn')}>
        <Sequence name="STOP tap" durationInFrames={flipFrame} premountFor={fps}>
          <CroppedFootage
            fileName="stop-tap.mp4"
            crop={layout.earn.stopCrop}
            trimBeforeFrames={STOP_TAP_TRIM_FRAMES}
          />
        </Sequence>
        <Sequence name={`+10 ${TOKEN_SYMBOL}`} from={flipFrame} premountFor={fps}>
          <Reward format={format} flipFrame={flipFrame} />
        </Sequence>
        <StepText
          copy={earnContent}
          layout={layout.stepText}
          metaFontSize={layout.metaFontSize}
          color={isFlipped ? colors.textPrimary : colors.textOnDark}
          labelColor={isFlipped ? colors.textSecondarySmall : colors.textOnDarkSecondary}
          labelStartFrame={0}
          headlineStartFrame={toSceneBeatFrame('earn', earnSceneBeats.stopTap)}
          sentenceStartFrame={toSceneBeatFrame('earn', earnSceneBeats.rewardLanding)}
        />
      </Drift>
    </AbsoluteFill>
  )
}

/** The off-white half. Its frame 0 is the flip. */
function Reward({ format, flipFrame }: SceneProps & { flipFrame: number }) {
  const frame = useCurrentFrame()
  const layout = filmLayouts[format]
  const { reward } = layout.earn
  const landingFrame = toSceneBeatFrame('earn', earnSceneBeats.rewardLanding) - flipFrame
  const shownReward = Math.round(
    interpolate(frame, [0, landingFrame], [0, earnContent.rewardNumber], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: easings.outExpo,
    }),
  )

  return (
    <AbsoluteFill>
      <MaskedRise
        lines={[earnContent.metaItems.join('  •  ').toUpperCase()]}
        startFrame={0}
        fontSize={layout.metaFontSize}
        fontWeight={500}
        color={colors.textPrimary}
        style={{ left: reward.meta.left, top: reward.meta.top }}
      />
      <div
        style={{
          position: 'absolute',
          left: reward.number.left,
          top: reward.number.top,
          display: 'flex',
          alignItems: 'baseline',
          gap: reward.symbolFontSize * 0.25,
          color: colors.textPrimary,
        }}
      >
        <span
          style={{
            fontFamily: fontFamilies.mono,
            fontSize: reward.numberFontSize,
            lineHeight: 1,
            width: `${REWARD_NUMBER_SLOTS * MONO_CHARACTER_WIDTH_EM}em`,
            textAlign: 'right',
            marginLeft: `${-0.04}em`,
          }}
        >
          {`+${shownReward}`}
        </span>
        <span
          style={{
            fontFamily: fontFamilies.satoshi,
            fontSize: reward.symbolFontSize,
            lineHeight: 1,
          }}
        >
          {TOKEN_SYMBOL}
        </span>
      </div>
      <MaskedRise
        lines={[earnContent.noteItems.join('  •  ').toUpperCase()]}
        startFrame={landingFrame}
        fontSize={layout.metaFontSize}
        fontWeight={500}
        color={colors.textSecondarySmall}
        style={{ left: reward.note.left, top: reward.note.top }}
      />
    </AbsoluteFill>
  )
}
