import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { ArrowIcon } from '../../components/ArrowIcon'
import { MaskedRise } from '../../components/MaskedRise'
import { colors, easings, floatingPillShadow, fontFamilies, fontWeights, radii } from '../../theme'
import { readLineCamera } from '../camera'
import { HandwrittenInk } from '../components/HandwrittenWord'
import { ScallopRing } from '../components/ScallopRing'
import { SubFrameMotionBlur } from '../components/SubFrameMotionBlur'
import { passChatEndContent, twistLine } from '../content'
import { HANDWRITTEN_WORD_ADVANCE, twistLineSatoshiAdvances } from '../handwriting-glyphs'
import { endTimeline, PASS_CHAT_WIDTH, ringTimeline, writeTimeline } from '../timeline'

// Scenes 6–8 on black (the film's one flip): the ring closes in on "This", the pen writes "isn’t"
// in lime, the camera pulls back as "a JPEG." slides in, and the end card gathers under the line.
// Lime only ever sits on black here. The last frame is the poster.

/** The line's size at rest: Satoshi and the script face share one em. */
const LINE_FONT_SIZE = 150
/** Satoshi's cap height is about 0.7 em, so its letters' middle is this far above the baseline. */
const CAP_MIDDLE_EM = 0.36

const lineMetrics = (() => {
  const toPixels = (milliEm: number) => (milliEm / 1000) * LINE_FONT_SIZE
  const thisWidth = toPixels(twistLineSatoshiAdvances.before)
  const space = toPixels(twistLineSatoshiAdvances.space)
  const scriptStart = thisWidth + space
  const scriptEnd = scriptStart + toPixels(HANDWRITTEN_WORD_ADVANCE)
  const afterStart = scriptEnd + space
  const lineWidth = afterStart + toPixels(twistLineSatoshiAdvances.after)
  const middleY = -CAP_MIDDLE_EM * LINE_FONT_SIZE
  return {
    scriptStart,
    afterStart,
    thisCentre: { x: thisWidth / 2, y: middleY },
    writtenCentre: { x: scriptEnd / 2, y: middleY },
    lineCentre: { x: lineWidth / 2, y: middleY },
  }
})()

/** Where the line's middle rests in the end card, above the rest of it. */
const RESTING_LINE_MIDDLE = { x: PASS_CHAT_WIDTH / 2, y: 410 }

// The ring, as measured: it arrives past the frame's edges and closes in on "This" the whole time
// it's up (to 30% of the frame's width in the reference), thinning, and fades over its second half.
// It turns a little as it goes. "This" is about 380 px wide here, so it stops at 1.9× that.
const RING_RADII = [1300, 360] as const
const RING_STROKE_WIDTHS = [200, 92] as const
const RING_AMPLITUDE_RATIO = 0.065
const RING_TURN_DEGREES = 14

// "a JPEG." slides in from the right with a horizontal blur that clears in 10 frames.
const SLIDE_DISTANCE_PIXELS = 520
const SLIDE_BLUR_DEVIATION = 46
// The whip back smears the line, as the reference's does.
const WHIP_BLUR_FRAMES = 10
const SHUTTER_FRACTION = 0.5
const BLUR_SAMPLE_COUNT = 10

