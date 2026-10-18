import { interpolate, useCurrentFrame } from 'remotion'
import { LabelRoll } from '../../components/LabelRoll'
import { MaskedRise } from '../../components/MaskedRise'
import { colors, easings, fontFamilies, fontWeights, letterSpacings } from '../../theme'
import { APP_TOUR_DURATION_IN_FRAMES, APP_TOUR_WIDTH } from '../beats'
import { endCardContent } from '../content'
import { appTourLayout } from '../layout'
import { callToActionTimeline, endTimeline } from '../timeline'
import { StrideMonMark } from './StrideMonMark'

// The end card on lime (sections 6 and 7): the website header's lockup (the mark and `StrideMon`
// in Satoshi), `Walk. Earn. Upgrade.` label-rolling to `Ready to move?`, the link rising under it,
// and two black pills sliding in from the edges. It's revealed by the last wipe and drifts
// (1.00 → 1.02) to the end. No testnet line on the card (Yash, STOP 1): the post's caption says it.

const PILL_SLIDE_FRAMES = 27
const DRIFT_SCALE = 1.02
/** The website header's lockup: the mark is 1.6 × the wordmark's size, 0.5 em from it. */
const MARK_TO_FONT_RATIO = 1.6
const MARK_GAP_EM = 0.5

export function EndCard() {
  const frame = useCurrentFrame()
  const layout = appTourLayout.endCard
  const drift = interpolate(
    frame,
    [endTimeline.wipeStartFrame, APP_TOUR_DURATION_IN_FRAMES],
    [1, DRIFT_SCALE],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  )
  const pillsIn = interpolate(
    frame,
    [callToActionTimeline.pillsFrame, callToActionTimeline.pillsFrame + PILL_SLIDE_FRAMES],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.outExpo },
  )
  const markSize = layout.wordmarkFontSize * MARK_TO_FONT_RATIO
  const [leftPill, rightPill] = endCardContent.pills
  return (
    <div style={{ position: 'absolute', inset: 0, scale: String(drift) }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: APP_TOUR_WIDTH,
          top: layout.lockupCenterY - markSize / 2,
          height: markSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: layout.wordmarkFontSize * MARK_GAP_EM,
        }}
      >
        <StrideMonMark size={markSize} />
        <span
          style={{
            fontFamily: fontFamilies.satoshi,
            fontWeight: fontWeights.regular,
            fontSize: layout.wordmarkFontSize,
            letterSpacing: letterSpacings.displayLarge,
            color: colors.textPrimary,
            lineHeight: 1,
          }}
        >
          {endCardContent.wordmark}
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: APP_TOUR_WIDTH,
          top: layout.taglineTop,
          display: 'flex',
          justifyContent: 'center',
          fontFamily: fontFamilies.satoshi,
          fontWeight: fontWeights.regular,
          fontSize: layout.taglineFontSize,
          lineHeight: 1.2,
          color: colors.textPrimary,
        }}
      >
        <LabelRoll
          steps={[
            { startFrame: 0, text: endCardContent.tagline },
            { startFrame: callToActionTimeline.questionFrame, text: endCardContent.question },
          ]}
          lineHeightPixels={layout.taglineFontSize * 1.2}
          style={{ width: APP_TOUR_WIDTH, display: 'flex', justifyContent: 'center' }}
        />
      </div>
      <MaskedRise
        lines={[endCardContent.url]}
        startFrame={callToActionTimeline.urlFrame}
        fontSize={layout.urlFontSize}
        color={colors.textPrimary}
        fontFamily={fontFamilies.mono}
        style={{ left: 0, width: APP_TOUR_WIDTH, top: layout.urlTop, textAlign: 'center' }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: APP_TOUR_WIDTH,
          top: layout.pillsTop,
          display: 'flex',
          justifyContent: 'center',
          gap: layout.pillGap,
        }}
      >
        <Pill label={leftPill} offsetX={-(1 - pillsIn) * APP_TOUR_WIDTH * 0.6} />
        <Pill label={rightPill} offsetX={(1 - pillsIn) * APP_TOUR_WIDTH * 0.6} />
      </div>
    </div>
  )
}

/** A black pill with lime text: lime only on dark. */
function Pill({ label, offsetX }: { label: string; offsetX: number }) {
  const { pillFontSize } = appTourLayout.endCard
  return (
    <div
      style={{
        translate: `${offsetX}px 0px`,
        padding: `${pillFontSize * 0.6}px ${pillFontSize * 1.1}px`,
        borderRadius: 999,
        backgroundColor: colors.darkBackground,
        color: colors.highlight,
        fontFamily: fontFamilies.satoshi,
        fontWeight: fontWeights.medium,
        fontSize: pillFontSize,
        lineHeight: 1,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'pre',
      }}
    >
      {label}
    </div>
  )
}
