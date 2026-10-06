import type { CSSProperties } from 'react'
import { interpolate, useCurrentFrame } from 'remotion'
import { easings, fontFamilies } from '../theme'

// The app's CounterText: 400 ms with the standard curve (apps/mobile/src/components/ui/CounterText.tsx).
export const DIGIT_ROLL_DURATION_FRAMES = 24
const DIGITS = '0123456789'

export type RollingDigitsStep = { startFrame: number; text: string }

type RollingDigitsProps = {
  steps: readonly RollingDigitsStep[]
  fontSize: number
  color: string
  fontWeight?: number
  style?: CSSProperties
}

/**
 * The app's CounterText in frames: IBM Plex Mono, one slot per character, keyed from the
 * right, and each digit rolls vertically to its new value. Mono digits keep the width fixed.
 */
export function RollingDigits({
  steps,
  fontSize,
  color,
  fontWeight = 400,
  style,
}: RollingDigitsProps) {
  const frame = useCurrentFrame()
  const shownSteps = steps.filter((step) => step.startFrame <= frame)
  const currentStep = shownSteps[shownSteps.length - 1]
  if (currentStep === undefined) return null
  const characters = [...currentStep.text]

  return (
    <div
      style={{
        position: 'absolute',
        display: 'flex',
        fontFamily: fontFamilies.mono,
        fontSize,
        fontWeight,
        lineHeight: 1,
        color,
        whiteSpace: 'pre',
        ...style,
      }}
    >
      {characters.map((character, characterIndex) => {
        const slotFromRight = characters.length - characterIndex
        if (!DIGITS.includes(character)) {
          return <span key={slotFromRight}>{character}</span>
        }
        return (
          <DigitSlot
            key={slotFromRight}
            frame={frame}
            fontSize={fontSize}
            roll={findLatestDigitRoll(shownSteps, slotFromRight)}
          />
        )
      })}
    </div>
  )
}

type DigitRoll = { fromDigit: number; toDigit: number; startFrame: number }

function DigitSlot({
  frame,
  fontSize,
  roll,
}: {
  frame: number
  fontSize: number
  roll: DigitRoll
}) {
  const shownDigit = interpolate(
    frame,
    [roll.startFrame, roll.startFrame + DIGIT_ROLL_DURATION_FRAMES],
    [roll.fromDigit, roll.toDigit],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.standard },
  )
  return (
    <span style={{ display: 'inline-block', height: fontSize, overflow: 'hidden' }}>
      <span
        style={{
          display: 'flex',
          flexDirection: 'column',
          translate: `0px ${-shownDigit * fontSize}px`,
        }}
      >
        {[...DIGITS].map((digit) => (
          <span key={digit} style={{ height: fontSize }}>
            {digit}
          </span>
        ))}
      </span>
    </span>
  )
}

/** The last change of the digit in one slot, so it rolls from its old value like the app. */
function findLatestDigitRoll(
  steps: readonly RollingDigitsStep[],
  slotFromRight: number,
): DigitRoll {
  let roll: DigitRoll | null = null
  let previousDigit: number | null = null
  for (const step of steps) {
    const character = step.text[step.text.length - slotFromRight]
    const digit = character === undefined ? -1 : DIGITS.indexOf(character)
    if (digit === -1) {
      previousDigit = null
      continue
    }
    if (previousDigit === null) {
      // A slot that just became a digit mounts at its value, as CounterText's new slots do.
      roll = { fromDigit: digit, toDigit: digit, startFrame: step.startFrame }
    } else if (digit !== previousDigit) {
      roll = { fromDigit: previousDigit, toDigit: digit, startFrame: step.startFrame }
    }
    previousDigit = digit
  }
  return roll ?? { fromDigit: 0, toDigit: 0, startFrame: 0 }
}
