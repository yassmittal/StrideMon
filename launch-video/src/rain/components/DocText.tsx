import { gibberishLines, typedLines } from '../content'
import { AFTER_SCROLL_FRAME, SCROLL_START_FRAME, TYPING_START_FRAME } from '../timeline'
import {
  afterScrollDocMatrix,
  afterScrollViewportBottom,
  type CssMatrix3d,
  typingDocMatrices,
  typingViewportBottoms,
} from '../tracks'

// The rain's words on the reference's own Google Doc. They're drawn in the doc's own space (Arial,
// 100 units tall, line k's baseline at y 150 + 132.5 k, before the scroll), which the tracks carry
// onto each frame of the reference, and multiplied onto its paper in the ink's own colour, a
// little soft, as the phone saw the screen.

const DOC_WIDTH = 1100
const DOC_HEIGHT = 2100
const DOC_LEFT_X = 50
const DOC_FIRST_BASELINE_Y = 150
const DOC_LINE_PITCH = 132.5
/** How far the doc scrolls at the hit, and where page 2's lines land after it (measured on frame 400). */
const DOC_SCROLL_UNITS = 533
const YOURSELF_BASELINE_AFTER_SCROLL = 1345
const NOW_BASELINE_AFTER_SCROLL = 1476
/** The doc's window is this tall: its top is this far above its bottom (the dock). */
const VIEWPORT_HEIGHT_UNITS = 923
/** The reference's ink on its paper, as a multiply (frame 330: ink 33/31/35 on paper 237/234/238). */
const INK_MULTIPLY_COLOR = '#221F23'
/** The phone's own softness on the screen, in doc units (about 0.55 of the reference's pixels). */
const SOFTNESS_UNITS = 1.1
/** The share of a frame's camera move that smears the text (the shutter). */
const MOTION_SMEAR_SHARE = 0.35
/** Arial's advance widths per 1,000 units, for the letters the rain types (no kerning, as drawn). */
const ARIAL_ADVANCES: Record<string, number> = {
  W: 944,
  A: 667,
  I: 278,
  T: 611,
  L: 556,
  S: 667,
  Y: 667,
  O: 778,
  U: 722,
  R: 722,
  E: 667,
  F: 611,
  N: 722,
  '!': 278,
}
/** Docs' caret, in doc units: a hairline from below the baseline to above the caps. */
const CARET_WIDTH_UNITS = 3.5
const CARET_ABOVE_BASELINE_UNITS = 95
const CARET_BELOW_BASELINE_UNITS = 22

const waitlistBaseline = DOC_FIRST_BASELINE_Y + 5 * DOC_LINE_PITCH
const yourselfBaselineBeforeScroll = DOC_FIRST_BASELINE_Y + 6 * DOC_LINE_PITCH

type DocLine = { text: string; baseline: number }
type Caret = { x: number; baseline: number } | null

function readTypedText({ text, keyFrames }: { text: string; keyFrames: readonly number[] }, frame: number): string {
  return text.slice(0, keyFrames.filter((keyFrame) => keyFrame <= frame).length)
}

function measureText(text: string): number {
  return [...text].reduce((width, character) => width + (ARIAL_ADVANCES[character] ?? 600) / 10, 0)
}

/** The lines and the caret on a frame, in the layout before or after the scroll. */
function readLayout(frame: number, isAfterScroll: boolean, withGibberish: boolean): { lines: DocLine[]; caret: Caret } {
  const waitlist = readTypedText(typedLines.waitlist, frame)
  const yourself = readTypedText(typedLines.yourself, frame)
  const now = readTypedText(typedLines.now, frame)
  const yourselfBaseline = isAfterScroll ? YOURSELF_BASELINE_AFTER_SCROLL : yourselfBaselineBeforeScroll
  const lines: DocLine[] = [
    ...(withGibberish
      ? gibberishLines.map((text, index) => ({ text, baseline: DOC_FIRST_BASELINE_Y + index * DOC_LINE_PITCH }))
      : []),
    { text: waitlist, baseline: waitlistBaseline },
    { text: yourself, baseline: yourselfBaseline },
  ]
  let caret: Caret
  if (frame >= SCROLL_START_FRAME) {
    // The Enter that scrolls the doc: the caret is on the last line, before or after the scroll.
    lines.push({ text: now, baseline: NOW_BASELINE_AFTER_SCROLL })
    caret = isAfterScroll ? { x: DOC_LEFT_X + measureText(now), baseline: NOW_BASELINE_AFTER_SCROLL } : null
  } else if (yourself.length > 0) {
    caret = { x: DOC_LEFT_X + measureText(yourself), baseline: yourselfBaseline }
  } else {
    caret = { x: DOC_LEFT_X + measureText(waitlist), baseline: waitlistBaseline }
  }
  return { lines, caret }
}

/** A homography (as CSS matrix3d) applied to a doc point, in the reference's pixels. */
function projectPoint(matrix: CssMatrix3d, x: number, y: number): [number, number] {
  const w = (matrix[3] ?? 0) * x + (matrix[7] ?? 0) * y + (matrix[15] ?? 1)
  return [
    ((matrix[0] ?? 1) * x + (matrix[4] ?? 0) * y + (matrix[12] ?? 0)) / w,
    ((matrix[1] ?? 0) * x + (matrix[5] ?? 1) * y + (matrix[13] ?? 0)) / w,
  ]
}

