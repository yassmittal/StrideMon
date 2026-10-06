import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { readSceneDurationInFrames, toSceneBeatFrame } from '../beats'
import { ClipRise } from '../components/ClipRise'
import { CrossMarks } from '../components/CrossMarks'
import { Drift } from '../components/Drift'
import { Footage } from '../components/Footage'
import { MaskedRise } from '../components/MaskedRise'
import { MotionBlur } from '../components/MotionBlur'
import { PhoneFrame } from '../components/PhoneFrame'
import { RollingDigits, type RollingDigitsStep } from '../components/RollingDigits'
import { ENERGY_AT_START, type LiveRunReadout, liveRunReadouts, walkContent } from '../content'
import { type Box, filmLayouts } from '../layouts'
import { colors, easings } from '../theme'
import {
  findWalkSceneFrame,
  isWalkFootageFast,
  toWalkFootageFrame,
  toWalkSourceSeconds,
} from '../walk-ramp'
import type { SceneProps } from './scene-props'

const ENERGY_BAR_HEIGHT_PIXELS = 8
const CALLOUT_VALUE_OFFSET_PIXELS = 48

/**
 * Scene 2 (0:03–0:08), black. The real run, speed-ramped 1× → 8× → 1×, with its numbers lifted
 * out beside it. Every number is what the phone showed at that moment.
 */
