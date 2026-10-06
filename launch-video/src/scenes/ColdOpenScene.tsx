import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { readSceneDurationInFrames, toSceneBeatFrame } from '../beats'
import { Drift } from '../components/Drift'
import { MaskedRise } from '../components/MaskedRise'
import { MotionBlur } from '../components/MotionBlur'
import { PhoneFrame } from '../components/PhoneFrame'
import type { RollingDigitsStep } from '../components/RollingDigits'
import { RUN_SCREEN_WIDTH_PIXELS, RunScreen } from '../components/RunScreen'
import { coldOpenContent, coldOpenRunScreen, ENERGY_AT_START } from '../content'
import { type Box, filmLayouts, readPhoneBezel } from '../layouts'
import { colors, easings, letterSpacings } from '../theme'
import type { SceneProps } from './scene-props'

const PULL_BACK_START_BEAT = 4
const PULL_BACK_DURATION_FRAMES = 36
const MACRO_COVER_FADE_FRAMES = 18

/**
 * Scene 1 (0:00–0:03), black. Frame 0 is already the product: a macro of the live run's timer.
 * "Walk." rises on beat 2, and on beat 4 the camera pulls back to the phone.
 */
export function ColdOpenScene({ format }: SceneProps) {
  const frame = useCurrentFrame()
  const layout = filmLayouts[format]
  const durationInFrames = readSceneDurationInFrames('coldOpen')
  const pullBackStartFrame = toSceneBeatFrame('coldOpen', PULL_BACK_START_BEAT)
  const isPullingBack =
    frame >= pullBackStartFrame && frame <= pullBackStartFrame + PULL_BACK_DURATION_FRAMES
  const macroCoverOpacity = interpolate(
    frame,
    [pullBackStartFrame, pullBackStartFrame + MACRO_COVER_FADE_FRAMES],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.standard },
  )

  return (
    <AbsoluteFill style={{ backgroundColor: colors.darkBackground }}>
      <Drift durationInFrames={durationInFrames}>
        <MotionBlur isActive={isPullingBack}>
          <PullBackCamera format={format} />
        </MotionBlur>
        {/* During the macro, nothing below the timer shows, so "Walk." reads on black. */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: layout.coldOpen.macroClipBottom,
            width: layout.width,
            height: layout.height - layout.coldOpen.macroClipBottom,
            backgroundColor: colors.darkBackground,
            opacity: macroCoverOpacity,
          }}
        />
        <MaskedRise
          lines={[coldOpenContent.headline]}
          startFrame={toSceneBeatFrame('coldOpen', 2)}
          fontSize={layout.headlineFontSize}
          color={colors.textOnDark}
          lineHeight={1}
          letterSpacing={letterSpacings.display}
          isOpticallyPulledLeft
          style={{
            left: layout.gutter,
            top: layout.headlineBaseline - layout.headlineFontSize * 0.86,
          }}
        />
      </Drift>
    </AbsoluteFill>
  )
}

/** The phone and its run screen, from the macro to the full phone. It reads its own frame for motion blur. */
function PullBackCamera({ format }: SceneProps) {
  const frame = useCurrentFrame()
  const layout = filmLayouts[format]
  const pullBackStartFrame = toSceneBeatFrame('coldOpen', PULL_BACK_START_BEAT)
  const pullBackProgress = interpolate(
    frame,
    [pullBackStartFrame, pullBackStartFrame + PULL_BACK_DURATION_FRAMES],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.emphasized },
  )
  const camera = readPullBackCamera({ phone: layout.phone, ...layout.coldOpen })
  // Even in log space, so the zoom reads as one steady move rather than a slowing one.
  const cameraScale = camera.macroZoom ** (1 - pullBackProgress)

  return (
    <AbsoluteFill
      style={{
        transformOrigin: `${camera.zoomCenter.left}px ${camera.zoomCenter.top}px`,
        scale: cameraScale,
      }}
    >
      <PhoneFrame box={layout.phone} tone="dark">
        <div style={{ scale: camera.screenScale, transformOrigin: '0 0' }}>
          <RunScreen
            state={{
              timerSteps: buildTimerSteps(),
              distanceSteps: [{ startFrame: 0, text: coldOpenRunScreen.distanceText }],
              speedText: coldOpenRunScreen.speedText,
              energyLeft: coldOpenRunScreen.energyLeft,
              energyAtStart: ENERGY_AT_START,
              estimatedRewardText: coldOpenRunScreen.estimatedRewardText,
              estimateNoteLines: coldOpenRunScreen.estimateNoteLines,
              gpsStatus: coldOpenRunScreen.gpsStatus,
              metaItems: coldOpenRunScreen.metaItems,
              stopLabel: coldOpenRunScreen.stopLabel,
            }}
          />
        </div>
      </PhoneFrame>
    </AbsoluteFill>
  )
}

/** The timer ticks on beats 1, 3 and 5: 1:53 → 1:54 → 1:55 → 1:56. */
export function buildTimerSteps(): RollingDigitsStep[] {
  return coldOpenRunScreen.timerTexts.map((text, textIndex) => ({
    startFrame: textIndex === 0 ? 0 : toSceneBeatFrame('coldOpen', 2 * textIndex - 1),
    text,
  }))
}

/**
 * The pull-back is one zoom about a fixed point. At its end, the run screen sits in the phone;
 * at its start, the same screen is at `macroScale` with its top-left at `macroOrigin`.
 */
function readPullBackCamera({
  phone,
  macroScale,
  macroOrigin,
}: {
  phone: Box
  macroScale: number
  macroOrigin: { left: number; top: number }
}) {
  const bezel = readPhoneBezel(phone.width)
  const screenLeft = phone.left + bezel
  const screenTop = phone.top + bezel
  const screenScale = (phone.width - 2 * bezel) / RUN_SCREEN_WIDTH_PIXELS
  const macroZoom = macroScale / screenScale
  // x' = c + zoom × (x − c) maps the screen's corner to macroOrigin, so c = (origin − zoom × corner) / (1 − zoom).
  const zoomCenter = {
    left: (macroOrigin.left - macroZoom * screenLeft) / (1 - macroZoom),
    top: (macroOrigin.top - macroZoom * screenTop) / (1 - macroZoom),
  }
  return { screenScale, macroZoom, zoomCenter }
}
