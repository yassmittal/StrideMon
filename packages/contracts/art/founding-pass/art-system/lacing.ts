import {
  EYELET_INSET_UNITS,
  LACE_SLAT_LENGTH_UNITS,
  LACE_SLAT_OVERHANG_UNITS,
  LACE_SLAT_WIDTH_UNITS,
} from './frame'
import type { LaceLine, Point, Shape } from './types'

type LacePosition = {
  point: Point
  /** Unit vector along the lace line, toward the toe. */
  direction: Point
  /** Unit vector pointing into the shoe. */
  inward: Point
}

/** One slat per eyelet, at right angles to the lace line, reaching into the shoe. */
export function calculateLaceSlatShapes(laceLine: LaceLine): Shape[] {
  return calculateLacePositions(laceLine).map(({ point, direction, inward }) => {
    const halfWidth = LACE_SLAT_WIDTH_UNITS / 2
    const outerReach = -LACE_SLAT_OVERHANG_UNITS
    const innerReach = LACE_SLAT_LENGTH_UNITS - LACE_SLAT_OVERHANG_UNITS
    return [
      offsetPoint({ point, direction, inward, along: -halfWidth, across: outerReach }),
      offsetPoint({ point, direction, inward, along: halfWidth, across: outerReach }),
      offsetPoint({ point, direction, inward, along: halfWidth, across: innerReach }),
      offsetPoint({ point, direction, inward, along: -halfWidth, across: innerReach }),
    ]
  })
}

export function calculateEyeletCenters(laceLine: LaceLine): Point[] {
  return calculateLacePositions(laceLine).map(({ point, direction, inward }) =>
    offsetPoint({ point, direction, inward, along: 0, across: EYELET_INSET_UNITS }),
  )
}

/** Evenly spaced along the line, with half a gap at each end. */
function calculateLacePositions({ points, eyeletCount }: LaceLine): LacePosition[] {
  const segments = buildSegments(points)
  const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0)
  const positions: LacePosition[] = []
  for (let eyeletIndex = 0; eyeletIndex < eyeletCount; eyeletIndex++) {
    const distanceAlong = ((eyeletIndex + 0.5) / eyeletCount) * totalLength
    positions.push(findPositionAtDistance(segments, distanceAlong))
  }
  return positions
}

type Segment = { start: Point; direction: Point; length: number }

function buildSegments(points: readonly Point[]): Segment[] {
  const segments: Segment[] = []
  for (let pointIndex = 1; pointIndex < points.length; pointIndex++) {
    const start = points[pointIndex - 1]
    const end = points[pointIndex]
    if (start === undefined || end === undefined) continue
    const deltaX = end[0] - start[0]
    const deltaY = end[1] - start[1]
    const length = Math.hypot(deltaX, deltaY)
    segments.push({ start, direction: [deltaX / length, deltaY / length], length })
  }
  return segments
}

function findPositionAtDistance(segments: readonly Segment[], distanceAlong: number): LacePosition {
  let remainingDistance = distanceAlong
  for (const segment of segments) {
    if (remainingDistance <= segment.length) return buildPosition(segment, remainingDistance)
    remainingDistance -= segment.length
  }
  const lastSegment = segments.at(-1)
  if (lastSegment === undefined) throw new Error('A lace line needs at least two points')
  return buildPosition(lastSegment, lastSegment.length)
}

function buildPosition({ start, direction }: Segment, distanceAlong: number): LacePosition {
  const [directionX, directionY] = direction
  return {
    point: [start[0] + directionX * distanceAlong, start[1] + directionY * distanceAlong],
    direction,
    // The lace line runs toward the toe, so a quarter turn clockwise points into the shoe.
    inward: [-directionY, directionX],
  }
}

function offsetPoint({
  point,
  direction,
  inward,
  along,
  across,
}: LacePosition & { along: number; across: number }): Point {
  return [
    Math.round(point[0] + direction[0] * along + inward[0] * across),
    Math.round(point[1] + direction[1] * along + inward[1] * across),
  ]
}
