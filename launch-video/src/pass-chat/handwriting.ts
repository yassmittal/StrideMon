import { handwritingGlyphs } from './handwriting-glyphs'

// The pen's path for the handwritten word, drawn by hand over the font's own outline
// (handwriting-glyphs.ts, made by scripts/build-pass-chat-handwriting.py), in the same frame:
// 1 unit = 1/1000 em, y down from the baseline. Each stroke is a thick line, used as a mask over
// its glyph's filled outline and drawn on with evolvePath, so the ink appears along the pen's path
// in exactly the font's shape (docs/pass-chat-video-prompt.md §4).
//
// The order is a hand's: the i's stem, the s, the n (down the leg, back up it and over the arch),
// then back to dot the i, the apostrophe, the t's stem and last the t's cross.

export type HandwritingStroke = {
  /** Which glyph's outline this stroke reveals: the index in handwritingGlyphs. */
  glyphIndex: number
  /** The pen's centreline, as SVG path data. */
  pathData: string
  /** The nib's width in units: wide enough that the strokes cover the whole glyph. */
  width: number
  /** The pen lands this many frames after the previous stroke ends (a lift between strokes). */
  liftFrames: number
  /** How long the stroke takes to draw. */
  durationFrames: number
}

const GLYPH_INDEX = { i: 0, s: 1, n: 2, apostrophe: 3, t: 4 } as const

export const handwritingStrokes: readonly HandwritingStroke[] = [
  {
    glyphIndex: GLYPH_INDEX.i,
    pathData: 'M 250 -445 C 218 -350 180 -240 140 -110 C 122 -40 105 15 80 50',
    width: 270,
    liftFrames: 0,
    durationFrames: 4,
  },
  {
    glyphIndex: GLYPH_INDEX.s,
    pathData:
      'M 762 -412 C 730 -470 640 -480 560 -468 C 480 -455 440 -400 445 -330 C 450 -260 540 -255 625 -220 C 705 -185 735 -120 720 -55 C 700 15 610 30 500 22 C 420 16 360 0 322 -22',
    width: 270,
    liftFrames: 1,
    durationFrames: 7,
  },
  {
    glyphIndex: GLYPH_INDEX.n,
    pathData:
      'M 1043 -416 C 1015 -300 985 -150 950 20 C 1000 -80 1070 -210 1160 -310 C 1250 -400 1370 -450 1435 -415 C 1490 -385 1420 -300 1386 -240 C 1350 -170 1318 -90 1300 15',
    width: 250,
    liftFrames: 1,
    durationFrames: 7,
  },
  {
    glyphIndex: GLYPH_INDEX.i,
    pathData: 'M 285 -655 L 340 -642',
    width: 200,
    liftFrames: 2,
    durationFrames: 2,
  },
  {
    glyphIndex: GLYPH_INDEX.apostrophe,
    pathData: 'M 1665 -772 C 1630 -700 1592 -600 1548 -506',
    width: 230,
    liftFrames: 1,
    durationFrames: 3,
  },
  {
    glyphIndex: GLYPH_INDEX.t,
    pathData: 'M 2115 -772 C 2050 -620 1985 -420 1925 -230 C 1885 -110 1855 -20 1830 52',
    width: 255,
    liftFrames: 1,
    durationFrames: 4,
  },
  {
    glyphIndex: GLYPH_INDEX.t,
    pathData: 'M 1758 -398 C 1850 -430 1950 -460 2040 -475 C 2120 -488 2180 -490 2215 -488',
    width: 175,
    liftFrames: 1,
    durationFrames: 3,
  },
]

export type HandwritingStrokeTiming = HandwritingStroke & { startFrame: number; endFrame: number }

/** Each stroke's start and end, in frames from the pen's first landing. */
export const handwritingStrokeTimings: readonly HandwritingStrokeTiming[] = (() => {
  let cursor = 0
  return handwritingStrokes.map((stroke) => {
    const startFrame = cursor + stroke.liftFrames
    cursor = startFrame + stroke.durationFrames
    return { ...stroke, startFrame, endFrame: cursor }
  })
})()

/** From the pen's first landing to its last lift. */
export const HANDWRITING_DURATION_FRAMES = handwritingStrokeTimings.at(-1)?.endFrame ?? 0

/** The ink's extent, for laying the word out: [left, top, right, bottom] in units. */
export const handwritingInkBounds: readonly [number, number, number, number] = [
  Math.min(...handwritingGlyphs.map((glyph) => glyph.bounds[0])),
  Math.min(...handwritingGlyphs.map((glyph) => glyph.bounds[1])),
  Math.max(...handwritingGlyphs.map((glyph) => glyph.bounds[2])),
  Math.max(...handwritingGlyphs.map((glyph) => glyph.bounds[3])),
]
