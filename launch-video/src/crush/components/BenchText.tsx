import { interpolate, useCurrentFrame } from 'remotion'
import { fontFamilies } from '../../theme'
import { crushContent } from '../content'
import { benchTimeline, REFERENCE_TO_FILM_SCALE } from '../timeline'

// The words over the bench shot, set as the reference sets its own: a small line that types in at
// about 2.6 letters a frame ("4-layers …", then "Love In Every …"), then the name in heavy capitals,
// both lines typing at once, each letter popping in from small. Sizes are the reference's, measured
// in its 720 px frame and scaled to the film.

const SMALL_FONT_SIZE = 37 * REFERENCE_TO_FILM_SCALE
const SMALL_CENTER_Y = 232 * REFERENCE_TO_FILM_SCALE
const SMALL_LETTERS_PER_FRAME = 2.6
const TITLE_FONT_SIZE = 86 * REFERENCE_TO_FILM_SCALE
const TITLE_TOP = 208 * REFERENCE_TO_FILM_SCALE
const TITLE_LETTER_FRAMES = 3
const TITLE_LETTERS_PER_FRAME = 1

function SmallLine({ text, startFrame, endFrame }: { text: string; startFrame: number; endFrame: number }) {
  const frame = useCurrentFrame()
  if (frame < startFrame || frame >= endFrame) return null
  const shownLetterCount = Math.min(text.length, Math.floor((frame - startFrame + 1) * SMALL_LETTERS_PER_FRAME))
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: SMALL_CENTER_Y - SMALL_FONT_SIZE * 0.6,
        textAlign: 'center',
        fontFamily: fontFamilies.crushCaption,
        fontWeight: 600,
        fontSize: SMALL_FONT_SIZE,
        lineHeight: 1.2,
        color: '#FFFFFF',
        textShadow: `0 ${SMALL_FONT_SIZE * 0.06}px ${SMALL_FONT_SIZE * 0.2}px rgba(0, 0, 0, 0.45)`,
        whiteSpace: 'pre',
      }}
    >
      {/* The rest of the line holds its place, so the typed part doesn't shift as it grows. */}
      <span>{text.slice(0, shownLetterCount)}</span>
      <span style={{ opacity: 0 }}>{text.slice(shownLetterCount)}</span>
    </div>
  )
}

function TitleLetter({ letter, appearFrame }: { letter: string; appearFrame: number }) {
  const frame = useCurrentFrame()
  const shown = interpolate(frame, [appearFrame, appearFrame + TITLE_LETTER_FRAMES], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <span
      style={{
        display: 'inline-block',
        opacity: shown,
        // In from small, up and to the right, as the reference's newest letter.
        scale: String(0.45 + 0.55 * shown),
        translate: `${(1 - shown) * TITLE_FONT_SIZE * 0.25}px ${-(1 - shown) * TITLE_FONT_SIZE * 0.2}px`,
        whiteSpace: 'pre',
      }}
    >
      {letter}
    </span>
  )
}

function Title() {
  const frame = useCurrentFrame()
  if (frame < benchTimeline.titleStartFrame) return null
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: TITLE_TOP,
        textAlign: 'center',
        fontFamily: fontFamilies.crushCaption,
        fontWeight: 800,
        fontSize: TITLE_FONT_SIZE,
        lineHeight: 0.98,
        letterSpacing: '-0.01em',
        color: '#FFFFFF',
        textShadow: `${TITLE_FONT_SIZE * 0.04}px ${TITLE_FONT_SIZE * 0.05}px 0 rgba(34, 34, 34, 0.62), 0 ${TITLE_FONT_SIZE * 0.08}px ${TITLE_FONT_SIZE * 0.2}px rgba(0, 0, 0, 0.3)`,
      }}
    >
      {crushContent.titleLines.map((line) => (
        <div key={line}>
          {[...line].map((letter, letterIndex) => (
            <TitleLetter
              // biome-ignore lint/suspicious/noArrayIndexKey: a line's letters never reorder
              key={letterIndex}
              letter={letter}
              appearFrame={benchTimeline.titleStartFrame + letterIndex / TITLE_LETTERS_PER_FRAME}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function BenchText() {
  return (
    <>
      <SmallLine text={crushContent.layers} startFrame={benchTimeline.layersTextStartFrame} endFrame={benchTimeline.layersTextEndFrame} />
      <SmallLine text={crushContent.love} startFrame={benchTimeline.loveTextStartFrame} endFrame={benchTimeline.loveTextEndFrame} />
      <Title />
    </>
  )
}
