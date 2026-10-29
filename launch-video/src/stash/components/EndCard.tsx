import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { StrideMonMark } from '../../app-tour/components/StrideMonMark'
import { MaskedRise } from '../../components/MaskedRise'
import {
  colors,
  easings,
  fontFamilies,
  fontWeights,
  letterSpacings,
  radii,
  stashColors,
} from '../../theme'
import { stashContent } from '../content'
import { endCardTimeline } from '../timeline'

// The end card, over the held case (StashFilm blurs and darkens it on the beat): the mark, the
// waitlist line and the link, centred. Frames are the card's own, from its first.

const MARK_SIZE = 112
const HEADLINE_FONT_SIZE = 88
const BODY_FONT_SIZE = 54
const LINK_FONT_SIZE = 36

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

export function EndCard() {
  const frame = useCurrentFrame()
  const markIn = interpolate(
    frame,
    [endCardTimeline.markInFrame, endCardTimeline.markInFrame + 14],
    [0, 1],
    {
      ...clamp,
      easing: easings.outExpo,
    },
  )
  const linkIn = interpolate(
    frame,
    [endCardTimeline.linkInFrame, endCardTimeline.linkInFrame + 16],
    [0, 1],
    {
      ...clamp,
      easing: easings.outExpo,
    },
  )
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 80px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44 }}>
        <div style={{ opacity: markIn, transform: `scale(${0.8 + markIn * 0.2})` }}>
          <StrideMonMark size={MARK_SIZE} />
        </div>
        <MaskedRise
          lines={[stashContent.headline]}
          startFrame={endCardTimeline.headlineStartFrame}
          fontSize={HEADLINE_FONT_SIZE}
          color={colors.textOnDark}
          lineHeight={1.08}
          letterSpacing={letterSpacings.display}
          style={{ position: 'relative', textAlign: 'center' }}
        />
        <MaskedRise
          lines={stashContent.bodyLines}
          startFrame={endCardTimeline.bodyStartFrame}
          fontSize={BODY_FONT_SIZE}
          color={stashColors.bodyText}
          lineHeight={1.25}
          style={{ position: 'relative', textAlign: 'center' }}
        />
        <div
          style={{
            marginTop: 12,
            opacity: linkIn,
            transform: `translateY(${(1 - linkIn) * 24}px)`,
            backgroundColor: colors.highlight,
            color: colors.darkPanel,
            borderRadius: radii.pill,
            padding: '22px 40px',
            fontFamily: fontFamilies.mono,
            fontWeight: fontWeights.medium,
            fontSize: LINK_FONT_SIZE,
            lineHeight: 1,
          }}
        >
          {stashContent.link}
        </div>
      </div>
    </AbsoluteFill>
  )
}
