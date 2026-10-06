import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion'
import { readSceneDurationInFrames, toSceneBeatFrame } from '../beats'
import { ClipRise } from '../components/ClipRise'
import { CrossMarks } from '../components/CrossMarks'
import { Drift } from '../components/Drift'
import { CroppedFootage } from '../components/Footage'
import { LABEL_ROLL_DURATION_FRAMES, LabelRoll } from '../components/LabelRoll'
import { MaskedRise } from '../components/MaskedRise'
import { SneakerArt, toSneakerArtFileName, useSneakerArtMarkups } from '../components/SneakerArt'
import { ownItContent, walletAddresses } from '../content'
import { type FootageCrop, filmLayouts } from '../layouts'
import { colors, fontFamilies } from '../theme'
import type { SceneProps } from './scene-props'

const TRANSFER_ART_FILE_NAMES = [toSneakerArtFileName({ level: 2, durability: 100 })]
const FRAME_RADIUS_PIXELS = 16
const TRANSFER_BEAT = 7
/** Beats after the transfer starts when the owner rolls from wallet A to wallet B. */
const OWNER_ROLL_BEATS_AFTER_TRANSFER = 2

/** The scene frame where the owner's address lands on wallet B. */
export function readOwnerRollLandingFrame(): number {
  return (
    toSceneBeatFrame('ownIt', TRANSFER_BEAT) +
    toSceneBeatFrame('ownIt', OWNER_ROLL_BEATS_AFTER_TRANSFER) +
    LABEL_ROLL_DURATION_FRAMES
  )
}

/**
 * Scene 5 (0:24–0:31), off-white. "Not points in an app. An NFT in your wallet." The same
 * Sneaker in the app and on MonadVision, then the transfer: the owner rolls from wallet A to
 * wallet B while the stats stay put.
 */
export function OwnItScene({ format }: SceneProps) {
  const { fps } = useVideoConfig()
  const durationInFrames = readSceneDurationInFrames('ownIt')
  const transferStartFrame = toSceneBeatFrame('ownIt', TRANSFER_BEAT)

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      <Drift durationInFrames={durationInFrames}>
        <Sequence name="Same picture" durationInFrames={transferStartFrame} premountFor={fps}>
          <SamePicture format={format} exitFrame={transferStartFrame - 12} />
        </Sequence>
        <Sequence name="Transfer" from={transferStartFrame} premountFor={fps}>
          <Transfer format={format} />
        </Sequence>
      </Drift>
    </AbsoluteFill>
  )
}

function SamePicture({ format, exitFrame }: SceneProps & { exitFrame: number }) {
  const frame = useCurrentFrame()
  const layout = filmLayouts[format]
  const { ownIt } = layout
  const framesStartFrame = toSceneBeatFrame('ownIt', 2)
  const opacity = frame < exitFrame ? 1 : Math.max(0, 1 - (frame - exitFrame) / 12)

  return (
    <AbsoluteFill style={{ opacity }}>
      <MaskedRise
        lines={ownItContent.statement}
        startFrame={0}
        fontSize={ownIt.statementFontSize}
        lineHeight={1.05}
        color={colors.textPrimary}
        style={{ left: ownIt.statement.left, top: ownIt.statement.top }}
      />
      <MaskedRise
        lines={[ownItContent.framesMetaItems.join('  •  ').toUpperCase()]}
        startFrame={framesStartFrame}
        fontSize={layout.metaFontSize}
        fontWeight={500}
        color={colors.textPrimary}
        style={{ left: ownIt.framesMeta.left, top: ownIt.framesMeta.top }}
      />
      <FootageFrame
        crop={ownIt.appCrop}
        fileName="app-home-level-02.mp4"
        label={ownItContent.appFrameLabel}
        labelTop={ownIt.framesLabelTop}
        metaFontSize={layout.metaFontSize}
        startFrame={framesStartFrame}
      />
      <FootageFrame
        crop={ownIt.explorerCrop}
        fileName="monadvision-level-02.mp4"
        label={ownItContent.explorerFrameLabel}
        labelTop={ownIt.framesLabelTop}
        metaFontSize={layout.metaFontSize}
        startFrame={framesStartFrame + 6}
      />
    </AbsoluteFill>
  )
}

