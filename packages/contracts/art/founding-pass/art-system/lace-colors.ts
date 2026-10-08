import type { LaceColor, LaceColorKey } from './types'

/** Only laced passes show their laces. Lime is StrideMon's own colour, so it's the uncommon one. */
export const LACE_COLORS: readonly LaceColor[] = [
  { key: 'cream', label: 'Cream', rarity: 'common' },
  { key: 'ink', label: 'Ink', rarity: 'common' },
  { key: 'tonal', label: 'Tonal', rarity: 'common' },
  { key: 'lime', label: 'Lime', rarity: 'uncommon' },
]

export function readLaceColor(laceColorKey: LaceColorKey): LaceColor {
  const laceColor = LACE_COLORS.find((candidate) => candidate.key === laceColorKey)
  if (laceColor === undefined) throw new Error(`Unknown lace colour: ${laceColorKey}`)
  return laceColor
}
