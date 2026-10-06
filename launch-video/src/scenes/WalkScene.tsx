import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { readSceneDurationInFrames, toSceneBeatFrame } from '../beats'
import { ClipRise } from '../components/ClipRise'
import { Drift } from '../components/Drift'
import { LabelRoll } from '../components/LabelRoll'
import { MaskedRise } from '../components/MaskedRise'
import { MotionBlur } from '../components/MotionBlur'
import { PhoneFrame } from '../components/PhoneFrame'
import { RollingDigits, type RollingDigitsStep } from '../components/RollingDigits'
import { RUN_SCREEN_WIDTH_PIXELS, RunScreen } from '../components/RunScreen'
import { StepText } from '../components/StepText'
import {
  ENERGY_AT_START,
  type LiveRunReadout,
  liveRunReadouts,
  RUN_TIMER_SECONDS_AT_SOURCE_ZERO,
  runScreenContent,
  walkContent,
} from '../content'
import { type FilmFormat, filmLayouts, readPhoneBezel } from '../layouts'
import { colors, fontFamilies } from '../theme'
import { findWalkSceneFrame, isWalkFast, toWalkSourceSeconds } from '../walk-ramp'
import type { SceneProps } from './scene-props'

const CALLOUT_VALUE_OFFSET_PIXELS = 48

/**
 * Scene 3 (0:10–0:16), black. Step 2: the run screen during the real walk, ramped 1× → 6× → 1×,
 * with the distance and the estimated reward lifted out beside it. Every number is what the phone
 * showed at that second; the screen is the vector rebuild, so the token reads STRIDE.
 */
export function WalkScene({ format }: SceneProps) {
  const frame = useCurrentFrame()
  const layout = filmLayouts[format]
  const { callouts, calloutGap } = layout.walk
  const calloutValueHeight = layout.monoCalloutFontSize * 1.1

  return (
    <AbsoluteFill style={{ backgroundColor: colors.darkBackground }}>
      <Drift durationInFrames={readSceneDurationInFrames('walk')}>
        <MotionBlur isActive={isWalkFast(frame)}>
          <WalkPhone format={format} />
        </MotionBlur>
        {CALLOUTS.map((callout, calloutIndex) => {
          const top = callouts.top + calloutIndex * calloutGap
          const startFrame = toSceneBeatFrame('walk', 1) + calloutIndex * 4
          return (
            <div key={callout.label}>
              <MaskedRise
                lines={[callout.label.toUpperCase()]}
                startFrame={startFrame}
                fontSize={layout.metaFontSize}
                fontWeight={500}
                color={colors.textOnDarkSecondary}
                style={{ left: callouts.left, top }}
              />
              <ClipRise
                startFrame={startFrame + 4}
                style={{
                  left: callouts.left,
                  top: top + CALLOUT_VALUE_OFFSET_PIXELS,
                  width: layout.monoCalloutFontSize * 0.6 * 11,
                  height: calloutValueHeight,
                }}
              >
                {callout.readoutKey === 'reward' ? (
                  // The whole value slides: rolling +5 → +10 digit by digit would pass +15,
                  // which the run never showed at this point (FACTS.md §3).
                  <LabelRoll
                    steps={readoutSteps.reward}
                    lineHeightPixels={calloutValueHeight}
                    style={{
                      fontFamily: fontFamilies.mono,
                      fontSize: layout.monoCalloutFontSize,
                      lineHeight: 1.1,
                      color: colors.textOnDark,
                    }}
                  />
                ) : (
                  <RollingDigits
                    steps={readoutSteps.distance}
                    fontSize={layout.monoCalloutFontSize}
                    color={colors.textOnDark}
                  />
                )}
              </ClipRise>
            </div>
          )
        })}
        <StepText
          copy={walkContent}
          layout={layout.stepText}
          metaFontSize={layout.metaFontSize}
          color={colors.textOnDark}
          labelColor={colors.textOnDarkSecondary}
          labelStartFrame={0}
          headlineStartFrame={toSceneBeatFrame('walk', 1)}
          sentenceStartFrame={toSceneBeatFrame('walk', 2)}
        />
      </Drift>
    </AbsoluteFill>
  )
}

