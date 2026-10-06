import type { CSSProperties } from 'react'
import { interpolate, useCurrentFrame } from 'remotion'
import { appLayout, easings, fontFamilies, fontWeights } from '../theme'

const RISE_DURATION_FRAMES = 24
const WORD_STAGGER_FRAMES = 4
const EXIT_DURATION_FRAMES = 12
// Room under each line's clip for descenders (g, y, p), so the mask never cuts a glyph.
const DESCENDER_ROOM_EM = 0.22

type MaskedRiseProps = {
  lines: readonly string[]
  startFrame: number
  fontSize: number
  color: string
  lineHeight?: number
  letterSpacing?: string
  fontFamily?: string
  fontWeight?: number
  /** Display type sits on the margin by its glyph edge (design-system.md §3.3). */
  isOpticallyPulledLeft?: boolean
  /** The ~0.2 s opacity dip out, when the text leaves before a hard cut. */
  exitFrame?: number
  style?: CSSProperties
}

/**
 * The film's one way for type to arrive: each line slides up 100% from behind its own clip,
 * word by word, 4 frames apart.
 */
export function MaskedRise({
  lines,
  startFrame,
  fontSize,
  color,
  lineHeight = 1,
  letterSpacing = 'normal',
  fontFamily = fontFamilies.satoshi,
  fontWeight = fontWeights.regular,
  isOpticallyPulledLeft = false,
  exitFrame,
  style,
}: MaskedRiseProps) {
  const frame = useCurrentFrame()
  let wordIndex = 0
  const opacity =
    exitFrame === undefined
      ? 1
      : interpolate(frame, [exitFrame, exitFrame + EXIT_DURATION_FRAMES], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easings.standard,
        })

  return (
    <div
      style={{
        position: 'absolute',
        color,
        fontFamily,
        fontWeight,
        fontSize,
        letterSpacing,
        lineHeight,
        whiteSpace: 'nowrap',
        marginLeft: isOpticallyPulledLeft ? appLayout.opticalPullLeftRatio * fontSize : 0,
        opacity,
        ...style,
      }}
    >
      {lines.map((line) => (
        <div
          key={line}
          style={{
            overflow: 'hidden',
            paddingBottom: `${DESCENDER_ROOM_EM}em`,
            marginBottom: `-${DESCENDER_ROOM_EM}em`,
          }}
        >
          {line.split(' ').map((word, wordInLineIndex) => {
            const wordStartFrame = startFrame + wordIndex * WORD_STAGGER_FRAMES
            wordIndex += 1
            return (
              <span
                // Words can repeat in a line; their position is their identity.
                // biome-ignore lint/suspicious/noArrayIndexKey: static text, never reordered.
                key={wordInLineIndex}
                style={{
                  display: 'inline-block',
                  whiteSpace: 'pre',
                  translate: interpolate(
                    frame,
                    [wordStartFrame, wordStartFrame + RISE_DURATION_FRAMES],
                    ['0px 125%', '0px 0%'],
                    {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                      easing: easings.outExpo,
                    },
                  ),
                }}
              >
                {wordInLineIndex === 0 ? word : ` ${word}`}
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}
