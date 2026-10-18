import { interpolate, useCurrentFrame } from 'remotion'
import { colors, easings } from '../../theme'

// The reference's two taps (reference.md, "The taps"), drawn in reel pixels inside the phone's
// screen, centred on the reel's own touch, so they move with the phone:
// - a button tap: a thick ring around the touch that opens out and fades, about 0.4 s;
// - a tab tap: a filled circle about 13% of the phone's width that pops, then opens into a ring as
//   it fades, about 0.3 s.
// Black on light screens, lime on dark ones.

const RING_DURATION_FRAMES = 24
const RING_START_DIAMETER_PIXELS = 70
const RING_END_DIAMETER_PIXELS = 150
const RING_STROKE_PIXELS = 11

const FILL_DURATION_FRAMES = 18
const FILL_DIAMETER_PIXELS = 0.13 * 720
/** The tab tap's circle is a tint, not a solid: the tab's icon stays readable under it. */
const FILL_OPACITY = 0.22

export type TapTone = 'onLight' | 'onDark'
export type TapKind = 'button' | 'tab'

export function TapRing({
  x,
  y,
  frame: tapFrame,
  tone,
  kind = 'button',
}: {
  x: number
  y: number
  frame: number
  tone: TapTone
  kind?: TapKind
}) {
  const frame = useCurrentFrame()
  const durationFrames = kind === 'tab' ? FILL_DURATION_FRAMES : RING_DURATION_FRAMES
  if (frame < tapFrame || frame > tapFrame + durationFrames) return null
  const progress = interpolate(frame, [tapFrame, tapFrame + durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const color = tone === 'onDark' ? colors.highlight : colors.textPrimary
  if (kind === 'tab') {
    const diameter =
      FILL_DIAMETER_PIXELS * interpolate(easings.outExpo(progress), [0, 1], [0.7, 1.25])
    // Solid at first; the middle clears as it opens, leaving a ring that fades.
    const ringShare = interpolate(progress, [0.3, 1], [1, 0.12], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
    const opacity = FILL_OPACITY * interpolate(progress, [0, 0.4, 1], [1, 1, 0])
    return (
      <div
        style={{
          position: 'absolute',
          left: x - diameter / 2,
          top: y - diameter / 2,
          width: diameter,
          height: diameter,
          borderRadius: diameter,
          border: `${(diameter / 2) * ringShare}px solid ${color}`,
          boxSizing: 'border-box',
          opacity,
        }}
      />
    )
  }
  const diameter = interpolate(
    easings.outExpo(progress),
    [0, 1],
    [RING_START_DIAMETER_PIXELS, RING_END_DIAMETER_PIXELS],
  )
  // Solid for its first half, then fades as it opens.
  const opacity = interpolate(progress, [0, 0.45, 1], [1, 1, 0])
  return (
    <div
      style={{
        position: 'absolute',
        left: x - diameter / 2,
        top: y - diameter / 2,
        width: diameter,
        height: diameter,
        borderRadius: diameter,
        border: `${RING_STROKE_PIXELS}px solid ${color}`,
        boxSizing: 'border-box',
        opacity,
      }}
    />
  )
}
