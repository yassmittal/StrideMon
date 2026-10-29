import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion'
import { StrideMonMark } from '../../app-tour/components/StrideMonMark'
import { colors, dialColors, fontFamilies, fontWeights, letterSpacings } from '../../theme'
import { dialContent } from '../content'
import { endCardTimeline } from '../timeline'

// The end card, on the keypad's paper: the lockup pops in on the reference's logo cut, then the
// waitlist line, one part at a time, held to the end. In the film's 1080 px.

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const RISE_FRAMES = 9

function readRise(frame: number, startFrame: number): { opacity: number; translate: string } {
  const shown = interpolate(frame, [startFrame, startFrame + RISE_FRAMES], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  })
  return { opacity: shown, translate: `0 ${(1 - shown) * 24}px` }
}

export function EndCard() {
  const frame = useCurrentFrame()
  const lockupScale = interpolate(
    frame,
    [endCardTimeline.startFrame, endCardTimeline.lockupInEndFrame],
    [0.86, 1],
    {
      ...clamp,
      easing: Easing.out(Easing.back(1.6)),
    },
  )
  const lockupOpacity = interpolate(
    frame,
    [endCardTimeline.startFrame, endCardTimeline.startFrame + 3],
    [0, 1],
    clamp,
  )
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 70% 55% at 50% 42%, ${dialColors.paperLight}, ${dialColors.paper})`,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 72px',
      }}
    >
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -60 }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            scale: String(lockupScale),
            opacity: lockupOpacity,
          }}
        >
          <StrideMonMark size={96} />
          <span
            style={{
              fontFamily: fontFamilies.satoshi,
              fontWeight: fontWeights.medium,
              fontSize: 84,
              letterSpacing: letterSpacings.display,
              color: dialColors.ink,
            }}
          >
            {dialContent.wordmark}
          </span>
        </div>
        <div
          style={{
            marginTop: 110,
            fontFamily: fontFamilies.dialSerif,
            fontStyle: 'italic',
            fontWeight: fontWeights.regular,
            fontSize: 82,
            lineHeight: 1.1,
            textAlign: 'center',
            color: dialColors.ink,
            ...readRise(frame, endCardTimeline.headlineInFrame),
          }}
        >
          {dialContent.headline}
        </div>
        <div
          style={{
            marginTop: 36,
            maxWidth: 880,
            fontFamily: fontFamilies.satoshi,
            fontWeight: fontWeights.regular,
            fontSize: 52,
            lineHeight: 1.3,
            textAlign: 'center',
            color: dialColors.inkSecondary,
            ...readRise(frame, endCardTimeline.bodyInFrame),
          }}
        >
          {dialContent.body}
        </div>
        <div
          style={{
            marginTop: 72,
            padding: '24px 44px',
            borderRadius: 999,
            backgroundColor: dialColors.ink,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            fontFamily: fontFamilies.satoshi,
            fontWeight: fontWeights.medium,
            fontSize: 42,
            color: colors.textOnDark,
            ...readRise(frame, endCardTimeline.linkInFrame),
          }}
        >
          {dialContent.link}
          <span style={{ color: colors.highlight }}>→</span>
        </div>
      </div>
    </AbsoluteFill>
  )
}
