import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { Drift } from '../../components/Drift'
import { LabelRoll } from '../../components/LabelRoll'
import { MaskedRise } from '../../components/MaskedRise'
import { colors, easings, fontFamilies, letterSpacings } from '../../theme'
import { readWaitlistSceneDurationInFrames, toWaitlistSceneBeatFrame } from '../beats'
import { promiseContent } from '../content'
import { waitlistLayout } from '../layout'

/** The ask is off-white too, so the words dip out over 0.2 s before the cut (prompt §4). */
const EXIT_DIP_FRAMES = 12

/** Each promise line rises on its beat, in beats from the scene's first frame. */
export const promiseLineBeats: readonly number[] = [0, 1.5, 3]

/**
 * Scene 4 (0:12–0:15), off-white. The pass's three promises, one per beat, stacked so the first
 * stays readable while the others land. A small counter label-rolls with them.
 */
export function PromiseScene() {
  const frame = useCurrentFrame()
  const { promise, gutter, metaFontSize, metaTop } = waitlistLayout
  const lineCount = promiseContent.lines.length
  const durationInFrames = readWaitlistSceneDurationInFrames('promise')

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      <Drift durationInFrames={durationInFrames}>
        <AbsoluteFill
          style={{
            opacity: interpolate(
              frame,
              [durationInFrames - EXIT_DIP_FRAMES, durationInFrames - 1],
              [1, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.standard },
            ),
          }}
        >
          <MaskedRise
            lines={promiseContent.metaItems.map((item) => item.toUpperCase())}
            startFrame={0}
            fontSize={metaFontSize}
            fontWeight={500}
            color={colors.textSecondarySmall}
            style={{ left: gutter, top: metaTop }}
          />
          {promiseContent.lines.map((line, lineIndex) => (
            <MaskedRise
              key={line}
              lines={[line]}
              startFrame={toWaitlistSceneBeatFrame('promise', promiseLineBeats[lineIndex] ?? 0)}
              fontSize={promise.lineFontSize}
              letterSpacing={letterSpacings.display}
              color={colors.textPrimary}
              isOpticallyPulledLeft
              style={{
                left: promise.lines.left,
                top: promise.lines.top + lineIndex * promise.lineGap,
              }}
            />
          ))}
          <LabelRoll
            steps={promiseContent.lines.map((_line, lineIndex) => ({
              startFrame: toWaitlistSceneBeatFrame('promise', promiseLineBeats[lineIndex] ?? 0),
              text: `${String(lineIndex + 1).padStart(2, '0')} / ${String(lineCount).padStart(2, '0')}`,
            }))}
            lineHeightPixels={metaFontSize * 1.3}
            style={{
              position: 'absolute',
              left: promise.counter.left,
              top: promise.counter.top,
              width: metaFontSize * 6,
              fontFamily: fontFamilies.mono,
              fontSize: metaFontSize,
              lineHeight: 1.3,
              color: colors.textSecondarySmall,
            }}
          />
        </AbsoluteFill>
      </Drift>
    </AbsoluteFill>
  )
}
