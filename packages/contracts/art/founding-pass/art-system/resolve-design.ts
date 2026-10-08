import { readColorFamily } from './color-families'
import { readColorway } from './colorways'
import { readLaceColor } from './lace-colors'
import { readSneakerTemplate } from './templates'
import type { DesignLayers, OptionValue, Rarity, SneakerTemplate } from './types'

const RARITY_ORDER: readonly Rarity[] = ['common', 'uncommon', 'rare', 'legendary']

/**
 * "Ember Runner Dusk". Unique because no two designs share a template, family and colourway. A
 * Legendary (Prism, one per template) takes its template's hand-picked name instead (D-041).
 */
export function buildDesignName(layers: DesignLayers): string {
  const template = readSneakerTemplate(layers.templateKey)
  const colorFamily = readColorFamily(layers.colorFamilyKey)
  if (colorFamily.rarity === 'legendary') return template.legendaryName
  const colorway = readColorway(layers.colorwayKey)
  return `${colorFamily.label} ${template.label} ${colorway.label}`
}

/** A pass is as rare as its rarest layer. */
export function calculateDesignRarity(layers: DesignLayers): Rarity {
  const template = readSneakerTemplate(layers.templateKey)
  const layerRarities = [
    readColorFamily(layers.colorFamilyKey).rarity,
    readLaceColor(layers.laceColorKey).rarity,
    ...readOptionValues(template, layers.optionValueKeys).map((optionValue) => optionValue.rarity),
  ]
  return layerRarities.reduce((rarest, rarity) =>
    RARITY_ORDER.indexOf(rarity) > RARITY_ORDER.indexOf(rarest) ? rarity : rarest,
  )
}

export function compareRarity(first: Rarity, second: Rarity): number {
  return RARITY_ORDER.indexOf(first) - RARITY_ORDER.indexOf(second)
}

function readOptionValues(
  template: SneakerTemplate,
  optionValueKeys: Readonly<Record<string, string>>,
): OptionValue[] {
  return template.optionSlots.map((optionSlot) => {
    const optionValue = optionSlot.values.find(
      (candidate) => candidate.key === optionValueKeys[optionSlot.key],
    )
    if (optionValue === undefined) {
      throw new Error(
        `${template.key} has no value "${optionValueKeys[optionSlot.key]}" for ${optionSlot.key}`,
      )
    }
    return optionValue
  })
}
