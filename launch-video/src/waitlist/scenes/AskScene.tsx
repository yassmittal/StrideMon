import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { ArrowIcon } from '../../components/ArrowIcon'
import { ClipRise } from '../../components/ClipRise'
import { Drift } from '../../components/Drift'
import { LabelRoll } from '../../components/LabelRoll'
import { MaskedRise } from '../../components/MaskedRise'
import {
  colors,
  easings,
  floatingPillShadow,
  fontFamilies,
  fontWeights,
  letterSpacings,
  radii,
} from '../../theme'
import { readWaitlistSceneDurationInFrames, toWaitlistSceneBeatFrame } from '../beats'
import { askContent, waitlistEndCardContent } from '../content'
import { FORM_SCALE, waitlistLayout } from '../layout'

const HEADLINE_LINE_HEIGHT = 0.95

/** The ask's grid, in beats from its first frame. The end card is its last part. */
export const askSceneBeats = {
  headline: 0,
  sentence: 0.5,
  panel: 1,
  fieldFill: 2,
  press: 3,
  joined: 4,
  endCardFlip: 9,
  endCardPill: 9,
  endCardBrand: 9.5,
} as const

/** The site's press: the pill steps from primary to ink over 300 ms (`active:bg-ink`). */
const PRESS_FRAMES = 18

/**
 * Scene 5 (0:15–0:23). Off-white: "Join the waitlist. Mint 48 hours before everyone else." and a
 * vector rebuild of the site's waitlist panel. The field fills with the form's own placeholder
 * address, JOIN THE WAITLIST presses as the site's does, and the panel answers "You're on the
 * list." Then a flip to black for the end card: the same two lines, the address and the brand. The
 * last frame is the poster.
 */
export function AskScene() {
  const frame = useCurrentFrame()
  const { ask, gutter, metaFontSize, metaTop } = waitlistLayout
  const endCardFrame = toWaitlistSceneBeatFrame('ask', askSceneBeats.endCardFlip)
  const isEndCard = frame >= endCardFrame
  const textColor = isEndCard ? colors.textOnDark : colors.textPrimary

  return (
    <AbsoluteFill
      style={{ backgroundColor: isEndCard ? colors.darkBackground : colors.background }}
    >
      <Drift durationInFrames={readWaitlistSceneDurationInFrames('ask')}>
        <MaskedRise
          lines={[askContent.metaItems.join('  •  ').toUpperCase()]}
          startFrame={0}
          fontSize={metaFontSize}
          fontWeight={500}
          color={isEndCard ? colors.textOnDarkSecondary : colors.textSecondarySmall}
          style={{ left: gutter, top: metaTop }}
        />
        <MaskedRise
          lines={[askContent.headline]}
          startFrame={toWaitlistSceneBeatFrame('ask', askSceneBeats.headline)}
          fontSize={ask.headlineFontSize}
          lineHeight={HEADLINE_LINE_HEIGHT}
          letterSpacing={letterSpacings.display}
          color={textColor}
          isOpticallyPulledLeft
          style={{ left: ask.headline.left, top: ask.headline.top }}
        />
        <MaskedRise
          lines={askContent.sentenceLines}
          startFrame={toWaitlistSceneBeatFrame('ask', askSceneBeats.sentence)}
          fontSize={ask.sentenceFontSize}
          lineHeight={HEADLINE_LINE_HEIGHT}
          letterSpacing={letterSpacings.display}
          color={textColor}
          isOpticallyPulledLeft
          style={{ left: ask.sentence.left, top: ask.sentence.top }}
        />
        {isEndCard ? <EndCard /> : <WaitlistPanel />}
      </Drift>
    </AbsoluteFill>
  )
}

