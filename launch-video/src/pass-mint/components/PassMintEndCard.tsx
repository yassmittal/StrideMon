import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion'
import { ArrowIcon } from '../../components/ArrowIcon'
import { MaskedRise } from '../../components/MaskedRise'
import { colors, easings, fontFamilies, fontWeights, letterSpacings } from '../../theme'
import { endCardLines } from '../content'
import { endCardTimeline } from '../timeline'

// The end card: #0039's own gallery card on the left, the offer and the address on the right, on
// black. It cuts in on a hard cut from the reveal.

const CARD_FILE = staticFile('pass-mint/card-0039.svg')
const CARD_SIZE = 640
const HEADLINE_FONT_SIZE = 76
const BODY_FONT_SIZE = 34
const PILL_FONT_SIZE = 34
const PILL_HEIGHT = 84

export function PassMintEndCard() {
  const frame = useCurrentFrame()
  const { startFrame, lineStaggerFrames, pillFrame } = endCardTimeline
  const cardProgress = interpolate(frame, [startFrame, startFrame + 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easings.outExpo,
  })
  const bodyFrame = startFrame + lineStaggerFrames * 2
  const bodyProgress = interpolate(frame, [bodyFrame, bodyFrame + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easings.outExpo,
  })
  const pillProgress = interpolate(frame, [pillFrame, pillFrame + 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easings.outExpo,
  })

  return (
    <AbsoluteFill style={{ backgroundColor: colors.darkBackground }}>
      <Img
        src={CARD_FILE}
        style={{
          position: 'absolute',
          left: 150,
          top: (1080 - CARD_SIZE) / 2,
          width: CARD_SIZE,
          height: CARD_SIZE,
          borderRadius: 24,
          opacity: cardProgress,
          scale: `${0.94 + cardProgress * 0.06}`,
        }}
      />
      <div style={{ position: 'absolute', left: 880, top: 300 }}>
        <MaskedRise
          lines={endCardLines.headline}
          startFrame={startFrame}
          fontSize={HEADLINE_FONT_SIZE}
          color={colors.textOnDark}
          letterSpacing={letterSpacings.display}
          lineHeight={1.1}
          style={{ left: 0, top: 0 }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 880,
          top: 520,
          width: 900,
          fontFamily: fontFamilies.satoshi,
          fontWeight: fontWeights.regular,
          fontSize: BODY_FONT_SIZE,
          lineHeight: 1.3,
          color: colors.textOnDarkSecondary,
          opacity: bodyProgress,
          translate: `0px ${(1 - bodyProgress) * 16}px`,
        }}
      >
        {endCardLines.waitlist}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 880,
          top: 620,
          height: PILL_HEIGHT,
          padding: '0 40px',
          borderRadius: PILL_HEIGHT,
          backgroundColor: colors.highlight,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          fontFamily: fontFamilies.satoshi,
          fontWeight: fontWeights.medium,
          fontSize: PILL_FONT_SIZE,
          color: colors.textPrimary,
          opacity: pillProgress,
          scale: `${0.9 + pillProgress * 0.1}`,
          transformOrigin: 'left center',
        }}
      >
        {endCardLines.url}
        <ArrowIcon size={30} color={colors.textPrimary} />
      </div>
    </AbsoluteFill>
  )
}
