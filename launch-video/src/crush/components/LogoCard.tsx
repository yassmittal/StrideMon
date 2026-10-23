import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { MARK_TILE_RADIUS_UNITS } from '../../app-tour/components/StrideMonMark'
import { colors, easings, fontFamilies, fontWeights, letterSpacings } from '../../theme'
import { crushContent } from '../content'
import { logoTimeline, REFERENCE_TO_FILM_SCALE } from '../timeline'

// The end card, built as the reference builds its logo: on white, the tile fades in at the centre,
// the StrideMon mark's three strokes draw one after another (website/src/app/icon.svg's own
// strokes), the tile edges right, then whips left as `StrideMon` and the link wipe in beside it.
// Sizes and places are the reference's, measured in its 720 px frame.

/** The reference's white. */
export const LOGO_BACKGROUND = '#FCFCFC'
const TILE_SIZE = 94 * REFERENCE_TO_FILM_SCALE
const TILE_CENTER_Y = 640 * REFERENCE_TO_FILM_SCALE
const TILE_START_CENTER_X = 365 * REFERENCE_TO_FILM_SCALE
const NUDGE_PIXELS = 8 * REFERENCE_TO_FILM_SCALE
/** The lockup ends centred: tile, gap, wordmark. */
const TILE_END_LEFT = 150 * REFERENCE_TO_FILM_SCALE
const WORDMARK_LEFT = 274 * REFERENCE_TO_FILM_SCALE
const WORDMARK_FONT_SIZE = 64 * REFERENCE_TO_FILM_SCALE
const WORDMARK_LINE_FONT_SIZE = 22 * REFERENCE_TO_FILM_SCALE

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

/** The mark's strokes on its 64-unit grid, in drawing order: the upper, the sole, the lime stripe. */
const MARK_STROKES = [
  { d: 'M14 36c-2-5-2-10-1-15 4 2 8 3 11 3l3-6 15 10c7 2 10 6 11 10', width: 3, color: colors.textOnDark, isRound: true },
  { d: 'M13 43h30c5 0 9-1 10-3 1-1 0-2-1-2L26 37c-5 0-9-1-12-1-1 3-1 6-1 7Z', width: 3, color: colors.textOnDark, isRound: false },
  { d: 'M15 32c8 1 16-2 22-6', width: 3.5, color: colors.highlight, isRound: true },
] as const

function Mark({ frame }: { frame: number }) {
  const strokeFrames = (logoTimeline.strokesEndFrame - logoTimeline.strokesStartFrame) / MARK_STROKES.length
  return (
    <svg width={TILE_SIZE} height={TILE_SIZE} viewBox="0 0 64 64" aria-hidden="true" style={{ display: 'block' }}>
      <rect width="64" height="64" rx={MARK_TILE_RADIUS_UNITS} fill={colors.darkPanel} />
      {MARK_STROKES.map((stroke, strokeIndex) => {
        const strokeStartFrame = logoTimeline.strokesStartFrame + strokeIndex * strokeFrames * 0.8
        const drawn = interpolate(frame, [strokeStartFrame, strokeStartFrame + strokeFrames * 1.2], [0, 1], {
          ...clamp,
          easing: easings.standard,
        })
        return (
          <path
            key={stroke.d}
            d={stroke.d}
            fill="none"
            stroke={stroke.color}
            strokeWidth={stroke.width}
            strokeLinecap={stroke.isRound ? 'round' : 'butt'}
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - drawn}
            opacity={drawn > 0 ? 1 : 0}
          />
        )
      })}
    </svg>
  )
}

export function LogoCard() {
  const frame = useCurrentFrame()
  const tileOpacity = interpolate(frame, [logoTimeline.tileInStartFrame, logoTimeline.tileInEndFrame], [0, 1], clamp)
  const nudge = interpolate(frame, [logoTimeline.nudgeStartFrame, logoTimeline.whipStartFrame], [0, NUDGE_PIXELS], {
    ...clamp,
    easing: easings.standard,
  })
  const whip = interpolate(frame, [logoTimeline.whipStartFrame, logoTimeline.whipEndFrame], [0, 1], {
    ...clamp,
    easing: easings.outExpo,
  })
  const tileStartLeft = TILE_START_CENTER_X - TILE_SIZE / 2 + nudge
  const tileLeft = tileStartLeft + (TILE_END_LEFT - tileStartLeft) * whip
  const wordmarkShown = interpolate(frame, [logoTimeline.wordmarkStartFrame, logoTimeline.wordmarkEndFrame], [0, 1], {
    ...clamp,
    easing: easings.emphasized,
  })
  const wordmarkLineShown = interpolate(frame, [logoTimeline.wordmarkStartFrame + 1, logoTimeline.wordmarkEndFrame + 1], [0, 1], {
    ...clamp,
    easing: easings.emphasized,
  })
  return (
    <AbsoluteFill style={{ backgroundColor: LOGO_BACKGROUND }}>
      <div style={{ position: 'absolute', left: tileLeft, top: TILE_CENTER_Y - TILE_SIZE / 2, opacity: tileOpacity }}>
        <Mark frame={frame} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: WORDMARK_LEFT + (1 - wordmarkShown) * 40 * REFERENCE_TO_FILM_SCALE,
          top: TILE_CENTER_Y - WORDMARK_FONT_SIZE * 0.66,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontFamily: fontFamilies.satoshi,
            fontWeight: fontWeights.medium,
            fontSize: WORDMARK_FONT_SIZE,
            letterSpacing: letterSpacings.displayLarge,
            lineHeight: 1,
            color: colors.textPrimary,
            clipPath: `inset(-20% ${(1 - wordmarkShown) * 100}% -20% 0)`,
          }}
        >
          {crushContent.wordmark}
        </div>
        <div
          style={{
            marginTop: WORDMARK_FONT_SIZE * 0.22,
            fontFamily: fontFamilies.satoshi,
            fontWeight: fontWeights.regular,
            fontSize: WORDMARK_LINE_FONT_SIZE,
            lineHeight: 1,
            color: colors.textPrimary,
            clipPath: `inset(-20% ${(1 - wordmarkLineShown) * 100}% -20% 0)`,
          }}
        >
          {crushContent.wordmarkLine}
        </div>
      </div>
    </AbsoluteFill>
  )
}