export function LineScene() {
  const frame = useCurrentFrame()
  const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
  const ringClose = interpolate(
    frame,
    [ringTimeline.flipFrame, ringTimeline.flipFrame + ringTimeline.closeDurationFrames],
    [0, 1],
    { ...clamp, easing: easings.outExpo },
  )
  const ringOpacity = interpolate(
    frame,
    [ringTimeline.fadeStartFrame, ringTimeline.flipFrame + ringTimeline.closeDurationFrames],
    [1, 0],
    { ...clamp, easing: easings.standard },
  )
  const isWhipping =
    frame >= writeTimeline.pullBackStartFrame &&
    frame < writeTimeline.pullBackStartFrame + WHIP_BLUR_FRAMES
  // The end card drifts with the line, from where the pull-back settles.
  const endDrift = interpolate(
    frame,
    [writeTimeline.pullBackStartFrame + writeTimeline.pullBackDurationFrames, endTimeline.endFrame],
    [1, 1.02],
    clamp,
  )
  return (
    <AbsoluteFill style={{ backgroundColor: colors.darkBackground }}>
      {ringOpacity > 0 && (
        <svg width="100%" height="100%" aria-hidden="true" style={{ position: 'absolute' }}>
          <ScallopRing
            centreX={960}
            centreY={540}
            radius={RING_RADII[0] + (RING_RADII[1] - RING_RADII[0]) * ringClose}
            amplitudeRatio={RING_AMPLITUDE_RATIO}
            strokeWidth={
              RING_STROKE_WIDTHS[0] + (RING_STROKE_WIDTHS[1] - RING_STROKE_WIDTHS[0]) * ringClose
            }
            rotateDegrees={(frame - ringTimeline.flipFrame) * (RING_TURN_DEGREES / 24)}
            opacity={ringOpacity}
          />
        </svg>
      )}
      <SubFrameMotionBlur
        frame={frame}
        shutterFraction={isWhipping ? SHUTTER_FRACTION : 0}
        sampleCount={BLUR_SAMPLE_COUNT}
        render={(sampleFrame) => <TwistLine frame={sampleFrame} />}
      />
      <AbsoluteFill style={{ scale: endDrift }}>
        <EndCard frame={frame} />
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

/** "This isn’t a JPEG." on a (sub-)frame, framed by the line camera. */
function TwistLine({ frame }: { frame: number }) {
  const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
  const camera = readLineCamera(frame, {
    thisCentre: lineMetrics.thisCentre,
    writtenCentre: lineMetrics.writtenCentre,
    lineCentre: lineMetrics.lineCentre,
    restingAnchor: RESTING_LINE_MIDDLE,
  })
  const slideProgress = interpolate(
    frame,
    [
      writeTimeline.slideStartFrame,
      writeTimeline.slideStartFrame + writeTimeline.slideDurationFrames,
    ],
    [0, 1],
    { ...clamp, easing: easings.outExpo },
  )
  const slideBlur = interpolate(
    frame,
    [writeTimeline.slideStartFrame, writeTimeline.slideStartFrame + writeTimeline.slideBlurFrames],
    [SLIDE_BLUR_DEVIATION, 0],
    { ...clamp, easing: easings.standard },
  )
  const lineTransform = `translate(${camera.anchorX} ${camera.anchorY}) scale(${camera.zoom}) translate(${-camera.focusX} ${-camera.focusY})`
  const blurFilterId = `pass-chat-slide-blur-${Math.round(frame * 1000)}`
  return (
    <AbsoluteFill>
      <svg
        width="100%"
        height="100%"
        aria-hidden="true"
        style={{ position: 'absolute', overflow: 'visible' }}
      >
        <defs>
          <filter id={blurFilterId} x="-50%" y="-20%" width="200%" height="140%">
            <feGaussianBlur stdDeviation={`${slideBlur} 0`} />
          </filter>
        </defs>
        <g transform={lineTransform}>
          <text
            x={0}
            y={0}
            fontFamily={fontFamilies.satoshi}
            fontWeight={fontWeights.regular}
            fontSize={LINE_FONT_SIZE}
            fill={colors.textOnDark}
          >
            {twistLine.before}
          </text>
          <g transform={`translate(${lineMetrics.scriptStart} 0) scale(${LINE_FONT_SIZE / 1000})`}>
            <HandwrittenInk
              color={colors.highlight}
              framesSincePenDown={frame - writeTimeline.penStartFrame}
            />
          </g>
          {frame >= writeTimeline.slideStartFrame && (
            <text
              x={lineMetrics.afterStart + (1 - slideProgress) * SLIDE_DISTANCE_PIXELS}
              y={0}
              fontFamily={fontFamilies.satoshi}
              fontWeight={fontWeights.regular}
              fontSize={LINE_FONT_SIZE}
              fill={colors.textOnDark}
              filter={slideBlur > 0.2 ? `url(#${blurFilterId})` : undefined}
            >
              {twistLine.after}
            </text>
          )}
        </g>
      </svg>
    </AbsoluteFill>
  )
}

// The line, the sentence and the pill sit as one group round the frame's middle. No wordmark or
// network line under them (Yash, STOP 1): the pill is the last thing on screen.
const SUB_LINE_FONT_SIZE = 60
const SUB_LINE_TOP = 518
const PILL_HEIGHT = 108
const PILL_FONT_SIZE = 46
const PILL_TOP = 650

/** Under the line: what the pass is, and the site's pill. */
function EndCard({ frame }: { frame: number }) {
  const pillTranslate = interpolate(
    frame,
    [endTimeline.pillFrame, endTimeline.pillFrame + 24],
    [24, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.outExpo },
  )
  return (
    <>
      <MaskedRise
        lines={[passChatEndContent.line]}
        startFrame={endTimeline.lineFrame}
        fontSize={SUB_LINE_FONT_SIZE}
        color={colors.textOnDarkSecondary}
        style={{ left: 0, right: 0, top: SUB_LINE_TOP, textAlign: 'center' }}
      />
      {frame >= endTimeline.pillFrame && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: PILL_TOP,
            display: 'flex',
            justifyContent: 'center',
            translate: `0px ${pillTranslate}px`,
          }}
        >
          <div
            style={{
              height: PILL_HEIGHT,
              borderRadius: radii.pill,
              backgroundColor: colors.surface,
              boxShadow: floatingPillShadow,
              display: 'flex',
              alignItems: 'center',
              gap: PILL_HEIGHT * 0.26,
              padding: `0 ${PILL_HEIGHT * 0.38}px 0 ${PILL_HEIGHT * 0.46}px`,
              fontFamily: fontFamilies.satoshi,
              fontWeight: fontWeights.medium,
              fontSize: PILL_FONT_SIZE,
              color: colors.textPrimary,
            }}
          >
            {passChatEndContent.siteLabel}
            <ArrowIcon size={PILL_FONT_SIZE * 1.1} color={colors.textPrimary} />
          </div>
        </div>
      )}
    </>
  )
}
