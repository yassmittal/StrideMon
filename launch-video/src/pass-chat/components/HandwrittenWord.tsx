import { evolvePath } from '@remotion/paths'
import { useId } from 'react'
import { interpolate } from 'remotion'
import { easings } from '../../theme'
import { handwritingInkBounds, handwritingStrokeTimings } from '../handwriting'
import { handwritingGlyphs } from '../handwriting-glyphs'

// The handwritten word: each glyph's real outline (the script face's, from handwriting-glyphs.ts),
// filled, and seen only through a mask made of its pen strokes (handwriting.ts). Each stroke draws
// on along the pen's path, so the ink appears where the pen moves, in exactly the font's shape.
// Once a glyph's last stroke has finished, the mask comes off, so no sliver of ink is ever missed.

// Room round the ink, in units, so round caps and the font's overhangs are never clipped.
const INK_MARGIN_UNITS = 140

type HandwrittenInkProps = {
  color: string
  /** Frames since the pen first landed. Before 0 nothing shows; after the last stroke, all of it. */
  framesSincePenDown: number
}

/**
 * The word as SVG in its own units (1/1000 em, x 0 at the word's start, y 0 on the baseline):
 * scale and place it with a parent <g>.
 */
export function HandwrittenInk({ color, framesSincePenDown }: HandwrittenInkProps) {
  const maskIdPrefix = useId().replace(/:/g, '')
  const box = readHandwrittenWordBox(1000)
  return (
    <g>
      <defs>
        {handwritingGlyphs.map((_glyph, glyphIndex) => (
          <mask
            // biome-ignore lint/suspicious/noArrayIndexKey: the word's fixed glyph order.
            key={glyphIndex}
            id={`${maskIdPrefix}-${glyphIndex}`}
            maskUnits="userSpaceOnUse"
            // The whole box: a user-space mask's default region is measured from the origin (the
            // baseline), which would cut off every glyph above it.
            x={box.viewLeft}
            y={box.viewTop}
            width={box.viewWidth}
            height={box.viewHeight}
          >
            {handwritingStrokeTimings
              .filter((stroke) => stroke.glyphIndex === glyphIndex)
              .map((stroke) => {
                const progress = interpolate(
                  framesSincePenDown,
                  [stroke.startFrame, stroke.endFrame],
                  [0, 1],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.standard },
                )
                const { strokeDasharray, strokeDashoffset } = evolvePath(progress, stroke.pathData)
                return (
                  <path
                    key={stroke.pathData}
                    d={stroke.pathData}
                    fill="none"
                    stroke="white"
                    strokeWidth={stroke.width}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    // A round cap still paints a dot at zero length.
                    opacity={progress === 0 ? 0 : 1}
                  />
                )
              })}
          </mask>
        ))}
      </defs>
      {handwritingGlyphs.map((glyph, glyphIndex) => {
        const lastStrokeEndFrame = Math.max(
          ...handwritingStrokeTimings
            .filter((stroke) => stroke.glyphIndex === glyphIndex)
            .map((stroke) => stroke.endFrame),
        )
        const isFinished = framesSincePenDown >= lastStrokeEndFrame
        return (
          <path
            // biome-ignore lint/suspicious/noArrayIndexKey: the word's fixed glyph order.
            key={glyphIndex}
            d={glyph.pathData}
            fill={color}
            mask={isFinished ? undefined : `url(#${maskIdPrefix}-${glyphIndex})`}
          />
        )
      })}
    </g>
  )
}

/** The word in its own SVG at a font size (1 em in pixels), for placing on its own. */
export function HandwrittenWord({
  fontSize,
  ...inkProps
}: HandwrittenInkProps & { fontSize: number }) {
  const box = readHandwrittenWordBox(fontSize)
  return (
    <svg
      width={box.width}
      height={box.height}
      viewBox={box.viewBox}
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <HandwrittenInk {...inkProps} />
    </svg>
  )
}

/** The ink's box at a font size: its viewBox in units, its size in pixels, and its origin in it. */
export function readHandwrittenWordBox(fontSize: number) {
  const [left, top, right, bottom] = handwritingInkBounds
  const viewLeft = Math.min(0, left) - INK_MARGIN_UNITS
  const viewTop = top - INK_MARGIN_UNITS
  const viewWidth = right + INK_MARGIN_UNITS - viewLeft
  const viewHeight = bottom + INK_MARGIN_UNITS - viewTop
  const pixelsPerUnit = fontSize / 1000
  return {
    viewLeft,
    viewTop,
    viewWidth,
    viewHeight,
    viewBox: `${viewLeft} ${viewTop} ${viewWidth} ${viewHeight}`,
    width: viewWidth * pixelsPerUnit,
    height: viewHeight * pixelsPerUnit,
    /** From the box's left edge to the word's start (x 0), in pixels. */
    wordStartOffset: -viewLeft * pixelsPerUnit,
    /** From the box's top edge to the baseline (y 0), in pixels. */
    baselineOffset: -viewTop * pixelsPerUnit,
  }
}