/** The phone and its run screen. It reads its own frame, so each motion-blur sample is its own sub-frame. */
function WalkPhone({ format }: { format: FilmFormat }) {
  const frame = useCurrentFrame()
  const { phone } = filmLayouts[format].walk
  const readout = findReadoutAt(toWalkSourceSeconds(frame))
  const screenScale = (phone.width - 2 * readPhoneBezel(phone.width)) / RUN_SCREEN_WIDTH_PIXELS

  return (
    <PhoneFrame box={phone} tone="dark">
      <div style={{ scale: screenScale, transformOrigin: '0 0' }}>
        <RunScreen
          state={{
            timerSteps,
            distanceSteps: readoutSteps.distance,
            speedText: readout.speedText,
            energyLeft: readout.energyLeft,
            energyAtStart: ENERGY_AT_START,
            estimatedRewardText: readout.estimatedRewardText,
            estimateNoteLines: runScreenContent.estimateNoteLines,
            metaItems: runScreenContent.metaItems,
            stopLabel: runScreenContent.stopLabel,
          }}
        />
      </div>
    </PhoneFrame>
  )
}

const CALLOUTS = [
  { label: walkContent.distanceLabel, readoutKey: 'distance' },
  { label: walkContent.rewardLabel, readoutKey: 'reward' },
] as const

type ReadoutKey = (typeof CALLOUTS)[number]['readoutKey']

const readoutSteps = buildReadoutSteps()
const timerSteps = buildTimerSteps()

/** The readout the phone showed at a second of video2. */
function findReadoutAt(sourceSeconds: number): LiveRunReadout {
  const shownReadouts = liveRunReadouts.filter((readout) => readout.sourceSeconds <= sourceSeconds)
  const readout = shownReadouts.at(-1) ?? liveRunReadouts[0]
  if (readout === undefined) throw new Error('liveRunReadouts is empty')
  return readout
}

/** Each frame where a readout changes, as rolling-digit steps. */
function buildReadoutSteps(): Record<ReadoutKey, RollingDigitsStep[]> {
  const steps: Record<ReadoutKey, RollingDigitsStep[]> = { distance: [], reward: [] }
  const firstSourceSeconds = toWalkSourceSeconds(0)
  for (const readout of liveRunReadouts) {
    const startFrame =
      readout.sourceSeconds <= firstSourceSeconds ? 0 : findWalkSceneFrame(readout.sourceSeconds)
    if (startFrame === null) continue
    pushIfChanged(steps.distance, startFrame, readout.distanceText)
    pushIfChanged(steps.reward, startFrame, readout.estimatedRewardText)
  }
  return steps
}

/** The run's clock, one step per second of the recording. */
function buildTimerSteps(): RollingDigitsStep[] {
  const steps: RollingDigitsStep[] = []
  const firstTimerSeconds = Math.floor(toWalkSourceSeconds(0) + RUN_TIMER_SECONDS_AT_SOURCE_ZERO)
  for (let timerSeconds = firstTimerSeconds; ; timerSeconds++) {
    const sourceSeconds = timerSeconds - RUN_TIMER_SECONDS_AT_SOURCE_ZERO
    const startFrame = timerSeconds === firstTimerSeconds ? 0 : findWalkSceneFrame(sourceSeconds)
    if (startFrame === null) break
    pushIfChanged(steps, startFrame, formatTimer(timerSeconds))
  }
  return steps
}

function formatTimer(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function pushIfChanged(steps: RollingDigitsStep[], startFrame: number, text: string): void {
  const lastStep = steps[steps.length - 1]
  if (lastStep?.text === text) return
  if (lastStep !== undefined && lastStep.startFrame === startFrame) {
    lastStep.text = text
    return
  }
  steps.push({ startFrame, text })
}

/** Every frame where a callout starts rolling to a new value (frame 0 shows the first values). */
export function readWalkReadoutChangeFrames(): number[] {
  const changeFrames = Object.values(readoutSteps).flatMap((steps) =>
    steps.map((step) => step.startFrame).filter((startFrame) => startFrame > 0),
  )
  return [...new Set(changeFrames)].sort((first, second) => first - second)
}
