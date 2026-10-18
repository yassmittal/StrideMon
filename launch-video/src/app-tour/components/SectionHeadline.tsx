import { interpolate, useCurrentFrame } from 'remotion'
import { easings, fontFamilies, letterSpacings } from '../../theme'
import { APP_TOUR_WIDTH } from '../beats'
import { appTourLayout } from '../layout'

// A section's headline, centred, arriving the reference's way (reference.md, "The headline"): each
// word appears whole about 0.7 em below its place and slides up on a fast out-ease. Not masked. In a
// wiped section, each word starts when the wipe's edge reaches the word's left edge.

const RISE_DURATION_FRAMES = 36
const RISE_DISTANCE_EM = 0.7

/** Canvas text metrics in the film's own font, once per font and text. */
const measureCache = new Map<string, number>()
let measureContext: CanvasRenderingContext2D | null = null

function measureTextWidth(text: string, fontSize: number, weight: number): number {
  const key = `${weight}|${fontSize}|${text}`
  const cached = measureCache.get(key)
  if (cached !== undefined) return cached
  measureContext ??= document.createElement('canvas').getContext('2d')
  if (measureContext === null) return 0
  measureContext.font = `${weight} ${fontSize}px ${fontFamilies.satoshi}`
  measureContext.letterSpacing = `${parseFloat(letterSpacings.display) * fontSize}px`
  const width = measureContext.measureText(text).width
  measureCache.set(key, width)
  return width
}

/** Each word's left edge in frame pixels, for a centred line. */
export function measureHeadlineWordLefts(text: string): number[] {
  const { headlineFontSize, headlineFontWeight: weight } = appTourLayout
  const words = text.split(' ')
  const lineWidth = measureTextWidth(text, headlineFontSize, weight)
  const lineLeft = (APP_TOUR_WIDTH - lineWidth) / 2
  return words.map((_word, index) => {
    const before = words.slice(0, index).join(' ')
    return lineLeft + (index === 0 ? 0 : measureTextWidth(`${before} `, headlineFontSize, weight))
  })
}

type SectionHeadlineProps = {
  text: string
  color: string
  /** Each word's first frame (the rise starts there). */
  wordStartFrames: readonly number[]
  /** The headline disappears from this frame (the next wipe's snap). */
  hideFrame?: number
}

export function SectionHeadline({ text, color, wordStartFrames, hideFrame }: SectionHeadlineProps) {
  const frame = useCurrentFrame()
  if (hideFrame !== undefined && frame >= hideFrame) return null
  const { headlineFontSize, headlineFontWeight, headlineLineTop } = appTourLayout
  const words = text.split(' ')
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: headlineLineTop,
        width: APP_TOUR_WIDTH,
        textAlign: 'center',
        whiteSpace: 'pre',
        fontFamily: fontFamilies.satoshi,
        fontWeight: headlineFontWeight,
        fontSize: headlineFontSize,
        lineHeight: 1,
        letterSpacing: letterSpacings.display,
        color,
      }}
    >
      {words.map((word, index) => {
        const startFrame = wordStartFrames[index] ?? wordStartFrames[0] ?? 0
        const isShown = frame >= startFrame
        const rise = interpolate(
          frame,
          [startFrame, startFrame + RISE_DURATION_FRAMES],
          [RISE_DISTANCE_EM, 0],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: easings.outExpo,
          },
        )
        return (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: static words, never reordered.
            key={index}
            style={{
              display: 'inline-block',
              visibility: isShown ? 'visible' : 'hidden',
              translate: `0px ${rise}em`,
            }}
          >
            {index === 0 ? word : ` ${word}`}
          </span>
        )
      })}
    </div>
  )
}
