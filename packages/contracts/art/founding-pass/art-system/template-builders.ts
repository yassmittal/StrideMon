import { parseShape } from './geometry'
import type { OptionLayer, OptionValue, Panel, PanelRole, Rarity } from './types'

/** A panel from one or more `"x y, x y, …"` polygons. */
export function buildPanel(role: PanelRole, ...pointLists: string[]): Panel {
  return { role, shapes: pointLists.map(parseShape) }
}

export function buildOptionValue({
  key,
  label,
  rarity,
  layer,
  panels = [],
}: {
  key: string
  label: string
  rarity: Rarity
  layer: OptionLayer
  panels?: readonly Panel[]
}): OptionValue {
  return { key, label, rarity, layer, panels }
}
