import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from 'remotion'
import { readSceneDurationInFrames, toSceneBeatFrame } from '../beats'
import { Drift } from '../components/Drift'
import { ExternalLinkLabel } from '../components/ExternalLinkLabel'
import { CroppedFootage, Footage } from '../components/Footage'
import { MaskedRise } from '../components/MaskedRise'
import { PhoneFrame } from '../components/PhoneFrame'
import { earnContent } from '../content'
import { filmLayouts } from '../layouts'
import { colors, easings, fontFamilies, letterSpacings } from '../theme'
import type { SceneProps } from './scene-props'

// stop-tap.mp4 starts at video2 252.80 s and the pill presses at 253.31 s (FOOTAGE.md M4):
// trimming 1 frame lands the press on the scene's beat 1 (earnSceneBeats.stopTap).
const STOP_TAP_TRIM_FRAMES = 1
const REWARD_NUMBER_SLOTS = 3

/** The earn scene's grid, in beats from its first frame. */
export const earnSceneBeats = {
  stopTap: 1,
  settle: 2,
  flip: 6,
  rewardLanding: 7,
  proof: 8,
} as const
const MONO_CHARACTER_WIDTH_EM = 0.6

/**
 * Scene 3 (0:08–0:15). Black: the real STOP tap, then "Settling on Monad…". On the downbeat the
 * section flips to off-white and +10 SOLE counts up, landing on the next beat, with the real
 * settle transaction under it.
 */
export function EarnScene({ format }: SceneProps) {
  const { fps } = useVideoConfig()
  const layout = filmLayouts[format]
  const settleStartFrame = toSceneBeatFrame('earn', earnSceneBeats.settle)
  const flipFrame = toSceneBeatFrame('earn', earnSceneBeats.flip)
  const durationInFrames = readSceneDurationInFrames('earn')

  return (
    <AbsoluteFill style={{ backgroundColor: colors.darkBackground }}>
      <Sequence name="STOP tap" durationInFrames={settleStartFrame} premountFor={fps}>
        <CroppedFootage
          fileName="stop-tap.mp4"
          crop={layout.earn.stopCrop}
          trimBeforeFrames={STOP_TAP_TRIM_FRAMES}
        />
      </Sequence>
      <Sequence
        name="Settling on Monad"
        from={settleStartFrame}
        durationInFrames={flipFrame - settleStartFrame}
        premountFor={fps}
      >
        <Drift durationInFrames={flipFrame - settleStartFrame}>
          <PhoneFrame box={layout.earn.settlePhone} tone="dark">
            <Footage fileName="settling.mp4" />
          </PhoneFrame>
        </Drift>
      </Sequence>
      <Sequence name="+10 SOLE" from={flipFrame} premountFor={fps}>
        <RewardSection
          format={format}
          flipFrame={flipFrame}
          durationInFrames={durationInFrames - flipFrame}
        />
      </Sequence>
    </AbsoluteFill>
  )
}

/** The off-white half. Its frame 0 is the flip. */
function RewardSection({
  format,
  flipFrame,
  durationInFrames,
}: SceneProps & { flipFrame: number; durationInFrames: number }) {
  const frame = useCurrentFrame()
  const layout = filmLayouts[format]
  const { reward, proof } = layout.earn
  // The last digit lands on the beat after the flip; the proof follows a beat later.
  const landingFrame = toSceneBeatFrame('earn', earnSceneBeats.rewardLanding) - flipFrame
  const proofStartFrame = toSceneBeatFrame('earn', earnSceneBeats.proof) - flipFrame
  const shownReward = Math.round(
    interpolate(frame, [0, landingFrame], [0, earnContent.rewardNumber], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: easings.outExpo,
    }),
  )
  const hashLineHeight = proof.hashFontSize * 1.25

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      <Drift durationInFrames={durationInFrames}>
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
            {earnContent.rewardSymbol}
          </span>
        </div>
        <MaskedRise
          lines={[earnContent.proofMetaItems.join('  •  ').toUpperCase()]}
          startFrame={proofStartFrame}
          fontSize={layout.metaFontSize}
          fontWeight={500}
          color={colors.textSecondarySmall}
          style={{ left: proof.origin.left, top: proof.origin.top }}
        />
        <MaskedRise
          lines={earnContent.transactionHashLines}
          startFrame={proofStartFrame + 4}
          fontSize={proof.hashFontSize}
          lineHeight={1.25}
          fontFamily={fontFamilies.mono}
          color={colors.textPrimary}
          style={{ left: proof.origin.left, top: proof.origin.top + layout.metaFontSize * 2 }}
        />
        <MaskedRise
          lines={earnContent.eventLines}
          startFrame={proofStartFrame + 12}
          fontSize={layout.metaFontSize}
          lineHeight={1.4}
          fontFamily={fontFamilies.mono}
          color={colors.textSecondarySmall}
          style={{
            left: proof.origin.left,
            top: proof.origin.top + layout.metaFontSize * 2.6 + 2 * hashLineHeight,
          }}
        />
        {frame >= proofStartFrame + 20 && (
          <ExternalLinkLabel
            label={earnContent.transactionLinkLabel}
            fontSize={layout.metaFontSize}
            color={colors.accent}
            left={proof.origin.left}
            top={proof.origin.top + layout.metaFontSize * 6.4 + 2 * hashLineHeight}
          />
        )}
        <MaskedRise
          lines={[earnContent.headline]}
          startFrame={landingFrame}
          fontSize={layout.headlineFontSize}
          color={colors.textPrimary}
          letterSpacing={letterSpacings.display}
          isOpticallyPulledLeft
          style={{
            left: layout.gutter,
            top: layout.headlineBaseline - layout.headlineFontSize * 0.86,
          }}
        />
      </Drift>
    </AbsoluteFill>
  )
}