function FootageFrame({
  crop,
  fileName,
  label,
  labelTop,
  metaFontSize,
  startFrame,
}: {
  crop: FootageCrop
  fileName: string
  label: string
  labelTop: number
  metaFontSize: number
  startFrame: number
}) {
  const width = (crop.sourceWidth ?? 0) * crop.scale
  const height = crop.sourceHeight * crop.scale
  return (
    <>
      <ClipRise
        startFrame={startFrame}
        style={{
          left: crop.frame.left,
          top: crop.frame.top,
          width,
          height,
          borderRadius: FRAME_RADIUS_PIXELS,
        }}
      >
        <CroppedFootage fileName={fileName} crop={{ ...crop, frame: { left: 0, top: 0 } }} />
      </ClipRise>
      <MaskedRise
        lines={[label.toUpperCase()]}
        startFrame={startFrame + 6}
        fontSize={metaFontSize}
        fontWeight={500}
        color={colors.textSecondarySmall}
        style={{ left: crop.frame.left, top: labelTop }}
      />
    </>
  )
}

function Transfer({ format }: SceneProps) {
  const layout = filmLayouts[format]
  const { ownIt } = layout
  const markups = useSneakerArtMarkups(TRANSFER_ART_FILE_NAMES)
  const markup = markups?.get(TRANSFER_ART_FILE_NAMES[0] ?? '')
  const ownerFontSize = layout.monoCalloutFontSize * 0.8
  const ownerRollFrame = toSceneBeatFrame('ownIt', OWNER_ROLL_BEATS_AFTER_TRANSFER)

  return (
    <AbsoluteFill>
      {markup !== undefined && (
        <ClipRise
          startFrame={0}
          style={{
            left: ownIt.transferArt.left,
            top: ownIt.transferArt.top,
            width: ownIt.transferArt.width,
            height: ownIt.transferArt.height,
            borderRadius: FRAME_RADIUS_PIXELS,
          }}
        >
          <SneakerArt markup={markup} size={ownIt.transferArt.width} />
        </ClipRise>
      )}
      <CrossMarks
        box={{ left: ownIt.owner.left - 24, top: ownIt.owner.top - 24, width: 430, height: 170 }}
        color={colors.crossMark}
        contentStartFrame={4}
      />
      <MaskedRise
        lines={[ownItContent.ownerLabel.toUpperCase()]}
        startFrame={4}
        fontSize={layout.metaFontSize}
        fontWeight={500}
        color={colors.textSecondarySmall}
        style={{ left: ownIt.owner.left, top: ownIt.owner.top }}
      />
      <ClipRise
        startFrame={8}
        style={{
          left: ownIt.owner.left,
          top: ownIt.owner.top + 48,
          width: 420,
          height: ownerFontSize * 1.2,
        }}
      >
        <LabelRoll
          steps={[
            { startFrame: 0, text: walletAddresses.playerA.short },
            { startFrame: ownerRollFrame, text: walletAddresses.playerB.short },
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
      <MaskedRise
        lines={[ownItContent.lockedStatsItems.join('  •  ').toUpperCase()]}
        startFrame={8}
        fontSize={layout.metaFontSize}
        fontWeight={500}
        color={colors.textPrimary}
        style={{ left: ownIt.lockedStats.left, top: ownIt.lockedStats.top }}
      />
      <MaskedRise
        lines={ownItContent.transferCaption}
        startFrame={0}
        fontSize={ownIt.transferCaptionFontSize}
        lineHeight={1.1}
        color={colors.textPrimary}
        style={{ left: ownIt.caption.left, top: ownIt.caption.top }}
      />
    </AbsoluteFill>
  )
}
