import type { Colorway, ShadedRole, ShadeIndex } from './types'

type ShadeRow = readonly [
  upper: ShadeIndex,
  toe: ShadeIndex,
  overlay: ShadeIndex,
  heel: ShadeIndex,
  eyestay: ShadeIndex,
  collar: ShadeIndex,
  tongue: ShadeIndex,
  trim: ShadeIndex,
  soleAccent: ShadeIndex,
  outsole: ShadeIndex,
]

/**
 * Ten designed colourways, each a fixed map from panel role to shade (0 lightest, 4 darkest).
 * Fully random shades looked messy in the prototype, so every colourway keeps the collar and
 * outsole dark to ground the shoe, and gives the big panels clear steps between them.
 */
export const COLORWAYS: readonly Colorway[] = [
  // Each row: upper, toe, overlay, heel, eyestay, collar, tongue, trim, sole accent, outsole.
  buildColorway('dawn', 'Dawn', [0, 1, 2, 1, 2, 3, 1, 3, 2, 3]),
  buildColorway('day', 'Day', [1, 0, 3, 3, 4, 4, 0, 2, 2, 4]),
  buildColorway('flare', 'Flare', [2, 1, 4, 4, 4, 4, 1, 0, 2, 4]),
  buildColorway('dusk', 'Dusk', [3, 2, 1, 4, 1, 4, 2, 0, 1, 4]),
  buildColorway('night', 'Night', [4, 3, 2, 3, 2, 3, 2, 1, 2, 3]),
  buildColorway('frost', 'Frost', [0, 0, 2, 2, 3, 3, 0, 4, 2, 3]),
  buildColorway('eclipse', 'Eclipse', [0, 4, 4, 4, 4, 4, 0, 2, 2, 4]),
  buildColorway('haze', 'Haze', [2, 1, 0, 1, 3, 4, 0, 3, 1, 4]),
  buildColorway('storm', 'Storm', [2, 4, 1, 4, 3, 4, 1, 0, 2, 4]),
  buildColorway('drift', 'Drift', [1, 4, 2, 0, 4, 3, 0, 3, 2, 4]),
]

export function readColorway(colorwayKey: string): Colorway {
  const colorway = COLORWAYS.find((candidate) => candidate.key === colorwayKey)
  if (colorway === undefined) throw new Error(`Unknown colourway: ${colorwayKey}`)
  return colorway
}

function buildColorway(key: string, label: string, shadeRow: ShadeRow): Colorway {
  const [upper, toe, overlay, heel, eyestay, collar, tongue, trim, soleAccent, outsole] = shadeRow
  const shadeByRole: Record<ShadedRole, ShadeIndex> = {
    upper,
    toe,
    overlay,
    heel,
    eyestay,
    collar,
    tongue,
    trim,
    soleAccent,
    outsole,
  }
  return { key, label, shadeByRole }
}
