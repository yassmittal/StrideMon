import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion'
import { StrideMonMark } from '../../app-tour/components/StrideMonMark'
import { colors, fontFamilies, fontWeights, letterSpacings, oneThingColors } from '../../theme'
import { oneThingContent } from '../content'
import { endCardTimeline } from '../timeline'

// The end card, on the reveal's dark stage: the lockup pops in, then the waitlist line in the
// captions' gold, the 48 hours and the link, one part at a time, held to the end. In the film's
// 1080 px.

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
    { ...clamp, easing: Easing.out(Easing.back(1.6)) },
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
        background: `radial-gradient(ellipse 85% 55% at 50% 45%, ${oneThingColors.stageLight}, ${oneThingColors.stageDark})`,
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
              color: colors.textOnDark,
            }}
          >
            {oneThingContent.wordmark}
          </span>
        </div>
        <div
          style={{
            marginTop: 110,
            fontFamily: fontFamilies.oneThingCaption,
            fontSize: 150,
            lineHeight: 0.95,
            textAlign: 'center',
            color: oneThingColors.gold,
            textShadow: `0 0 10px ${oneThingColors.goldGlowNear}, 0 0 34px ${oneThingColors.goldGlowFar}`,
            ...readRise(frame, endCardTimeline.headlineInFrame),
          }}
        >
          {oneThingContent.headline.toUpperCase()}
        </div>
        <div
          style={{
            marginTop: 40,
            maxWidth: 880,
            fontFamily: fontFamilies.satoshi,
            fontWeight: fontWeights.regular,
            fontSize: 52,
            lineHeight: 1.3,
            textAlign: 'center',
            color: colors.textOnDark,
            ...readRise(frame, endCardTimeline.bodyInFrame),
          }}
        >
          {oneThingContent.body}
        </div>
        <div
          style={{
            marginTop: 72,
            padding: '24px 44px',
            borderRadius: 999,
            backgroundColor: colors.surface,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            fontFamily: fontFamilies.satoshi,
            fontWeight: fontWeights.medium,
            fontSize: 42,
            color: colors.textPrimary,
            ...readRise(frame, endCardTimeline.linkInFrame),
          }}
        >
          {oneThingContent.link}
          <span>→</span>
        </div>
      </div>
    </AbsoluteFill>
  )
}