export function WalkScene({ format }: SceneProps) {
  const frame = useCurrentFrame()
  const layout = filmLayouts[format]
  const durationInFrames = readSceneDurationInFrames('walk')
  const callouts = layout.walk.callouts
  const isRow = callouts.width > callouts.height
  const calloutBoxes = splitCalloutBoxes(callouts, isRow)
  const energyFill = interpolate(frame, energyBarKeyframes.changeFrames, energyBarKeyframes.fills, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easings.emphasized,
  })

  return (
    <AbsoluteFill style={{ backgroundColor: colors.darkBackground }}>
      <Drift durationInFrames={durationInFrames}>
        <MotionBlur isActive={isWalkFootageFast(frame)}>
          <PhoneFrame box={layout.phone} tone="dark">
            <WalkFootage />
          </PhoneFrame>
        </MotionBlur>
        <CrossMarks box={callouts} color={colors.crossMark} contentStartFrame={0} />
        {calloutBoxes.map((calloutBox, calloutIndex) => {
          const callout = CALLOUTS[calloutIndex]
          if (callout === undefined) return null
          const startFrame = toSceneBeatFrame('walk', calloutIndex)
          return (
            <div key={callout.label}>
              <MaskedRise
                lines={[callout.label.toUpperCase()]}
                startFrame={startFrame}
                fontSize={layout.metaFontSize}
                fontWeight={500}
                color={colors.textOnDarkSecondary}
                style={{ left: calloutBox.left, top: calloutBox.top }}
              />
              <ClipRise
                startFrame={startFrame + 4}
                style={{
                  left: calloutBox.left,
                  top: calloutBox.top + CALLOUT_VALUE_OFFSET_PIXELS,
                  width: calloutBox.width,
                  height: layout.monoCalloutFontSize * 1.1,
                }}
              >
                <RollingDigits
                  steps={readoutSteps[callout.readoutKey]}
                  fontSize={layout.monoCalloutFontSize}
                  color={colors.textOnDark}
                />
              </ClipRise>
              {callout.readoutKey === 'energy' && (
                <div
                  style={{
                    position: 'absolute',
                    left: calloutBox.left,
                    top:
                      calloutBox.top +
                      CALLOUT_VALUE_OFFSET_PIXELS +
                      layout.monoCalloutFontSize * 1.3,
                    width: calloutBox.width,
                    height: ENERGY_BAR_HEIGHT_PIXELS,
                    borderRadius: ENERGY_BAR_HEIGHT_PIXELS / 2,
                    backgroundColor: colors.darkTrack,
                    overflow: 'hidden',
                    opacity: frame >= startFrame + 4 ? 1 : 0,
                  }}
                >
                  <div
                    style={{
                      width: `${energyFill * 100}%`,
                      height: '100%',
                      backgroundColor: colors.highlight,
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
        <MaskedRise
          lines={walkContent.caption}
          startFrame={toSceneBeatFrame('walk', 4)}
          fontSize={layout.captionFontSize}
          lineHeight={1.15}
          color={colors.textOnDark}
          style={{ left: layout.walk.caption.left, top: layout.walk.caption.top }}
        />
      </Drift>
    </AbsoluteFill>
  )
}

/** The ramped footage. It reads its own frame, so each motion-blur sample shows its own sub-frame. */
function WalkFootage() {
  const frame = useCurrentFrame()
  return <Footage fileName="walk-run-screen.mp4" sourceFrame={toWalkFootageFrame(frame)} />
}

const CALLOUTS = [
  { label: 'Distance', readoutKey: 'distance' },
  { label: 'Speed', readoutKey: 'speed' },
  { label: 'Energy left (estimated)', readoutKey: 'energy' },
] as const

type ReadoutKey = (typeof CALLOUTS)[number]['readoutKey']

const ENERGY_BAR_EASE_FRAMES = 30
const readoutSteps = buildReadoutSteps()
const energyBarKeyframes = buildEnergyBarKeyframes()

/** Every frame where a callout starts rolling to a new value (frame 0 shows the first values). */
export function readWalkReadoutChangeFrames(): number[] {
  const changeFrames = Object.values(readoutSteps).flatMap((steps) =>
    steps.map((step) => step.startFrame).filter((startFrame) => startFrame > 0),
  )
  return [...new Set(changeFrames)].sort((first, second) => first - second)
}

function splitCalloutBoxes(callouts: Box, isRow: boolean): Box[] {
  return CALLOUTS.map((_callout, calloutIndex) => {
    if (isRow) {
      const width = callouts.width / CALLOUTS.length
      return {
        left: callouts.left + calloutIndex * width,
        top: callouts.top,
        width: width - 30,
        height: callouts.height,
      }
    }
    const height = callouts.height / CALLOUTS.length
    return {
      left: callouts.left + 30,
      top: callouts.top + 30 + calloutIndex * height,
      width: callouts.width - 60,
      height,
    }
  })
}

/** When each readout first shows in the ramped footage, as rolling-digit steps. */
function buildReadoutSteps(): Record<ReadoutKey, RollingDigitsStep[]> {
  const steps: Record<ReadoutKey, RollingDigitsStep[]> = { distance: [], speed: [], energy: [] }
  const firstSourceSeconds = toWalkSourceSeconds(0)
  for (const readout of liveRunReadouts) {
    const startFrame =
      readout.sourceSeconds <= firstSourceSeconds ? 0 : findWalkSceneFrame(readout.sourceSeconds)
    if (startFrame === null) continue
    pushIfChanged(steps.distance, startFrame, readout.distanceText)
    pushIfChanged(steps.speed, startFrame, readout.speedText)
    pushIfChanged(steps.energy, startFrame, formatEnergy(readout))
  }
  return steps
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

function formatEnergy(readout: LiveRunReadout): string {
  return `${readout.energyLeft} / ${ENERGY_AT_START}`
}

/** The energy bar's keyframes: it eases to each new level when the readout changes. */
function buildEnergyBarKeyframes(): { changeFrames: number[]; fills: number[] } {
  const changeFrames: number[] = []
  const fills: number[] = []
  for (const step of readoutSteps.energy) {
    const energyLeft = Number(step.text.split(' / ')[0])
    const previousFill = fills[fills.length - 1]
    if (previousFill !== undefined) {
      changeFrames.push(step.startFrame)
      fills.push(previousFill)
    }
    changeFrames.push(step.startFrame + (previousFill === undefined ? 0 : ENERGY_BAR_EASE_FRAMES))
    fills.push(energyLeft / ENERGY_AT_START)
  }
  if (changeFrames.length === 1) {
    changeFrames.push((changeFrames[0] ?? 0) + 1)
    fills.push(fills[0] ?? 0)
  }
  return { changeFrames, fills }
}
