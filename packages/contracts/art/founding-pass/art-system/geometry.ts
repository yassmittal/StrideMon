import type { Point, Shape } from './types'

/**
 * Reads `"x y, x y, …"` into a shape. Templates are written this way so each polygon fits on
 * one line, close to the SVG it becomes.
 */
export function parseShape(pointList: string): Shape {
  return pointList.split(',').map((pointText): Point => {
    const [x, y, ...extraCoordinates] = pointText.trim().split(/\s+/).map(Number)
    if (
      x === undefined ||
      y === undefined ||
      extraCoordinates.length > 0 ||
      !Number.isInteger(x) ||
      !Number.isInteger(y)
    ) {
      throw new Error(`Not a whole-unit point: "${pointText}" in "${pointList}"`)
    }
    return [x, y]
  })
}

/** `M x y x y … Z` for each shape, so several polygons share one `<path>`. */
export function formatPathData(shapes: readonly Shape[]): string {
  return shapes.map((shape) => `M${shape.map(([x, y]) => `${x} ${y}`).join(' ')}Z`).join('')
}

/** Rotates a shape drawn around the origin, then moves it to `anchor`. Rounds to whole units. */
export function placeShape({
  shape,
  anchor,
  tiltDegrees,
}: {
  shape: Shape
  anchor: Point
  tiltDegrees: number
}): Shape {
  const tiltRadians = (tiltDegrees * Math.PI) / 180
  const cosine = Math.cos(tiltRadians)
  const sine = Math.sin(tiltRadians)
  return shape.map(([x, y]) => [
    Math.round(anchor[0] + x * cosine - y * sine),
    Math.round(anchor[1] + x * sine + y * cosine),
  ])
}