/** The site's waitlist panel (waitlist-section.tsx, waitlist-form.tsx) at 2.5×, phone choice left out. */
function WaitlistPanel() {
  const frame = useCurrentFrame()
  const { panel } = waitlistLayout.ask
  const { metaFontSize } = waitlistLayout
  const scale = (pixels: number) => pixels * FORM_SCALE
  const fieldFillFrame = toWaitlistSceneBeatFrame('ask', askSceneBeats.fieldFill)
  const pressFrame = toWaitlistSceneBeatFrame('ask', askSceneBeats.press)
  const joinedFrame = toWaitlistSceneBeatFrame('ask', askSceneBeats.joined)
  const isJoined = frame >= joinedFrame
  const fieldTextSize = scale(16)
  const pillTextSize = scale(14)

  return (
    <ClipRise
      startFrame={toWaitlistSceneBeatFrame('ask', askSceneBeats.panel)}
      style={{
        left: panel.left,
        top: panel.top,
        width: panel.width,
        borderRadius: scale(10),
      }}
    >
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: scale(10),
          padding: scale(30),
          display: 'flex',
          flexDirection: 'column',
          fontFamily: fontFamilies.satoshi,
          color: colors.textPrimary,
          position: 'relative',
        }}
      >
        {isJoined ? (
          <div style={{ position: 'relative', height: scale(110) }}>
            <MaskedRise
              lines={[askContent.joinedHeadline]}
              startFrame={joinedFrame}
              fontSize={scale(40)}
              lineHeight={1.05}
              letterSpacing={letterSpacings.displayLarge}
              color={colors.textPrimary}
              style={{ left: 0, top: 0 }}
            />
            <MaskedRise
              lines={[askContent.joinedSentence]}
              startFrame={joinedFrame + 8}
              fontSize={metaFontSize + 4}
              color={colors.textSecondarySmall}
              style={{ left: 0, top: scale(62) }}
            />
          </div>
        ) : (
          <>
            <div
              style={{
                fontSize: metaFontSize,
                fontWeight: fontWeights.medium,
                letterSpacing: '0.08em',
                lineHeight: 1.15,
                textTransform: 'uppercase',
                color: colors.textSecondarySmall,
              }}
            >
              {askContent.emailLabel}
            </div>
            <div
              style={{
                marginTop: scale(10),
                height: scale(52),
                borderRadius: radii.pill,
                border: `${scale(1)}px solid ${frame >= fieldFillFrame ? colors.textPrimary : colors.overlayOnLight}`,
                backgroundColor: colors.background,
                padding: `0 ${scale(20)}px`,
                display: 'flex',
                alignItems: 'center',
                fontSize: fieldTextSize,
              }}
            >
              <LabelRoll
                steps={[
                  { startFrame: 0, text: askContent.emailPlaceholder },
                  { startFrame: fieldFillFrame, text: askContent.emailValue },
                ]}
                lineHeightPixels={fieldTextSize * 1.3}
                style={{
                  width: '100%',
                  lineHeight: 1.3,
                  color: frame >= fieldFillFrame ? colors.textPrimary : colors.textSecondary,
                }}
              />
            </div>
            <div
              style={{
                marginTop: scale(24),
                alignSelf: 'flex-start',
                height: scale(45),
                borderRadius: radii.pill,
                backgroundColor: readPressedPillColor(frame, pressFrame),
                color: colors.textOnDark,
                padding: `0 ${scale(16)}px 0 ${scale(23)}px`,
                display: 'flex',
                alignItems: 'center',
                gap: scale(10),
                fontWeight: fontWeights.medium,
                fontSize: pillTextSize,
                textTransform: 'uppercase',
              }}
            >
              <LabelRoll
                steps={[
                  { startFrame: 0, text: askContent.submitLabel },
                  { startFrame: pressFrame, text: askContent.submittingLabel },
                ]}
                lineHeightPixels={pillTextSize * 1.15}
                style={{ width: pillTextSize * 9.4, lineHeight: 1.15 }}
              />
              <ArrowIcon size={scale(16)} color={colors.textOnDark} />
            </div>
            <div
              style={{
                marginTop: scale(16),
                fontSize: metaFontSize + 4,
                lineHeight: 1.4,
                color: colors.textSecondarySmall,
              }}
            >
              {askContent.promise}
            </div>
          </>
        )}
      </div>
    </ClipRise>
  )
}

/** primary (#2B2E3A) → ink (#000000) as the site's pill does on press, with its standard curve. */
function readPressedPillColor(frame: number, pressFrame: number): string {
  const progress = interpolate(frame, [pressFrame, pressFrame + PRESS_FRAMES], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easings.standard,
  })
  return progress >= 1
    ? colors.darkBackground
    : mixHex(colors.primary, colors.darkBackground, progress)
}

function mixHex(fromHex: string, toHex: string, amount: number): string {
  const channels = (hex: string) =>
    [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16))
  const fromChannels = channels(fromHex)
  const toChannels = channels(toHex)
  return `rgb(${fromChannels
    .map((channel, index) => Math.round(channel + ((toChannels[index] ?? 0) - channel) * amount))
    .join(', ')})`
}

/** On black: the address as the site's white pill, then the wordmark and the network. */
function EndCard() {
  const frame = useCurrentFrame()
  const { endCard, metaFontSize } = waitlistLayout
  const pillFrame = toWaitlistSceneBeatFrame('ask', askSceneBeats.endCardPill)
  const brandFrame = toWaitlistSceneBeatFrame('ask', askSceneBeats.endCardBrand)

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: endCard.pill.left,
          top: endCard.pill.top,
          height: endCard.pillHeight,
          borderRadius: radii.pill,
          backgroundColor: colors.surface,
          boxShadow: floatingPillShadow,
          display: 'flex',
          alignItems: 'center',
          gap: endCard.pillHeight * 0.3,
          padding: `0 ${endCard.pillHeight * 0.4}px 0 ${endCard.pillHeight * 0.45}px`,
          fontFamily: fontFamilies.satoshi,
          fontWeight: fontWeights.medium,
          fontSize: endCard.pillFontSize,
          color: colors.textPrimary,
          opacity: interpolate(frame, [pillFrame, pillFrame + 18], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: easings.standard,
          }),
          translate: interpolate(frame, [pillFrame, pillFrame + 24], ['0px 24px', '0px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: easings.outExpo,
          }),
        }}
      >
        {waitlistEndCardContent.siteLabel}
        <ArrowIcon size={endCard.pillFontSize * 1.1} color={colors.textPrimary} />
      </div>
      <MaskedRise
        lines={[waitlistEndCardContent.wordmark]}
        startFrame={brandFrame}
        fontSize={endCard.wordmarkFontSize}
        letterSpacing={letterSpacings.displayLarge}
        color={colors.textOnDark}
        style={{ left: endCard.brand.left, top: endCard.brand.top }}
      />
      <div
        style={{
          position: 'absolute',
          left: endCard.brand.left,
          top: endCard.brand.top + endCard.wordmarkFontSize * 1.25,
          display: 'flex',
          alignItems: 'center',
          gap: metaFontSize * 0.5,
        }}
      >
        <div
          style={{
            width: metaFontSize * 0.33,
            height: metaFontSize * 0.33,
            borderRadius: radii.pill,
            backgroundColor: colors.highlight,
            opacity: frame >= brandFrame + 4 ? 1 : 0,
          }}
        />
        <MaskedRise
          lines={[waitlistEndCardContent.metaItems.join('  •  ').toUpperCase()]}
          startFrame={brandFrame + 4}
          fontSize={metaFontSize}
          fontWeight={500}
          color={colors.textOnDarkSecondary}
          style={{ position: 'relative' }}
        />
      </div>
    </>
  )
}