/** The smear of the camera's move since the last frame, along the doc's x and y, in doc units. */
function readMotionSmear(frame: number): [number, number] {
  const previous = typingDocMatrices[Math.max(0, frame - 1 - TYPING_START_FRAME)]
  const current = typingDocMatrices[frame - TYPING_START_FRAME]
  if (previous === undefined || current === undefined || frame >= SCROLL_START_FRAME) return [0, 0]
  const [x0, y0] = projectPoint(current, 400, 900)
  const [x1, y1] = projectPoint(current, 500, 900)
  const [x2, y2] = projectPoint(current, 400, 1000)
  const [px, py] = projectPoint(previous, 400, 900)
  // The move in the reference's pixels, back into doc units along the doc's own axes.
  const unitsPerPixelX = 100 / Math.hypot(x1 - x0, y1 - y0)
  const unitsPerPixelY = 100 / Math.hypot(x2 - x0, y2 - y0)
  return [Math.abs(x0 - px) * unitsPerPixelX * MOTION_SMEAR_SHARE, Math.abs(y0 - py) * unitsPerPixelY * MOTION_SMEAR_SHARE]
}

type DocLayerProps = {
  matrix: CssMatrix3d
  viewportBottom: number
  lines: DocLine[]
  caret: Caret
  /** A shift of the doc's content inside its window (the scroll), in doc units. */
  scrollUnits?: number
  smearUnits: [number, number]
  opacity?: number
  idPrefix: string
}

function DocLayer({ matrix, viewportBottom, lines, caret, scrollUnits = 0, smearUnits, opacity = 1, idPrefix }: DocLayerProps) {
  const clipId = `${idPrefix}-window`
  const blurId = `${idPrefix}-soft`
  return (
    <svg
      width={DOC_WIDTH}
      height={DOC_HEIGHT}
      viewBox={`0 0 ${DOC_WIDTH} ${DOC_HEIGHT}`}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transformOrigin: '0 0',
        transform: `matrix3d(${matrix.join(', ')})`,
        mixBlendMode: 'multiply',
        opacity,
        overflow: 'visible',
      }}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={viewportBottom - VIEWPORT_HEIGHT_UNITS} width={DOC_WIDTH} height={VIEWPORT_HEIGHT_UNITS} />
        </clipPath>
        <filter id={blurId} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={`${SOFTNESS_UNITS + smearUnits[0]} ${SOFTNESS_UNITS + smearUnits[1]}`} />
        </filter>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <g filter={`url(#${blurId})`} transform={`translate(0 ${scrollUnits})`} fill={INK_MULTIPLY_COLOR}>
          {lines.map(({ text, baseline }) => (
            <text
              key={baseline}
              x={DOC_LEFT_X}
              y={baseline}
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize={100}
              style={{ fontKerning: 'none' }}
            >
              {text}
            </text>
          ))}
          {caret === null ? null : (
            <rect
              x={caret.x + 2}
              y={caret.baseline - CARET_ABOVE_BASELINE_UNITS}
              width={CARET_WIDTH_UNITS}
              height={CARET_ABOVE_BASELINE_UNITS + CARET_BELOW_BASELINE_UNITS}
            />
          )}
        </g>
      </g>
    </svg>
  )
}

/** The doc's words on one typing frame: the film's, where the reference typed its own. */
export function DocText({ frame }: { frame: number }) {
  const index = frame - TYPING_START_FRAME
  const matrix = typingDocMatrices[index]
  const viewportBottom = typingViewportBottoms[index]
  if (matrix === undefined || viewportBottom === undefined) return null

  if (frame < SCROLL_START_FRAME || frame >= AFTER_SCROLL_FRAME) {
    const isAfterScroll = frame >= AFTER_SCROLL_FRAME
    const { lines, caret } = readLayout(frame, isAfterScroll, false)
    return (
      <DocLayer
        matrix={matrix}
        viewportBottom={viewportBottom}
        lines={lines}
        caret={caret}
        smearUnits={readMotionSmear(frame)}
        idPrefix={`doc-${frame}`}
      />
    )
  }

  // The scroll: the laptop's frame is a blend of the doc leaving its old place and arriving at the
  // new one, both smeared along the scroll. The plate has every line wiped, so the gibberish is
  // drawn here too.
  const progress = (frame - SCROLL_START_FRAME + 1) / (AFTER_SCROLL_FRAME - SCROLL_START_FRAME + 1)
  const scrollSmear: [number, number] = [0, 26]
  const before = readLayout(frame, false, true)
  const after = readLayout(frame, true, true)
  return (
    <>
      <DocLayer
        matrix={matrix}
        viewportBottom={viewportBottom}
        lines={before.lines}
        caret={null}
        scrollUnits={-DOC_SCROLL_UNITS * progress * progress}
        smearUnits={scrollSmear}
        opacity={1 - progress}
        idPrefix={`doc-${frame}-leaving`}
      />
      <DocLayer
        matrix={afterScrollDocMatrix}
        viewportBottom={afterScrollViewportBottom}
        lines={after.lines}
        caret={null}
        scrollUnits={DOC_SCROLL_UNITS * (1 - progress) * (1 - progress)}
        smearUnits={scrollSmear}
        opacity={progress}
        idPrefix={`doc-${frame}-arriving`}
      />
    </>
  )
}
