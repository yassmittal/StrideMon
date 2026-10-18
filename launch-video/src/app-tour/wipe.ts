// The App tour film's one transition: the reference's colour wipe, measured (reference.md, "The
// wipe"). The reference was keyframed at 25 fps, so the curve is 31 keyframes 0.04 s apart, 1.20 s
// in all: an exponential creep to 22%, a two-keyframe snap through the middle, and a long
// exponential settle. Every wipe in the film is this one function, never one of the theme's eases.

/** The edge's x as a share of the frame's width, keyframe by keyframe (wipe 1, frames 175–212). */
const WIPE_EDGE_KEYFRAMES = [
  0, 0.006, 0.011, 0.019, 0.031, 0.042, 0.056, 0.072, 0.094, 0.122, 0.161, 0.222, 0.489, 0.758,
  0.819, 0.858, 0.886, 0.906, 0.925, 0.939, 0.95, 0.961, 0.969, 0.975, 0.981, 0.986, 0.989, 0.992,
  0.994, 0.997, 1,
] as const

const KEYFRAME_SECONDS = 0.04
export const WIPE_DURATION_SECONDS = (WIPE_EDGE_KEYFRAMES.length - 1) * KEYFRAME_SECONDS
/** The snap's midpoint (keyframe 12, the edge at 49%): where a wipe sits on its beat. */
export const WIPE_SNAP_SECONDS = 12 * KEYFRAME_SECONDS

/** The tangent at each keyframe (Fritsch–Carlson), so the curve is smooth and never overshoots. */
const keyframeTangents: readonly number[] = buildMonotoneTangents(WIPE_EDGE_KEYFRAMES)

function buildMonotoneTangents(values: readonly number[]): number[] {
  const slopes = values.slice(1).map((value, index) => value - (values[index] ?? 0))
  const tangents = values.map((_value, index) => {
    if (index === 0) return slopes[0] ?? 0
    if (index === values.length - 1) return slopes[index - 1] ?? 0
    const before = slopes[index - 1] ?? 0
    const after = slopes[index] ?? 0
    // A flat or turning segment gets a flat tangent; otherwise the harmonic mean keeps it monotone.
    return before * after <= 0 ? 0 : (2 * before * after) / (before + after)
  })
  return tangents
}

/** The edge's x as a share of the width, `secondsIntoWipe` after the wipe starts (clamped). */
export function readWipeEdgeShare(secondsIntoWipe: number): number {
  if (secondsIntoWipe <= 0) return 0
  if (secondsIntoWipe >= WIPE_DURATION_SECONDS) return 1
  const position = secondsIntoWipe / KEYFRAME_SECONDS
  const index = Math.floor(position)
  const t = position - index
  const startValue = WIPE_EDGE_KEYFRAMES[index] ?? 1
  const endValue = WIPE_EDGE_KEYFRAMES[index + 1] ?? 1
  const startTangent = keyframeTangents[index] ?? 0
  const endTangent = keyframeTangents[index + 1] ?? 0
  // Cubic Hermite between the two keyframes.
  const t2 = t * t
  const t3 = t2 * t
  return (
    (2 * t3 - 3 * t2 + 1) * startValue +
    (t3 - 2 * t2 + t) * startTangent +
    (-2 * t3 + 3 * t2) * endValue +
    (t3 - t2) * endTangent
  )
}
