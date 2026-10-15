import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { ArrowIcon } from '../../components/ArrowIcon'
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
import { sneakerDropEndCardContent } from '../content'
import { type SneakerDropFormat, sneakerDropLayouts } from '../layout'
import { readDriftScale } from '../motion'
import { END_CARD_FRAME } from '../timeline'

// After the stop there are no more hits, so the end card's parts follow each other by frames,
// as the waitlist film's end card does: the pill, then the wordmark, then the network.
const BRAND_DELAY_FRAMES = 8
const META_DELAY_FRAMES = 12

/**
 * Scene 7 (beat 44 to the end), on black. The music stops and the end card cuts in on the
 * silence: the site as the website's white pill, the StrideMon wordmark and MONAD TESTNET. It
 * holds through the tail and is the poster frame.
 */
export function EndCardScene({ format }: { format: SneakerDropFormat }) {
  const frame = useCurrentFrame()
  const { endCard, metaFontSize } = sneakerDropLayouts[format]
  const brandFrame = END_CARD_FRAME + BRAND_DELAY_FRAMES

  return (
    <AbsoluteFill style={{ backgroundColor: colors.darkBackground }}>
      <AbsoluteFill style={{ scale: readDriftScale(frame - END_CARD_FRAME) }}>
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
            translate: interpolate(
              frame,
              [END_CARD_FRAME, END_CARD_FRAME + 24],
              ['0px 24px', '0px 0px'],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.outExpo },
            ),
          }}
        >
          {sneakerDropEndCardContent.siteLabel}
          <ArrowIcon size={endCard.pillFontSize * 1.1} color={colors.textPrimary} />
        </div>
        <MaskedRise
          lines={[sneakerDropEndCardContent.wordmark]}
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
              opacity: frame >= END_CARD_FRAME + META_DELAY_FRAMES ? 1 : 0,
            }}
          />
          <MaskedRise
            lines={[sneakerDropEndCardContent.metaItems.join('  •  ').toUpperCase()]}
            startFrame={END_CARD_FRAME + META_DELAY_FRAMES}
            fontSize={metaFontSize}
            fontWeight={fontWeights.medium}
            color={colors.textOnDarkSecondary}
            style={{ position: 'relative' }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
