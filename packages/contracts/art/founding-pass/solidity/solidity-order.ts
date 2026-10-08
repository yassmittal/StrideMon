import { COLOR_FAMILIES } from '../art-system/color-families'
import { COLORWAYS } from '../art-system/colorways'
import { LACE_COLORS } from '../art-system/lace-colors'
import { SNEAKER_TEMPLATES } from '../art-system/templates'
import type {
  DesignLayers,
  LaceColorKey,
  PanelRole,
  Rarity,
  SneakerTemplate,
} from '../art-system/types'

/**
 * The member order of the Solidity enums in `src/founding-pass-art/FoundingPassArtTypes.sol`,
 * where the generated data relies on it: the colourway rows are indexed by panel role, and the
 * design table stores lace colours and rarities as numbers. The build throws if the art system's
 * lace colours drift from this order. Panels and option layers are written by member name, so the
 * compiler catches a mismatch there.
 */
export const SOLIDITY_PANEL_ROLES: readonly PanelRole[] = [
  'upper',
  'toe',
  'overlay',
  'heel',
  'eyestay',
  'collar',
  'tongue',
  'trim',
  'soleAccent',
  'outsole',
  'midsole',
  'ink',
]
const SOLIDITY_LACE_COLORS: readonly LaceColorKey[] = ['cream', 'ink', 'tonal', 'lime']
export const SOLIDITY_RARITIES: readonly Rarity[] = ['common', 'uncommon', 'rare', 'legendary']

/** Every template has three option slots: the design table has one byte for each. */
const OPTION_SLOT_COUNT = 3

/** `soleAccent` → `SoleAccent`, the enum member's name. */
export function toSolidityMemberName(key: string): string {
  return `${key.charAt(0).toUpperCase()}${key.slice(1)}`
}

export function assertSolidityOrderMatches(): void {
  const laceColorKeys = LACE_COLORS.map((laceColor) => laceColor.key)
  if (laceColorKeys.join() !== SOLIDITY_LACE_COLORS.join()) {
    throw new Error(`Lace colours ${laceColorKeys.join()} no longer match the Solidity enum`)
  }
  for (const template of SNEAKER_TEMPLATES) {
    if (template.optionSlots.length !== OPTION_SLOT_COUNT) {
      throw new Error(`${template.key} has ${template.optionSlots.length} option slots, not 3`)
    }
  }
}

/**
 * The numbers a design's layers become: each an index into the art system's own lists, in the
 * order the generated Solidity data uses.
 */
export type EncodedLayers = {
  templateIndex: number
  colorFamilyIndex: number
  colorwayIndex: number
  optionValueIndexes: readonly number[]
  laceColorIndex: number
}

export function encodeLayers(layers: DesignLayers): EncodedLayers {
  const template = SNEAKER_TEMPLATES.find((candidate) => candidate.key === layers.templateKey)
  if (template === undefined) throw new Error(`Unknown template: ${layers.templateKey}`)
  return {
    templateIndex: findIndexOrThrow(SNEAKER_TEMPLATES, (candidate) => candidate === template),
    colorFamilyIndex: findIndexOrThrow(
      COLOR_FAMILIES,
      (colorFamily) => colorFamily.key === layers.colorFamilyKey,
    ),
    colorwayIndex: findIndexOrThrow(COLORWAYS, (colorway) => colorway.key === layers.colorwayKey),
    optionValueIndexes: encodeOptionValues(template, layers.optionValueKeys),
    laceColorIndex: findIndexOrThrow(SOLIDITY_LACE_COLORS, (key) => key === layers.laceColorKey),
  }
}

function encodeOptionValues(
  template: SneakerTemplate,
  optionValueKeys: Readonly<Record<string, string>>,
): number[] {
  return template.optionSlots.map((optionSlot) =>
    findIndexOrThrow(optionSlot.values, (value) => value.key === optionValueKeys[optionSlot.key]),
  )
}

function findIndexOrThrow<Item>(items: readonly Item[], isMatch: (item: Item) => boolean): number {
  const index = items.findIndex(isMatch)
  if (index === -1) throw new Error('No matching item in the art system')
  return index
}
