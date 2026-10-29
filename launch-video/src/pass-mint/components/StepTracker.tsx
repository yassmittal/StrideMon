import { interpolate, useCurrentFrame } from 'remotion'
import { colors, easings, fontFamilies, fontWeights } from '../../theme'
import { stepContent } from '../content'
import { type PassMintStepName, passMintStepOrder, stepTimelines } from '../timeline'

// The four steps across the top: the one on screen in lime, the done ones ticked, each filling as
// the recording plays through it. It answers "how long is this?" from the first step, so the
// viewer stays for the rest.

const TOP = 36
const PILL_HEIGHT = 56
const PILL_WIDTH = 200
const GAP = 8
const ENTER_FRAMES = 18

function readStepState(frame: number, stepName: PassMintStepName): 'todo' | 'now' | 'done' {
  const { startFrame, endFrame } = stepTimelines[stepName]
  if (frame >= endFrame) return 'done'
  if (frame >= startFrame) return 'now'
  return 'todo'
}

export function StepTracker({ startFrame, endFrame }: { startFrame: number; endFrame: number }) {
  const frame = useCurrentFrame()
  if (frame < startFrame || frame >= endFrame) return null
  const enterProgress = interpolate(frame, [startFrame, startFrame + ENTER_FRAMES], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easings.outExpo,
  })
  const exitProgress = interpolate(frame, [endFrame - 10, endFrame], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easings.standard,
  })

  return (
    <div
      style={{
        position: 'absolute',
        top: TOP,
        left: '50%',
        translate: `-50% ${(1 - enterProgress) * -80}px`,
        opacity: 1 - exitProgress,
        display: 'flex',
        gap: GAP,
        padding: GAP,
        borderRadius: PILL_HEIGHT,
        backgroundColor: 'rgba(20, 21, 21, 0.94)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.3)',
      }}
    >
      {passMintStepOrder.map((stepName) => {
        const state = readStepState(frame, stepName)
        const { startFrame: stepStartFrame, endFrame: stepEndFrame } = stepTimelines[stepName]
        const fillProgress =
          state === 'now'
            ? interpolate(frame, [stepStartFrame, stepEndFrame], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })
            : 0
        const { number, trackerLabel } = stepContent[stepName]
        const isNow = state === 'now'
        return (
          <div
            key={stepName}
            style={{
              position: 'relative',
              width: PILL_WIDTH,
              height: PILL_HEIGHT,
              borderRadius: PILL_HEIGHT,
              overflow: 'hidden',
              backgroundColor: isNow ? colors.highlight : 'rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              fontFamily: fontFamilies.mono,
              fontWeight: fontWeights.medium,
              fontSize: 22,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: isNow
                ? colors.textPrimary
                : state === 'done'
                  ? colors.textOnDark
                  : colors.textOnDarkMuted,
            }}
          >
            {/* How far through this step the recording is: a darker band under the label. */}
            {isNow ? (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${fillProgress * 100}%`,
                  backgroundColor: 'rgba(0, 0, 0, 0.12)',
                }}
              />
            ) : null}
            <span style={{ position: 'relative' }}>{state === 'done' ? '✓' : number}</span>
            <span style={{ position: 'relative' }}>{trackerLabel}</span>
          </div>
        )
      })}
    </div>
  )
}
