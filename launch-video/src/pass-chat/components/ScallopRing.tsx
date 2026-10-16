import { colors } from '../../theme'

// The ring that closes in on "This" (scene 6): a circle with soft waves, r + a·sin(12θ), stroked in
// flat lime on black. No blur, no glow.

const WAVE_COUNT = 12
const POINT_COUNT = 480

type ScallopRingProps = {
  centreX: number
  centreY: number
  radius: number
  /** The waves' height, as a share of the radius. */
  amplitudeRatio: number
  strokeWidth: number
  rotateDegrees: number
  opacity: number
}

export function ScallopRing({
  centreX,
  centreY,
  radius,
  amplitudeRatio,
  strokeWidth,
  rotateDegrees,
  opacity,
}: ScallopRingProps) {
  const rotation = (rotateDegrees * Math.PI) / 180
  const points = Array.from({ length: POINT_COUNT }, (_, pointIndex) => {
    const angle = (pointIndex / POINT_COUNT) * 2 * Math.PI
    const pointRadius = radius * (1 + amplitudeRatio * Math.sin(WAVE_COUNT * angle))
    const x = centreX + pointRadius * Math.cos(angle + rotation)
    const y = centreY + pointRadius * Math.sin(angle + rotation)
    return `${x.toFixed(2)} ${y.toFixed(2)}`
  })
  return (
    <path
      d={`M ${points.join(' L ')} Z`}
      fill="none"
      stroke={colors.highlight}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      opacity={opacity}
    />
  )
}
