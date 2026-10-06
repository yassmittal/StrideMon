import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { readSceneDurationInFrames, toSceneBeatFrame } from '../beats'
import { ClipRise } from '../components/ClipRise'
import { Drift } from '../components/Drift'
import { LABEL_ROLL_DURATION_FRAMES, LabelRoll } from '../components/LabelRoll'
import { MaskedRise } from '../components/MaskedRise'
import { SneakerArt, toSneakerArtFileName, useSneakerArtMarkups } from '../components/SneakerArt'
import { StepText } from '../components/StepText'
import { ownItContent, walletAddresses } from '../content'
import { filmLayouts } from '../layouts'
import { colors, easings, fontFamilies } from '../theme'
import type { SceneProps } from './scene-props'

const ART_FILE_NAMES = [toSneakerArtFileName({ level: 2, durability: 100 })]
const ART_RADIUS_PIXELS = 16
const OWNER_IN_BEAT = 1
const OWNER_ROLL_BEAT = 5
/** The end card is off-white too, so the scene dips out instead of flipping. */
const EXIT_DIP_FRAMES = 12

/** The scene frame where the owner's address lands on wallet B. */
export function readOwnerRollLandingFrame(): number {
  return toSceneBeatFrame('ownIt', OWNER_ROLL_BEAT) + LABEL_ROLL_DURATION_FRAMES
}

/**
 * Scene 6 (0:31–0:38), off-white. The Sneaker is an NFT in the player's wallet: the owner rolls
 * from wallet A to wallet B (the real transfer, FACTS.md §6) and the art doesn't change.
 */
export function OwnItScene({ format }: SceneProps) {
  const frame = useCurrentFrame()
  const layout = filmLayouts[format]
  const { art, owner, ownerFontSize } = layout.ownIt
  const markups = useSneakerArtMarkups(ART_FILE_NAMES)
  const markup = markups?.get(ART_FILE_NAMES[0] ?? '')
  const durationInFrames = readSceneDurationInFrames('ownIt')
  const exitFrame = durationInFrames - EXIT_DIP_FRAMES
  const ownerStartFrame = toSceneBeatFrame('ownIt', OWNER_IN_BEAT)
  const opacity = interpolate(frame, [exitFrame, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easings.standard,
  })

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      <Drift durationInFrames={durationInFrames}>
        <AbsoluteFill style={{ opacity }}>
          {markup !== undefined && (
            <ClipRise
              startFrame={0}
              style={{
                left: art.left,
                top: art.top,
                width: art.width,
                height: art.height,
                borderRadius: ART_RADIUS_PIXELS,
              }}
            >
              <SneakerArt markup={markup} size={art.width} />
            </ClipRise>
          )}
          <MaskedRise
            lines={[ownItContent.ownerLabel.toUpperCase()]}
            startFrame={ownerStartFrame}
            fontSize={layout.metaFontSize}
            fontWeight={500}
            color={colors.textSecondarySmall}
            style={{ left: owner.left, top: owner.top }}
          />
          <ClipRise
            startFrame={ownerStartFrame + 4}
            style={{
              left: owner.left,
              top: owner.top + 48,
              width: ownerFontSize * 0.6 * 12,
              height: ownerFontSize * 1.2,
            }}
          >
            <LabelRoll
              steps={[
                { startFrame: 0, text: walletAddresses.playerA.short },
                {
                  startFrame: toSceneBeatFrame('ownIt', OWNER_ROLL_BEAT),
                  text: walletAddresses.playerB.short,
                },
              ]}
              lineHeightPixels={ownerFontSize * 1.2}
              style={{
                fontFamily: fontFamilies.mono,
                fontSize: ownerFontSize,
                lineHeight: 1.2,
                color: colors.textPrimary,
              }}
            />
          </ClipRise>
          <StepText
            copy={ownItContent}
            layout={layout.stepText}
            metaFontSize={layout.metaFontSize}
            color={colors.textPrimary}
            labelColor={colors.textSecondarySmall}
            labelStartFrame={0}
            headlineStartFrame={toSceneBeatFrame('ownIt', 1)}
            sentenceStartFrame={toSceneBeatFrame('ownIt', 2)}
          />
        </AbsoluteFill>
      </Drift>
    </AbsoluteFill>
  )
}
